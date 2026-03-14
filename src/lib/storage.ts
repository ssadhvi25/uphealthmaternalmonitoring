import type { Article } from "./news/types";

let memoryStore: Article[] = [];

export async function getStoredArticles(): Promise<Article[]> {
  return memoryStore;
}

export async function upsertArticles(newArticles: Article[]): Promise<void> {
  const existing = new Map(memoryStore.map((a) => [a.sourceUrl, a]));
  for (const article of newArticles) {
    existing.set(article.sourceUrl, article);
  }
  memoryStore = Array.from(existing.values()).sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
  );
}
