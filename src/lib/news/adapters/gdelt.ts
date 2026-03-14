import type { RawNewsItem } from "../types";

const GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc";

export async function fetchFromGdelt(): Promise<RawNewsItem[]> {
  const query = [
    `("Uttar Pradesh" OR UP OR Lucknow OR Gorakhpur OR Ballia OR Varanasi OR Prayagraj OR Meerut OR Kanpur OR Agra)`,
    `("maternal death" OR "maternal mortality" OR "pregnant woman died" OR "woman died during delivery" OR "delivery death" OR "postpartum death" OR "ambulance delay" OR "hospital negligence" OR "referral delay")`,
  ].join(" ");

  const url = new URL(GDELT_DOC_API);
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("format", "json");
  url.searchParams.set("sort", "datedesc");
  url.searchParams.set("maxrecords", "100");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`GDELT fetch failed: ${res.status}`);

  const data = await res.json();

  return (data.articles ?? []).map((item: any) => ({
    title: item.title ?? "",
    source: item.domain ?? "GDELT",
    sourceUrl: item.url ?? "",
    publishedAt: item.seendate
      ? new Date(item.seendate).toISOString()
      : new Date().toISOString(),
    summary: item.snippet ?? "",
    language: "en",
  }));
}
