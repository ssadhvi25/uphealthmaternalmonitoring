import { UP_DISTRICTS, UP_DISTRICT_ALIASES } from "../upDistricts";

const KEYWORDS = {
  core: [
    "maternal death",
    "maternal mortality",
    "pregnant woman died",
    "pregnant woman death",
    "woman died during delivery",
    "delivery death",
    "postpartum death",
    "labour pain death",
    "hospital negligence",
    "ambulance delay",
    "referral delay",
    "गर्भवती महिला की मौत",
    "प्रसूता की मौत",
    "डिलीवरी",
    "अस्पताल लापरवाही",
    "एम्बुलेंस",
    "रेफरल",
  ],
};

export function detectDistrict(text: string): string | null {
  const lower = text.toLowerCase();

  for (const district of UP_DISTRICTS) {
    if (lower.includes(district.toLowerCase())) return district;
  }

  for (const [district, aliases] of Object.entries(UP_DISTRICT_ALIASES)) {
    if (aliases.some((alias) => lower.includes(alias.toLowerCase()))) return district;
  }

  return null;
}

export function classifyArticle(title: string, summary = "") {
  const text = `${title} ${summary}`.toLowerCase();

  let relevanceScore = 0;

  for (const word of KEYWORDS.core) {
    if (text.includes(word.toLowerCase())) relevanceScore += 2;
  }

  if (text.includes("maternal death")) relevanceScore += 4;
  if (text.includes("maternal mortality")) relevanceScore += 4;
  if (text.includes("pregnant woman")) relevanceScore += 2;
  if (text.includes("delivery")) relevanceScore += 2;
  if (text.includes("uttar pradesh")) relevanceScore += 3;
  if (detectDistrict(text)) relevanceScore += 3;

  const ambulanceIssueFlag = text.includes("ambulance");
  const referralDelayFlag = text.includes("referral");
  const negligenceFlag =
    text.includes("negligence") ||
    text.includes("lapse") ||
    text.includes("लापरवाही");

  const classification =
    relevanceScore >= 10
      ? "confirmed_maternal_mortality"
      : relevanceScore >= 6
      ? "probable_maternal_mortality"
      : "unrelated";

  const severity =
    classification === "confirmed_maternal_mortality"
      ? "high"
      : classification === "probable_maternal_mortality"
      ? "medium"
      : "low";

  return {
    relevanceScore,
    classification,
    severity,
    ambulanceIssueFlag,
    referralDelayFlag,
    negligenceFlag,
  } as const;
}

export function dedupeByUrlAndTitle<T extends { sourceUrl: string; title: string }>(items: T[]) {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key =
      item.sourceUrl?.trim().toLowerCase() ||
      item.title.trim().toLowerCase().replace(/\s+/g, " ");

    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}
