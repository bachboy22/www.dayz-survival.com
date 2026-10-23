export interface SearchableArticle {
  id: string; slug: string; title: string; summary: string; tags: readonly string[];
  sections?: readonly { title: string; paragraphs: readonly string[] }[];
}
export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}
/** Local AND full-text search; no network request, HTML insertion or editorial inference. */
export function searchArticles<T extends SearchableArticle>(articles: readonly T[], query: string, selectedTag = ''): T[] {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean); const tag = normalizeSearch(selectedTag);
  return articles.filter((article) => {
    if (tag && !article.tags.some((item) => normalizeSearch(item) === tag)) return false;
    const text = normalizeSearch([article.title, article.summary, ...article.tags,
      ...(article.sections ?? []).flatMap((section) => [section.title, ...section.paragraphs]),
    ].join(' '));
    return tokens.every((token) => text.includes(token));
  });
}
