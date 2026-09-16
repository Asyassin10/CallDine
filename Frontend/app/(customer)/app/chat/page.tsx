import Link from "next/link";
import { ChatAssistant } from "@/components/chat/ChatAssistant";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ChatPage() {
  return <div className="page"><PageHeader eyebrow="Assistant" title="Chat with CallDine" sub="Live answers powered by GPT‑OSS 20B."><Link className="button primary" href="/app/ai">Start voice call</Link></PageHeader><ChatAssistant /></div>;
}
