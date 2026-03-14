import { format, formatDistanceToNow } from "date-fns";
import { Article, Classification, DailyRun, Language, RunStatus, Severity } from "@/types";

export function formatDate(dateStr: string, fmt = "dd MMM yyyy, HH:mm"): string {
  try {
    return format(new Date(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function classificationLabel(c: Classification): string {
  switch (c) {
    case "confirmed_maternal_mortality": return "Confirmed";
    case "probable_maternal_mortality": return "Probable";
    case "unrelated": return "Unrelated";
  }
}

export function classificationBadgeClass(c: Classification): string {
  switch (c) {
    case "confirmed_maternal_mortality": return "badge badge-destructive";
    case "probable_maternal_mortality": return "badge badge-warning";
    case "unrelated": return "badge badge-muted";
  }
}

export function severityLabel(s: Severity): string {
  switch (s) {
    case "high": return "High";
    case "medium": return "Medium";
    case "low": return "Low";
  }
}

export function severityBadgeClass(s: Severity): string {
  switch (s) {
    case "high": return "badge badge-destructive";
    case "medium": return "badge badge-warning";
    case "low": return "badge badge-success";
  }
}

export function languageLabel(l: Language): string {
  switch (l) {
    case "en": return "English";
    case "hi": return "हिंदी";
    case "unknown": return "Unknown";
  }
}

export function runStatusLabel(s: RunStatus): string {
  switch (s) {
    case "success": return "Success";
    case "failed": return "Failed";
    case "running": return "Running";
    case "pending": return "Pending";
  }
}

export function runStatusClass(s: RunStatus): string {
  switch (s) {
    case "success": return "badge badge-success";
    case "failed": return "badge badge-destructive";
    case "running": return "badge badge-info";
    case "pending": return "badge badge-muted";
  }
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    ambulance_delay: "Ambulance Delay",
    referral_delay: "Referral Delay",
    hospital_negligence: "Hospital Negligence",
    postpartum_death: "Postpartum Death",
    obstetric_emergency: "Obstetric Emergency",
    delivery_death: "Delivery Death",
    maternal_mortality: "Maternal Mortality",
  };
  return map[cat] || cat;
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export function getLastRun(runs: DailyRun[]): DailyRun | null {
  if (!runs.length) return null;
  return [...runs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export function getWeeklyArticles(articles: Article[]): Article[] {
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return articles.filter((a) => new Date(a.publishedAt) >= weekStart);
}
