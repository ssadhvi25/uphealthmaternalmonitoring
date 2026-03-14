import type { Article, RawNewsItem } from "./types";
import { fetchFromGdelt } from "./adapters/gdelt";
import { fetchFromNewsApi } from "./adapters/newsapi";
import { classifyArticle, detectDistrict, dedupeByUrlAndTitle } from "./normalize";

function toArticle(item: RawNewsItem, index: number): Article {
  const meta = classifyArticle(item.title, item.summary ?? "");
  const district = detectDistrict(`${item.title} ${item.summary ?? ""}`);

  return {
    id: `live-${Date.now()}-${index}`,
    title: item.title,
    source: item.source,
    sourceUrl: item.sourceUrl,
    publishedAt: item.publishedAt,
    fetchedAt: new Date().toISOString(),
    language: item.language === "hi" ? "hi" : "en",
    state: "Uttar Pradesh",
    district,
    hospitalName: null,
    summary: item.summary ?? "",
    category: meta.ambulanceIssueFlag
      ? "ambulance_delay"
      : meta.referralDelayFlag
      ? "referral_delay"
      : meta.negligenceFlag
      ? "hospital_negligence"
      : "maternal_mortality",
    severity: meta.severity,
    negligenceFlag: meta.negligenceFlag,
    referralDelayFlag: meta.referralDelayFlag,
    ambulanceIssueFlag: meta.ambulanceIssueFlag,
    relevanceScore: meta.relevanceScore,
    classification: meta.classification,
    duplicateGroupId: null,
    rawContent: item.summary ?? "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getAggregatedArticles(): Promise<Article[]> {
  const results = await Promise.allSettled([
    fetchFromGdelt(),
    fetchFromNewsApi(),
  ]);

  const raw: RawNewsItem[] = results.flatMap((r) =>
    r.status === "fulfilled" ? r.value : []
  );

  return dedupeByUrlAndTitle(raw)
    .map(toArticle)
    .filter((a) => a.classification !== "unrelated")
    .filter((a) => new Date(a.publishedAt) >= new Date("2026-03-01T00:00:00.000Z"))
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}
