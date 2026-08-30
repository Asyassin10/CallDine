"use client";

import { useEffect, useState } from "react";
import styles from "./CallPlayer.module.css";

function seconds(value: string) {
  const [minutes, remaining] = value.split(":").map(Number);
  return minutes * 60 + remaining;
}

function clock(value: number) {
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export function CallPlayer({ duration }: { duration: string }) {
  const total = seconds(duration);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(32);
  const [speed, setSpeed] = useState("1×");

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setProgress(value => value >= 100 ? 0 : value + 1), 500);
    return () => window.clearInterval(timer);
  }, [playing]);

  return <section className={styles.player}><div className={styles.top}><div><span className="eyebrow">CALL RECORDING</span><h2>Replay conversation</h2><p>Demo player · audio will be stored later.</p></div><span className={styles.live}>{playing ? "PLAYING" : "READY"}</span></div><div className={styles.wave}>{Array.from({ length: 48 }, (_, index) => <i key={index} style={{ height: `${18 + (index * 17) % 42}%` }} />)}</div><div className={styles.controls}><button className={styles.play} onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Play"}>{playing ? "Ⅱ" : "▶"}</button><span>{clock(Math.round(total * progress / 100))}</span><input aria-label="Call progress" type="range" min="0" max="100" value={progress} onChange={event => setProgress(Number(event.target.value))}/><span>{duration}</span><button className="button" onClick={() => setSpeed(speed === "1×" ? "1.5×" : speed === "1.5×" ? "2×" : "1×")}>{speed}</button></div></section>;
}
