// ============================================================
//  Ingestion Pipeline — Keyword scoring & classification
//  Modular adapter pattern: swap out sources without changing logic
// ============================================================

import { Article, Classification, Language, Severity } from "@/types";
import { DISTRICTS } from "@/data/mockData";

// --------------- Keyword Config ---------------
const EN_KEYWORDS_WEIGHTED: { term: string; weight: number }[] = [
  { term: "maternal death", weight: 20 },
  { term: "maternal mortality", weight: 20 },
  { term: "pregnant woman died", weight: 18 },
  { term: "woman died during delivery", weight: 18 },
  { term: "delivery death", weight: 16 },
  { term: "postpartum death", weight: 16 },
  { term: "labour pain death", weight: 16 },
  { term: "obstetric emergency", weight: 14 },
  { term: "referral delay", weight: 12 },
  { term: "ambulance delay", weight: 12 },
  { term: "hospital negligence", weight: 10 },
  { term: "woman dies in hospital", weight: 8 },
  { term: "pregnant", weight: 4 },
  { term: "delivery", weight: 3 },
];

const HI_KEYWORDS_WEIGHTED: { term: string; weight: number }[] = [
  { term: "गर्भवती महिला की मौत", weight: 20 },
  { term: "प्रसूता की मौत", weight: 20 },
  { term: "डिलीवरी के दौरान मौत", weight: 18 },
  { term: "लेबर पेन में महिला की मौत", weight: 18 },
  { term: "प्रसव मृत्यु", weight: 16 },
  { term: "मातृ मृत्यु", weight: 16 },
  { term: "अस्पताल लापरवाही", weight: 12 },
  { term: "रेफरल में देरी", weight: 12 },
  { term: "एम्बुलेंस न मिलने से मौत", weight: 14 },
];

const UP_IDENTIFIERS = [
  "uttar pradesh", "up ", " up,", "u.p.", "u.p",
  ...DISTRICTS.map((d) => d.districtName.toLowerCase()),
  ...DISTRICTS.map((d) => d.districtNameHi),
];

// Negligence signal terms
const NEGLIGENCE_TERMS_EN = ["negligence", "negligent", "laprawahi", "carelessness", "absent doctor", "no doctor"];
const REFERRAL_TERMS_EN = ["referral delay", "referred late", "not referred", "referral denied"];
const AMBULANCE_TERMS_EN = ["ambulance delay", "no ambulance", "ambulance did not arrive", "108 late", "108 not available"];

// --------------- Utility ---------------
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
}

export function detectLanguage(text: string): Language {
  const hindiPattern = /[\u0900-\u097F]/;
  if (hindiPattern.test(text)) return "hi";
  if (/[a-zA-Z]/.test(text)) return "en";
  return "unknown";
}

// --------------- Core Scoring ---------------
export interface ScoringResult {
  relevanceScore: number;
  classification: Classification;
  severity: Severity;
  negligenceFlag: boolean;
  referralDelayFlag: boolean;
  ambulanceIssueFlag: boolean;
  district: string | null;
  isUpArticle: boolean;
  category: string;
}

export function scoreArticle(title: string, content: string, language: Language): ScoringResult {
  const combined = normalizeText(title + " " + content);
  let score = 0;

  // Language-specific keyword scoring
  const keywords = language === "hi" ? HI_KEYWORDS_WEIGHTED : EN_KEYWORDS_WEIGHTED;
  for (const kw of keywords) {
    if (combined.includes(kw.term.toLowerCase()) || combined.includes(kw.term)) {
      score += kw.weight;
    }
  }

  // Check UP location
  const isUpArticle = UP_IDENTIFIERS.some((id) => combined.includes(id));

  // District extraction
  let district: string | null = null;
  for (const d of DISTRICTS) {
    if (
      combined.includes(d.districtName.toLowerCase()) ||
      combined.includes(d.districtNameHi)
    ) {
      district = d.districtName;
      break;
    }
  }

  // Flag detection
  const negligenceFlag = NEGLIGENCE_TERMS_EN.some((t) => combined.includes(t)) ||
    combined.includes("लापरवाही");
  const referralDelayFlag = REFERRAL_TERMS_EN.some((t) => combined.includes(t)) ||
    combined.includes("रेफरल में देरी");
  const ambulanceIssueFlag = AMBULANCE_TERMS_EN.some((t) => combined.includes(t)) ||
    combined.includes("एम्बुलेंस न मिलने");

  // Category detection
  let category = "maternal_mortality";
  if (ambulanceIssueFlag) category = "ambulance_delay";
  else if (referralDelayFlag) category = "referral_delay";
  else if (negligenceFlag) category = "hospital_negligence";
  else if (combined.includes("postpartum") || combined.includes("प्रसवोत्तर")) category = "postpartum_death";
  else if (combined.includes("obstetric")) category = "obstetric_emergency";
  else if (combined.includes("delivery") || combined.includes("डिलीवरी")) category = "delivery_death";

  // Cap score at 100
  const finalScore = Math.min(score, 100);

  // Classification
  let classification: Classification = "unrelated";
  if (isUpArticle && finalScore >= 30) {
    classification = finalScore >= 50 ? "confirmed_maternal_mortality" : "probable_maternal_mortality";
  }

  // Severity
  const severity: Severity = finalScore >= 80 ? "high" : finalScore >= 50 ? "medium" : "low";

  return {
    relevanceScore: finalScore,
    classification,
    severity,
    negligenceFlag,
    referralDelayFlag,
    ambulanceIssueFlag,
    district,
    isUpArticle,
    category,
  };
}

