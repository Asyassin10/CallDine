"use client";

import { useEffect, useState } from "react";
import { CallRecordingPlayer } from "@/components/calls/CallRecordingPlayer";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

type Message = { id: number; role: string; content: string; created_at: string };

export default function CallDetail({ params }: { params: Promise<{ id: string }> }) {
  const [messages, setMessages] = useState<Message[]>([]), [id, setId] = useState("");
  useEffect(() => { params.then(({ id }) => { setId(id); fetch(`/api/admin/calls/${id}`).then(response => response.json()).then(setMessages); }); }, [params]);
  return <div className="page"><PageHeader back="/admin/calls" eyebrow="Voice call" title={`Call ${id.slice(0, 8)}`} sub="Recording and transcript."/>{id && <CallRecordingPlayer src={`/api/admin/calls/${id}/audio`}/>}<Card title="Conversation"><div style={{ maxHeight: 520, overflowY: "auto" }}>{messages.map(message => <div key={message.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}><div className="eyebrow">{message.role === "user" ? "Customer" : "CallDine AI"}</div><div style={{ marginTop: 4 }}>{message.content}</div></div>)}</div></Card></div>;
}
