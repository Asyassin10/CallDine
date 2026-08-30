"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./ChatAssistant.module.css";

type Message = { id?: number; role: "assistant" | "user"; content: string };
type Conversation = { id: string; title: string; updated_at: string };

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((part, index) => part.startsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part.startsWith("_") ? <em key={index}>{part.slice(1, -1)}</em> : part);
}

function Markdown({ text }: { text: string }) {
  return <>{text.split("\n").map((line, index) => line.startsWith("## ") ? <h3 key={index}>{inline(line.slice(3))}</h3> : line.startsWith("- ") ? <li key={index}>{inline(line.slice(2))}</li> : <p key={index}>{inline(line) || " "}</p>)}</>;
}

export function ChatAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [streaming, setStreaming] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function createConversation() {
    const response = await fetch("/api/conversations", { method: "POST" });
    const conversation = await response.json() as Conversation;
    setConversations(items => [conversation, ...items]);
    setSelected(conversation.id);
    setMessages([]);
  }

  useEffect(() => {
    fetch("/api/conversations").then(response => response.json()).then((items: Conversation[]) => {
      setConversations(items);
      if (items[0]) setSelected(items[0].id); else createConversation();
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/conversations/${selected}/messages`).then(response => response.json()).then((items: Message[]) => setMessages(items));
  }, [selected]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text || streaming || !selected) return;
    setMessage("");
    setStreaming(true);
    setMessages(items => [...items, { role: "user", content: text }, { role: "assistant", content: "" }]);
    try {
      const response = await fetch(`/api/conversations/${selected}/messages/stream`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      if (!response.ok || !response.body) throw new Error("The assistant is unavailable.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages(items => [...items.slice(0, -1), { role: "assistant", content: answer }]);
      }
      setConversations(items => items.map(item => item.id === selected ? { ...item, title: item.title === "New conversation" ? text.slice(0, 48) : item.title, updated_at: new Date().toISOString() } : item));
    } catch (error) {
      setMessages(items => [...items.slice(0, -1), { role: "assistant", content: error instanceof Error ? error.message : "The assistant is unavailable." }]);
    } finally {
      setStreaming(false);
      input.current?.focus();
    }
  }

  return <section className={styles.layout}>
    <aside className={styles.sidebar}><button className="button primary" onClick={createConversation}>New chat</button><div className={styles.conversations}>{conversations.map(item => <button key={item.id} onClick={() => setSelected(item.id)} className={item.id === selected ? styles.activeConversation : styles.conversation}>{item.title}</button>)}</div></aside>
    <div className={styles.chat}><div className={styles.messages} aria-live="polite">{messages.length ? messages.map((item, index) => <div className={`${styles.message} ${styles[item.role]}`} key={item.id ?? index}>{item.content ? <Markdown text={item.content} /> : <span className={styles.typing}>Thinking…</span>}</div>) : <div className={styles.welcome}>Good evening. I’m CallDine — how can I help with your visit?</div>}</div><form className={styles.form} onSubmit={send}><input ref={input} className="input" value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask about a table, menu, or order…" disabled={streaming || !selected} /><button className="button primary" disabled={streaming || !selected}>{streaming ? "Replying…" : "Send"}</button></form></div>
  </section>;
}
