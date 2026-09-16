"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

export function VoiceSettings() {
  const [voice, setVoice] = useState("Joanna"), [saved, setSaved] = useState(false);
  useEffect(() => { fetch("/api/admin/voice-settings").then(response => response.json()).then(data => setVoice(data.polly_voice_id)); }, []);
  async function save() { await fetch("/api/admin/voice-settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ polly_voice_id: voice }) }); setSaved(true); }
  return <Card className="span7" title="Amazon Polly voice"><label className="label">Assistant voice</label><select className="input" value={voice} onChange={event => { setVoice(event.target.value); setSaved(false); }}><option value="Joanna">Joanna — Female (Amazon Polly)</option><option value="Matthew">Matthew — Male (Amazon Polly)</option></select><button className="button primary" style={{ marginTop: 12 }} onClick={save}>{saved ? "Saved" : "Save voice"}</button></Card>;
}
