"use client";

import Link from "next/link";
import { ConsoleLogger, DefaultDeviceController, DefaultMeetingSession, LogLevel, MeetingSessionConfiguration } from "amazon-chime-sdk-js";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import styles from "./VoiceAssistant.module.css";

type State = "ready" | "listening" | "processing" | "speaking";

function MuteIcon({ muted }: { muted: boolean }) { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 10v4h4l5 4V6l-5 4H5Z"/>{muted && <path d="m4 4 16 16M16 10.5a4 4 0 0 1 0 3"/>}</svg>; }
function ChatIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H9l-4 4V5Z"/><path d="M9 10h6"/></svg>; }
function EndIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.8 9.4c4.5-3.3 9.9-3.3 14.4 0l-2.1 3.2-2.9-1.3v2.2a1.2 1.2 0 0 1-1.2 1.2h-2a1.2 1.2 0 0 1-1.2-1.2v-2.2l-2.9 1.3-2.1-3.2Z"/></svg>; }

function pcmBlob(chunks: Float32Array[]) {
  const samples = chunks.reduce((total, chunk) => total + chunk.length, 0), buffer = new ArrayBuffer(samples * 2), view = new DataView(buffer);
  let offset = 0;
  for (const chunk of chunks) for (const value of chunk) { const sample = Math.max(-1, Math.min(1, value)); view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true); offset += 2; }
  return new Blob([buffer], { type: "audio/pcm" });
}

