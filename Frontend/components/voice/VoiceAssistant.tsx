"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./VoiceAssistant.module.css";

type CallState = "connecting" | "listening" | "speaking" | "processing";

const states: Array<{id:CallState;label:string;title:string;description:string;color:string}> = [
  {id:"connecting",label:"Connecting",title:"Connecting to Osteria Vento",description:"Placing a secure line to the restaurant’s CallDine assistant.",color:"#C7C3B9"},
  {id:"listening",label:"Listening",title:"Listening",description:"Go ahead — order, book a table, or ask what the kitchen recommends tonight.",color:"#D49B52"},
  {id:"speaking",label:"Speaking",title:"Assistant speaking",description:"“The truffle tagliatelle is the kitchen’s pick tonight. Shall I add one?”",color:"#7FA08A"},
  {id:"processing",label:"Processing",title:"Working on it",description:"Checking table availability for four at 20:30 and holding your order.",color:"#9A93E0"},
];

export function VoiceAssistant(){
  const [seconds,setSeconds]=useState(24);
  const [callState,setCallState]=useState<CallState>("listening");
  const [muted,setMuted]=useState(false);
  useEffect(()=>{const timer=setInterval(()=>setSeconds(value=>value+1),1000);return()=>clearInterval(timer)},[]);
  const current=states.find(state=>state.id===callState)??states[1];
  const clock=`${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
  return <div className={styles.page}><div className={styles.card}>
    <div className={styles.status}><i className={styles.statusDot} style={{background:current.color}}/><span>{current.label.toUpperCase()} · {clock}</span></div>
    <div className={styles.states}>{states.map(state=><button key={state.id} className={callState===state.id?styles.stateActive:styles.stateButton} onClick={()=>setCallState(state.id)}>{state.label}</button>)}</div>
    <div className={styles.orb}><i className={`${styles.halo} ${callState!=="listening"?styles.haloQuiet:""}`}/><i className={`${styles.halo} ${styles.haloSecond} ${callState!=="listening"?styles.haloQuiet:""}`}/><div className={styles.logoOrb}>
      <svg viewBox="0 0 64 64" width="42" height="42" aria-hidden="true"><circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray="126 32" transform="rotate(35 32 32)"/><rect x="19.5" y="21" width="5" height="15" rx="2.5" fill="currentColor"/><rect x="29.5" y="18" width="5" height="27" rx="2.5" fill="currentColor"/><rect x="39.5" y="21" width="5" height="15" rx="2.5" fill="currentColor"/></svg>
    </div></div>
    <div className={styles.copy}><div className={styles.title}>{current.title}</div><div className={styles.description}>{current.description}</div></div>
    <div className={styles.waveform}>{Array.from({length:44},(_,index)=>{
      const middle=1-Math.abs(index-21.5)/21.5;
      const listeningHeight=12+Math.pow(middle,1.3)*50;
      const speakingHeight=10+(Math.sin(index*.7)*.5+.5)*40*(.4+middle*.6);
      const height=callState==="listening"?listeningHeight:callState==="speaking"?speakingHeight:callState==="processing"?8+middle*16:6;
      const duration=callState==="listening"?700+(index%7)*130:callState==="speaking"?520+(index%5)*190:1400;
      const delay=callState==="listening"?(index%11)*70:callState==="speaking"?(index%9)*55:index*40;
      return <i key={index} className={`${styles.bar} ${styles[callState]}`} style={{height,animationDuration:`${duration}ms`,animationDelay:`${delay}ms`}}/>;
    })}</div>
    <div className={styles.actions}>
      <button className={styles.secondary} onClick={()=>setMuted(value=>!value)} aria-label={muted?"Unmute":"Mute"} title={muted?"Unmute":"Mute"} aria-pressed={muted}><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>{muted&&<path d="M4 4l16 16"/>}</svg></button>
      <Link href="/app/chat" className={styles.secondary} aria-label="Switch to chat" title="Switch to chat"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16v11H8l-4 4V5z"/><path d="M8 9h8M8 12h5"/></svg></Link>
      <Link href="/app/cart" className={styles.end} aria-label="End call" title="End call"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 15c4.5-4 9.5-4 14 0"/><path d="M7.5 13.2 5 17M16.5 13.2 19 17"/></svg></Link>
    </div>
  </div></div>;
}
