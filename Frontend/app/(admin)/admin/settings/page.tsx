import { PageHeader } from "@/components/ui/PageHeader";
import { VoiceSettings } from "@/components/voice/VoiceSettings";

export default function SettingsPage() {
  return <div className="page"><PageHeader eyebrow="Account" title="Settings" sub="Choose the CallDine assistant voice."/><div className="grid"><VoiceSettings/></div></div>;
}