export function VoiceAssistant() {
  const [state, setState] = useState<State>("ready"), [muted, setMuted] = useState(false), [text, setText] = useState("Press start and speak naturally.");
  const stream = useRef<MediaStream | null>(null), conversation = useRef<string | null>(null), meeting = useRef<DefaultMeetingSession | null>(null), audio = useRef<HTMLAudioElement | null>(null), callRecorder = useRef<MediaRecorder | null>(null), recording = useRef<Blob[]>([]), mixContext = useRef<AudioContext | null>(null);
  const silenceTimer = useRef<number | null>(null), sound = useRef<HTMLAudioElement | null>(null), capture = useRef<AudioContext | null>(null), processor = useRef<ScriptProcessorNode | null>(null), samples = useRef<Float32Array[]>([]), ending = useRef(false);
  useEffect(() => () => {
    if (silenceTimer.current) window.clearInterval(silenceTimer.current);
    sound.current?.pause();
    processor.current?.disconnect();
    if (capture.current?.state !== "closed") void capture.current?.close();
    if (mixContext.current?.state !== "closed") void mixContext.current?.close();
    meeting.current?.audioVideo.stop();
    stream.current?.getTracks().forEach(track => track.stop());
  }, []);

  async function start() {
    ending.current = false;
    stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    const session = await fetch("/api/voice/session", { method: "POST" }).then(r => r.json());
    conversation.current = session.conversation_id;
    const mix = new AudioContext(), destination = mix.createMediaStreamDestination(), microphone = mix.createMediaStreamSource(stream.current); mixContext.current = mix; await mix.resume();
    microphone.connect(destination); audio.current = new Audio(); const assistant = mix.createMediaElementSource(audio.current); assistant.connect(destination); assistant.connect(mix.destination);
    recording.current = []; callRecorder.current = new MediaRecorder(destination.stream, { mimeType: "audio/webm" }); callRecorder.current.ondataavailable = event => { if (event.data.size) recording.current.push(event.data); };
    callRecorder.current.start();
    const logger = new ConsoleLogger("CallDine", LogLevel.ERROR);
    meeting.current = new DefaultMeetingSession(new MeetingSessionConfiguration(session.meeting, session.attendee), logger, new DefaultDeviceController(logger));
    await meeting.current.audioVideo.startAudioInput(stream.current); meeting.current.audioVideo.start(); listen();
  }
  function listen() {
    if (!stream.current || muted) return;
    setState("listening"); setText("Listening — tell me what you would like.");
    const context = new AudioContext(), analyser = context.createAnalyser(), source = context.createMediaStreamSource(stream.current), node = context.createScriptProcessor(4096, 1, 1);
    capture.current = context; processor.current = node; samples.current = [];
    source.connect(analyser); source.connect(node); node.connect(context.destination); node.onaudioprocess = event => samples.current.push(new Float32Array(event.inputBuffer.getChannelData(0))); analyser.fftSize = 512;
    const values = new Uint8Array(analyser.frequencyBinCount); let heard = false, quietSince = 0;
    silenceTimer.current = window.setInterval(() => { analyser.getByteTimeDomainData(values); const level = values.reduce((sum, value) => sum + Math.abs(value - 128), 0) / values.length; if (level > 4) { heard = true; quietSince = 0; } else if (heard && !quietSince) quietSince = Date.now(); else if (quietSince && Date.now() - quietSince > 1800) finishListening(context.sampleRate); }, 120);
  }
  function finishListening(sampleRate: number) {
    if (silenceTimer.current) window.clearInterval(silenceTimer.current); silenceTimer.current = null;
    processor.current?.disconnect(); if (processor.current) processor.current.onaudioprocess = null; processor.current = null;
    const context = capture.current; capture.current = null; if (context && context.state !== "closed") void context.close();
    const blob = pcmBlob(samples.current); samples.current = []; if (blob.size) process(blob, sampleRate);
  }
  async function process(blob: Blob, sampleRate: number) {
    setState("processing"); setText("Working on your request…"); startProcessingSound();
    try {
      const form = new FormData(); form.append("file", blob, "voice.pcm"); form.append("sample_rate", String(sampleRate));
      const transcriptResponse = await fetch("/api/voice/transcribe", { method: "POST", body: form });
      if (!transcriptResponse.ok) throw new Error("Transcription failed");
      const transcript = await transcriptResponse.json();
      if (!transcript.text || !conversation.current) { stopProcessingSound(); return listen(); }
      const response = await fetch(`/api/conversations/${conversation.current}/messages/stream`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: transcript.text }) });
      if (!response.ok || !response.body) throw new Error("Assistant request failed");
      const reader = response.body.getReader(), decoder = new TextDecoder(); let answer = "";
      while (true) { const { value, done } = await reader.read(); if (done) break; answer += decoder.decode(value, { stream: true }); setText(answer); }
      if (!answer.trim()) throw new Error("Assistant returned no response");
      stopProcessingSound(); setState("speaking"); setText(answer);
      await playSpeech(answer, /\b(?:order|reservation)\b[\s\w]{0,24}\bconfirmed\b/i.test(answer));
    } catch {
      stopProcessingSound(); setText("I could not process that. Please try again."); listen();
    }
  }
  async function playSpeech(text: string, endAfter: boolean) {
    const response = await fetch("/api/voice/speech", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    if (!response.ok) throw new Error("Speech request failed");
    if (!audio.current) return;
    const afterSpeech = () => { if (endAfter) void end(); else listen(); };
    const url = URL.createObjectURL(await response.blob());
    audio.current.pause(); audio.current.src = url; audio.current.volume = 1;
    audio.current.onended = () => { URL.revokeObjectURL(url); afterSpeech(); };
    return audio.current.play();
  }
  function startProcessingSound() { stopProcessingSound(); sound.current = new Audio("/sounds/thinking.mp3"); sound.current.loop = true; sound.current.volume = .22; void sound.current.play().catch(() => {}); }
  function stopProcessingSound() { if (sound.current) { sound.current.pause(); sound.current.currentTime = 0; sound.current = null; } }
  async function saveRecording() {
    const recorder = callRecorder.current;
    if (recorder?.state === "recording") await new Promise<void>(resolve => { recorder.addEventListener("stop", () => resolve(), { once: true }); recorder.stop(); });
    if (!conversation.current || !recording.current.length) throw new Error("No call audio was captured");
    const form = new FormData(), file = new Blob(recording.current, { type: recorder?.mimeType || "audio/webm" }); form.append("file", file, "call.webm");
    const response = await fetch(`/api/voice/recording/${conversation.current}`, { method: "POST", body: form });
    if (!response.ok) throw new Error("Call recording could not be saved");
    recording.current = [];
  }
  async function end() {
    if (ending.current) return; ending.current = true;
    if (silenceTimer.current) window.clearInterval(silenceTimer.current); stopProcessingSound(); processor.current?.disconnect(); audio.current?.pause();
    const listeningContext = capture.current; capture.current = null; if (listeningContext && listeningContext.state !== "closed") await listeningContext.close();
    try { await saveRecording(); } catch {}
    const mixedContext = mixContext.current; mixContext.current = null; if (mixedContext && mixedContext.state !== "closed") await mixedContext.close();
    meeting.current?.audioVideo.stop(); stream.current?.getTracks().forEach(track => track.stop()); setState("ready"); setText("Call ended.");
  }
  function toggleMute() { setMuted(value => { const next = !value; stream.current?.getAudioTracks().forEach(track => track.enabled = !next); if (!next) listen(); return next; }); }
  const label = state === "ready" ? "Ready" : state === "processing" ? "Processing" : state === "speaking" ? "Speaking" : "Listening";
  return <div className={styles.page}><div className={styles.card}><div className={styles.status}><i className={styles.statusDot}/><span>{label.toUpperCase()}</span></div><div className={styles.orb}><i className={`${styles.halo} ${state === "ready" ? styles.haloQuiet : ""}`}/><i className={`${styles.halo} ${styles.haloSecond} ${state === "ready" ? styles.haloQuiet : ""}`}/><div className={styles.soundWaves}>{Array.from({ length: 3 }, (_, i) => <i key={i} className={`${styles.soundWave} ${state === "ready" ? styles.waveQuiet : ""}`} style={{ animationDelay: `${i * .65}s` }}/>)}</div><div className={styles.logoOrb}><Logo compact/></div></div><div className={styles.copy}><div className={styles.title}>{state === "ready" ? "Start a voice call" : label}</div><div className={styles.description}>{text}</div></div><div className={styles.waveform}>{Array.from({ length: 32 }, (_, i) => <i key={i} className={`${styles.bar} ${styles[state === "ready" ? "connecting" : state]}`} style={{ height: 12 + (i % 7) * 7, animationDelay: `${i * 55}ms` }}/>)}</div><div className={styles.actions}>{state === "ready" ? <button className={styles.start} onClick={start}>Start voice call</button> : <><button className={styles.secondary} onClick={toggleMute} aria-label={muted ? "Unmute microphone" : "Mute microphone"} title={muted ? "Unmute" : "Mute"}><MuteIcon muted={muted}/></button><Link href="/app/chat" className={styles.secondary} aria-label="Open chat" title="Chat"><ChatIcon/></Link><button className={styles.end} onClick={end} aria-label="End call" title="End call"><EndIcon/></button></>}</div></div></div>;
}
