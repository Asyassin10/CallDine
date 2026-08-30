export function Logo({ compact=false }: {compact?:boolean}) {
  return <div style={{display:"flex",alignItems:"center",gap:10}}>
    <svg viewBox="0 0 64 64" width={compact?24:29} height={compact?24:29} aria-hidden="true">
      <circle cx="32" cy="32" r="25" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="126 32" transform="rotate(35 32 32)"/>
      <rect x="19.5" y="21" width="5" height="15" rx="2.5" fill="currentColor"/><rect x="29.5" y="18" width="5" height="27" rx="2.5" fill="currentColor"/><rect x="39.5" y="21" width="5" height="15" rx="2.5" fill="currentColor"/>
    </svg>
    {!compact&&<strong style={{fontSize:18,letterSpacing:"-.035em"}}>CallDine</strong>}
  </div>;
}