// --------------- Deduplication ---------------
function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function isTitleDuplicate(titleA: string, titleB: string): boolean {
  const a = normalizeText(titleA);
  const b = normalizeText(titleB);
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return true;
  const dist = levenshteinDistance(a.substring(0, 80), b.substring(0, 80));
  return dist / Math.min(a.length, 80) < 0.15; // < 15% edit distance → duplicate
}

// --------------- Mock Ingestion Adapter ---------------
export interface RawArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

/**
 * Mock adapter — simulates fetching from a news source.
 * Replace with real NewsAPI / GDELT / RSS adapters.
 */
export function runMockIngestion(): RawArticle[] {
  return [
    {
      title: "Pregnant woman dies after ambulance delay in Ballia",
      description: "A 24-year-old pregnant woman from Ballia died after an ambulance arrived 3 hours late.",
      url: "https://example.com/news/1",
      source: "Mock Source",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Cricket match results from Mumbai",
      description: "India beat Pakistan in the T20 series final.",
      url: "https://example.com/news/2",
      source: "Sports News",
      publishedAt: new Date().toISOString(),
    },
    {
      title: "Maternal mortality rate rises in Jhansi: report",
      description: "New report shows increase in maternal deaths in Jhansi district hospital.",
      url: "https://example.com/news/3",
      source: "Health Daily",
      publishedAt: new Date().toISOString(),
    },
  ];
}

export interface PipelineResult {
  total_fetched: number;
  total_relevant: number;
  total_duplicates_removed: number;
  articles: Partial<Article>[];
  status: "success" | "failed";
  error?: string;
}

export function runPipeline(existingUrls: string[] = []): PipelineResult {
  const raw = runMockIngestion();
  const relevant: Partial<Article>[] = [];
  let duplicatesRemoved = 0;

  for (const r of raw) {
    // Skip already-seen URLs
    if (existingUrls.includes(r.url)) {
      duplicatesRemoved++;
      continue;
    }

    const lang = detectLanguage(r.title + " " + r.description);
    const scoring = scoreArticle(r.title, r.description, lang);

    if (scoring.classification === "unrelated") continue;

    // Check title deduplication against already-collected batch
    const isDupe = relevant.some(
      (a) => a.title && isTitleDuplicate(a.title, r.title)
    );
    if (isDupe) {
      duplicatesRemoved++;
      continue;
    }

    relevant.push({
      title: r.title,
      source: r.source,
      sourceUrl: r.url,
      publishedAt: r.publishedAt,
      fetchedAt: new Date().toISOString(),
      language: lang,
      state: "Uttar Pradesh",
      district: scoring.district,
      summary: r.description,
      category: scoring.category,
      severity: scoring.severity,
      negligenceFlag: scoring.negligenceFlag,
      referralDelayFlag: scoring.referralDelayFlag,
      ambulanceIssueFlag: scoring.ambulanceIssueFlag,
      relevanceScore: scoring.relevanceScore,
      classification: scoring.classification,
    });
  }

  return {
    total_fetched: raw.length,
    total_relevant: relevant.length,
    total_duplicates_removed: duplicatesRemoved,
    articles: relevant,
    status: "success",
  };
}
