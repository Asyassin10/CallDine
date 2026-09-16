export function StatusBadge({value}:{value:string}){return <span className={`status ${value.toLowerCase().replaceAll(" ","")}`}>{value}</span>}
