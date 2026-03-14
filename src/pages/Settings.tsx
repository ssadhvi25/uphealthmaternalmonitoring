import React, { useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_SETTINGS, SAMPLE_RUNS } from "@/data/mockData";
import { Settings as SettingsType, SourceConfig } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { getLastRun } from "@/lib/formatters";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [newEnKeyword, setNewEnKeyword] = useState("");
  const [newHiKeyword, setNewHiKeyword] = useState("");
  const lastRun = getLastRun(SAMPLE_RUNS);

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Configuration updated. Changes will apply on the next run.",
    });
  };

  const addKeyword = (lang: "english" | "hindi") => {
    const term = lang === "english" ? newEnKeyword.trim() : newHiKeyword.trim();
    if (!term) return;
    setSettings((s) => ({
      ...s,
      activeKeywords: {
        ...s.activeKeywords,
        [lang]: [...s.activeKeywords[lang], term],
      },
    }));
    if (lang === "english") setNewEnKeyword("");
    else setNewHiKeyword("");
  };

  const removeKeyword = (lang: "english" | "hindi", idx: number) => {
    setSettings((s) => ({
      ...s,
      activeKeywords: {
        ...s.activeKeywords,
        [lang]: s.activeKeywords[lang].filter((_, i) => i !== idx),
      },
    }));
  };

  const toggleSource = (id: string) => {
    setSettings((s) => ({
      ...s,
      sourceConfig: s.sourceConfig.map((src) =>
        src.id === id ? { ...src, enabled: !src.enabled } : src
      ),
    }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Email Config */}
      <Section title="Email Digest" subtitle="Configure daily digest delivery">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recipient Email
            </Label>
            <Input
              value={settings.emailRecipient}
              onChange={(e) => setSettings((s) => ({ ...s, emailRecipient: e.target.value }))}
              placeholder="official@up.gov.in"
              className="max-w-sm"
            />
            <p className="text-xs text-muted-foreground">Daily digest will be sent to this address.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Daily Run Time
            </Label>
            <Input
              type="time"
              value={settings.dailyRunTime}
              onChange={(e) => setSettings((s) => ({ ...s, dailyRunTime: e.target.value }))}
              className="max-w-32"
            />
            <p className="text-xs text-muted-foreground">
              Runs automatically every day at this time (IST). Current: {settings.dailyRunTime} IST
            </p>
          </div>
        </div>
      </Section>

      {/* English Keywords */}
      <Section title="English Keywords" subtitle="Weighted keyword matching for relevance scoring">
        <div className="flex flex-wrap gap-2 mb-3">
          {settings.activeKeywords.english.map((kw, i) => (
            <motion.span
              key={`${kw}-${i}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="badge badge-primary flex items-center gap-1 pr-1"
            >
              {kw}
              <button
                onClick={() => removeKeyword("english", i)}
                className="ml-0.5 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </motion.span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newEnKeyword}
            onChange={(e) => setNewEnKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword("english")}
            placeholder="Add English keyword…"
            className="max-w-sm text-sm"
          />
          <Button variant="outline" size="sm" onClick={() => addKeyword("english")} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </Section>

      {/* Hindi Keywords */}
      <Section title="Hindi Keywords (हिंदी)" subtitle="Keyword matching for Hindi-language sources">
        <div className="flex flex-wrap gap-2 mb-3">
          {settings.activeKeywords.hindi.map((kw, i) => (
            <motion.span
              key={`${kw}-${i}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="badge badge-primary flex items-center gap-1 pr-1"
            >
              {kw}
              <button
                onClick={() => removeKeyword("hindi", i)}
                className="ml-0.5 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </motion.span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newHiKeyword}
            onChange={(e) => setNewHiKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword("hindi")}
            placeholder="हिंदी कीवर्ड जोड़ें…"
            className="max-w-sm text-sm"
          />
          <Button variant="outline" size="sm" onClick={() => addKeyword("hindi")} className="gap-1">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </Section>

      {/* Sources */}
      <Section title="News Sources" subtitle="Enable or disable ingestion adapters">
        <div className="space-y-3">
          {settings.sourceConfig.map((src) => (
            <SourceRow key={src.id} source={src} onToggle={toggleSource} />
          ))}
          <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p>
              Live sources (NewsAPI, GDELT, RSS) require API keys in environment variables.
              The mock adapter simulates ingestion for development. Connect real sources without
              changing pipeline logic — just add an adapter module in <code className="font-mono bg-muted px-1 rounded">src/lib/adapters/</code>.
            </p>
          </div>
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          {lastRun && `Last run: ${lastRun.runDate} · ${lastRun.status}`}
        </div>
        <motion.div whileTap={{ scale: 0.97 }} transition={{ type: "spring" as const, duration: 0.3, bounce: 0 }}>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

// ---- Sub-components ----
const Section: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <motion.div
    className="app-card"
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring" as const, duration: 0.3, bounce: 0 }}
  >
    <div className="mb-4 pb-3 border-b border-border">
      <div className="font-semibold text-foreground text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
    </div>
    {children}
  </motion.div>
);

const SourceRow: React.FC<{
  source: SourceConfig;
  onToggle: (id: string) => void;
}> = ({ source, onToggle }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{source.name}</span>
        <span className="badge badge-muted text-[10px]">{source.type.toUpperCase()}</span>
        <span className="badge badge-info text-[10px]">{source.language === "hi" ? "Hindi" : "English"}</span>
      </div>
      <div className="text-[10px] font-mono text-muted-foreground truncate mt-0.5 max-w-xs">{source.url}</div>
    </div>
    <Switch
      checked={source.enabled}
      onCheckedChange={() => onToggle(source.id)}
      className="shrink-0"
    />
  </div>
);

export default Settings;
