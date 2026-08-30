import { KnowledgeBase } from "@/components/knowledge/KnowledgeBase";
import { PageHeader } from "@/components/ui/PageHeader";

export default function KnowledgePage() {
  return <div className="page"><PageHeader eyebrow="Operations" title="Knowledge Base" sub="Restaurant details used by your AI assistant" /><KnowledgeBase /></div>;
}
