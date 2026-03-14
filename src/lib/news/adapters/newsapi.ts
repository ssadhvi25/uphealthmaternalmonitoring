import type { RawNewsItem } from "../types";

const NEWS_API_URL = "https://newsapi.org/v2/everything";

export async function fetchFromNewsApi(): Promise<RawNewsItem[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) return [];

  const query = [
    `("Uttar Pradesh" OR Lucknow OR Gorakhpur OR Ballia OR Varanasi OR Prayagraj OR Meerut OR Kanpur OR Agra)`,
    `("maternal death" OR "maternal mortality" OR "pregnant woman died" OR "woman died during delivery" OR "delivery death" OR "postpartum death" OR "ambulance delay" OR "hospital negligence" OR "referral delay")`,
  ].join(" AND ");

  const url = new URL(NEWS_API_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("from", "2026-03-01");

  const res = await fetch(url.toString(), {
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) throw new Error(`NewsAPI fetch failed: ${res.status}`);

  const data = await res.json();

  return (data.articles ?? []).map((item: any) => ({
    title: item.title ?? "",
    source: item.source?.name ?? "NewsAPI",
    sourceUrl: item.url ?? "",
    publishedAt: item.publishedAt ?? new Date().toISOString(),
    summary: item.description ?? "",
    language: "en",
  }));
}
