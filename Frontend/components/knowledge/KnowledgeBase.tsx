"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./KnowledgeBase.module.css";

type Entry = { id: string; title: string; created_at: string; status: string; progress: number; message: string };
type Preview = { id: string; title: string };

export function KnowledgeBase() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);

  async function load() { const response = await fetch("/api/knowledge"); if (response.ok) setEntries(await response.json()); setLoading(false); }
  useEffect(() => { const refresh = () => fetch("/api/knowledge").then(async response => { if (response.ok) setEntries(await response.json()); setLoading(false); }); refresh(); const timer = window.setInterval(refresh, 2500); return () => window.clearInterval(timer); }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; setSaving(true); setProgress(1); setError("");
    const timer = window.setInterval(() => setProgress(value => Math.min(value + 1, 95)), 180);
    try {
      const response = await fetch("/api/knowledge", { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error();
      setProgress(100); form.reset(); await load();
    } catch { setError("The upload could not be saved."); } finally { window.clearInterval(timer); setSaving(false); }
  }

  async function remove(id: string) { if (await fetch(`/api/knowledge/${id}`, { method: "DELETE" }).then(response => response.ok)) await load(); }

  return <div className={styles.layout}><form className={styles.upload} onSubmit={upload}><h2>Add restaurant information</h2><p>Upload a PDF file the assistant should know.</p><label>Title<input className="input" name="title" placeholder="For example: Opening hours and policies" required /></label><label>PDF file<input className={styles.file} name="file" type="file" accept=".pdf,application/pdf" required /></label>{error && <p className={styles.error}>{error}</p>}<button className="button primary" disabled={saving}>Add to knowledge base</button></form><section className={styles.entries}><div className={styles.heading}><div><h2>Knowledge entries</h2><p>Documents and policies available to your assistant.</p></div><span>{entries.length} saved</span></div>{loading ? <p className="muted">Loading entries…</p> : entries.length === 0 ? <div className={styles.empty}>No knowledge entries yet.</div> : <div className={styles.list}>{entries.map(entry => <article key={entry.id}><div><strong>{entry.title}</strong><small>Added {new Date(entry.created_at).toLocaleDateString()} · {entry.message} · {entry.progress}%</small><span className={`${styles.job} ${styles[entry.status]}`}>{entry.status === "ready" ? "AI ready" : entry.status}</span></div><div className={styles.entryActions}><button className="button" onClick={() => setPreview(entry)}>◉ View</button><button className="button danger" onClick={() => remove(entry.id)}>Delete</button></div></article>)}</div>}</section>{saving && <div className={styles.backdrop}><section className={styles.progress}><p>Uploading knowledge file</p><strong>{progress}%</strong><div><span style={{ width: `${progress}%` }} /></div><small>Your file is being saved securely.</small></section></div>}{preview && <div className={styles.backdrop} onClick={() => setPreview(null)}><section className={styles.preview} onClick={event => event.stopPropagation()}><div className={styles.previewHead}><div><p>PDF preview</p><h2>{preview.title}</h2></div><button className="button" onClick={() => setPreview(null)}>Close</button></div><iframe className={styles.pdf} src={`/api/knowledge/${preview.id}/preview`} title={preview.title} /></section></div>}</div>;
}
