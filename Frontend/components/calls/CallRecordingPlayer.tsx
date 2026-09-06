"use client";

import { useRef, useState } from "react";
import styles from "./CallPlayer.module.css";

const clock = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;

export function CallRecordingPlayer({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null), [playing, setPlaying] = useState(false), [current, setCurrent] = useState(0), [duration, setDuration] = useState(0), [speed, setSpeed] = useState(1), [error, setError] = useState(false);
  async function toggle() {
    if (!audio.current || error) return;
    if (playing) audio.current.pause();
    else try { await audio.current.play(); } catch { setError(true); }
  }
  function changeSpeed() { const next = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1; setSpeed(next); if (audio.current) audio.current.playbackRate = next; }
  return <section className={`${styles.player} ${styles.compact}`}><audio ref={audio} src={src} preload="metadata" onLoadedMetadata={() => { setError(false); setDuration(audio.current?.duration ?? 0); }} onError={() => setError(true)} onTimeUpdate={() => setCurrent(audio.current?.currentTime ?? 0)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}/><div className={styles.top}><span className="eyebrow">CALL RECORDING</span><span className={styles.live}>{error ? "UNAVAILABLE" : playing ? "PLAYING" : "READY"}</span></div><div className={styles.wave}>{Array.from({ length: 32 }, (_, index) => <i key={index} style={{ height: `${18 + (index * 17) % 42}%` }}/>)}</div><div className={styles.controls}><button className={styles.play} onClick={toggle} disabled={error} aria-label={playing ? "Pause" : "Play"}>{playing ? "Ⅱ" : "▶"}</button><span>{clock(current)}</span><input aria-label="Call progress" type="range" min="0" max={duration || 0} value={current} disabled={error} onChange={event => { const value = Number(event.target.value); setCurrent(value); if (audio.current) audio.current.currentTime = value; }}/><span>{clock(duration)}</span><button className="button" onClick={changeSpeed} disabled={error}>{speed}×</button></div></section>;
}
