import { normalizeSearch } from './search';
import type { PrototypeArticle, MapScope } from '../data/catalog';
import type { CatalogFilters } from './prototype';

export const SEARCH_PAGE_SIZE = 12;
export const SEARCH_MAP_LABELS: Record<MapScope, string> = {
  general: 'General · interfaz', 'chernarus-plus': 'Chernarus Plus · ámbito de prueba', livonia: 'Livonia · ámbito de prueba',
};
export interface SearchSummary {
  id: string; slug: string; title: string; summary: string; tags: readonly string[];
  topic: string; mapScope: MapScope; level: string; readingMinutes: number;
}
export interface SearchEntry extends SearchSummary {
  normalizedText: string; normalizedTags: readonly string[];
  demonstration: true; editorialStatus: 'demo'; technicalStatus: 'unverified'; publicationStatus: 'demo-only';
  sourceVersion: null; verifiedGameBuild: null;
}
export interface SearchIndex { schemaVersion: 1; demonstration: true; entries: readonly SearchEntry[] }

/** Build-only derivation. AND query tokens contain no whitespace: deduplicating complete
 * whitespace-delimited tokens preserves substring matching, punctuation, accents and order. */
export function buildSearchIndex(articles: readonly PrototypeArticle[]): SearchIndex {
  const entries: SearchEntry[] = articles.map(a => {
    if (a.metadata.mode !== 'demo' || a.metadata.editorialStatus !== 'demo' || a.metadata.technicalStatus !== 'unverified' || a.metadata.sourceVersion !== null || a.metadata.map !== 'none' || a.metadata.lane !== 'demo' || a.publicationStatus !== 'demo-only') throw new Error('Search index accepts isolated DEMO only.');
    const normalized = normalizeSearch([a.title, a.summary, ...a.tags, ...a.sections.flatMap(s => [s.title, ...s.paragraphs])].join(' '));
    return {
      id: a.id, slug: a.slug, title: a.title, summary: a.summary, tags: [...a.tags], topic: a.topic,
      mapScope: a.mapScope, level: a.level, readingMinutes: a.readingMinutes,
      normalizedText: [...new Set(normalized.split(/\s+/).filter(Boolean))].join(' '),
      normalizedTags: a.tags.map(normalizeSearch), demonstration: true, editorialStatus: 'demo',
      technicalStatus: 'unverified', publicationStatus: 'demo-only', sourceVersion: null, verifiedGameBuild: null,
    };
  });
  const result: SearchIndex = { schemaVersion: 1, demonstration: true, entries };
  validateSearchIndex(result);
  return result;
}

/** Strict allowlist at the static JSON boundary; never turn untrusted data into HTML or approval. */
export function validateSearchIndex(value: unknown): asserts value is SearchIndex {
  const fail = (ok: unknown): void => { if (!ok) throw new Error('Invalid isolated DEMO search index.'); };
  const object = (v: unknown): v is Record<string, unknown> => Boolean(v && typeof v === 'object' && !Array.isArray(v));
  fail(object(value)); const index = value as Record<string, unknown>;
  fail(Object.keys(index).length === 3 && index.schemaVersion === 1 && index.demonstration === true && Array.isArray(index.entries));
  const entries = index.entries as unknown[]; fail(entries.length > 0 && entries.length <= 1000);
  const keys = ['id','slug','title','summary','tags','topic','mapScope','level','readingMinutes','normalizedText','normalizedTags','demonstration','editorialStatus','technicalStatus','publicationStatus','sourceVersion','verifiedGameBuild'];
  const ids = new Set<string>(); const slugs = new Set<string>();
  const text = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
  for (const record of entries) {
    fail(object(record)); const e = record as Record<string, unknown>;
    fail(Object.keys(e).length === keys.length && Object.keys(e).every(k => keys.includes(k)));
    fail(typeof e.id === 'string' && /^DEMO-\d{3}$/.test(e.id) && !ids.has(e.id as string)); ids.add(e.id as string);
    fail(typeof e.slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.slug) && !slugs.has(e.slug as string)); slugs.add(e.slug as string);
    fail(text(e.title, 500) && text(e.summary, 2000) && text(e.topic, 100) && text(e.normalizedText, 200000));
    fail(Array.isArray(e.tags) && e.tags.length > 0 && e.tags.length <= 50 && e.tags.every(t => text(t, 100)));
    fail(Array.isArray(e.normalizedTags) && e.normalizedTags.length === (e.tags as string[]).length && e.normalizedTags.every((t, i) => t === normalizeSearch((e.tags as string[])[i]!)));
    fail(['general','chernarus-plus','livonia'].includes(e.mapScope as string) && ['Inicial','Consulta'].includes(e.level as string));
    fail(Number.isInteger(e.readingMinutes) && Number(e.readingMinutes) > 0);
    fail(e.demonstration === true && e.editorialStatus === 'demo' && e.technicalStatus === 'unverified' && e.publicationStatus === 'demo-only' && e.sourceVersion === null && e.verifiedGameBuild === null);
  }
}

/** Query-only normalization. Text and tag indexes were normalized once, at build time. */
export function searchIndex(index: SearchIndex, query: string, filters: CatalogFilters = {}): readonly SearchEntry[] {
  const tokens = normalizeSearch(query.slice(0, 200)).split(/\s+/).filter(Boolean);
  const tag = normalizeSearch(filters.tag ?? '');
  if (filters.type && !['manual','card'].includes(filters.type)) return [];
  if (filters.evidence && filters.evidence !== 'demo') return [];
  return index.entries.filter(e => (!tag || e.normalizedTags.includes(tag)) && (!filters.map || e.mapScope === filters.map) &&
    (!filters.level || e.level === filters.level) && tokens.every(t => e.normalizedText.includes(t)));
}
export function searchPage(entries: readonly SearchEntry[], requested: number) {
  const pages = Math.ceil(entries.length / SEARCH_PAGE_SIZE);
  const page = Math.max(1, Math.min(Number.isSafeInteger(requested) ? requested : 1, pages || 1));
  return { page, pages, total: entries.length, entries: entries.slice((page - 1) * SEARCH_PAGE_SIZE, page * SEARCH_PAGE_SIZE) };
}
