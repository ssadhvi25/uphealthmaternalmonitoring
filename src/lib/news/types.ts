export type RawNewsItem = {
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  summary?: string;
  language?: "en" | "hi";
};

export type Article = {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  fetchedAt: string;
  language: "en" | "hi";
  state: string;
  district: string | null;
  hospitalName: string | null;
  summary: string;
  category: string;
  severity: "low" | "medium" | "high";
  negligenceFlag: boolean;
  referralDelayFlag: boolean;
  ambulanceIssueFlag: boolean;
  relevanceScore: number;
  classification: "confirmed_maternal_mortality" | "probable_maternal_mortality" | "unrelated";
  duplicateGroupId: string | null;
  rawContent: string;
  createdAt: string;
  updatedAt: string;
};
