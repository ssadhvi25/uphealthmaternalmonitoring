import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAggregatedArticles } from "../../src/lib/news/aggregate";
import { upsertArticles } from "../../src/lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const articles = await getAggregatedArticles();
    await upsertArticles(articles);

    res.status(200).json({
      ok: true,
      synced: articles.length,
      at: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      ok: false,
      error: error.message || "Sync failed",
    });
  }
}
