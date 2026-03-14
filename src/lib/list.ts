import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStoredArticles } from "../../src/lib/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const articles = await getStoredArticles();
    res.status(200).json({ ok: true, articles });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error.message || "Read failed" });
  }
}
