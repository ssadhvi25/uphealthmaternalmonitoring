// ============================================================
//  UP Maternal Mortality News Agent — Core Types
// ============================================================

export type Classification = "confirmed_maternal_mortality" | "probable_maternal_mortality" | "unrelated";
export type Language = "en" | "hi" | "unknown";
export type Severity = "high" | "medium" | "low";
export type RunStatus = "success" | "failed" | "running" | "pending";

export interface Article {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string; // ISO date string
  fetchedAt: string;
  language: Language;
  state: string;
  district: string | null;
  hospitalName: string | null;
  summary: string;
  category: string;
  severity: Severity;
  negligenceFlag: boolean;
  referralDelayFlag: boolean;
  ambulanceIssueFlag: boolean;
  relevanceScore: number; // 0–100
  classification: Classification;
  duplicateGroupId: string | null;
  rawContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyRun {
  id: string;
  runDate: string; // YYYY-MM-DD
  totalFetched: number;
  totalRelevant: number;
  totalDuplicatesRemoved: number;
  status: RunStatus;
  errorLog: string | null;
  createdAt: string;
  durationSeconds: number;
}

export interface District {
  id: string;
  districtName: string;
  districtNameHi: string;
  stateName: string;
}

export interface Settings {
  emailRecipient: string;
  activeKeywords: {
    english: string[];
    hindi: string[];
  };
  sourceConfig: SourceConfig[];
  dailyRunTime: string; // "07:00"
}

export interface SourceConfig {
  id: string;
  name: string;
  type: "rss" | "api" | "gdelt" | "mock";
  url: string;
  enabled: boolean;
  language: Language;
}

export interface MetricSummary {
  totalArticles: number;
  todayCount: number;
  weekCount: number;
  confirmedCount: number;
  probableCount: number;
}

export interface DistrictCount {
  district: string;
  count: number;
}

export interface SourceCount {
  source: string;
  count: number;
}
