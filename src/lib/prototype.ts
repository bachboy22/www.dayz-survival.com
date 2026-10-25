import type { PrototypeArticle } from '../data/catalog';
import { searchArticles } from './search';

export interface CatalogFilters { tag?: string; map?: string; level?: string; type?: string; evidence?: string }
export function searchCatalog(articles: readonly PrototypeArticle[], query: string, filters: CatalogFilters = {}): PrototypeArticle[] {
  return searchArticles(articles, query, filters.tag).filter(a =>
    (!filters.map || a.mapScope === filters.map) && (!filters.level || a.level === filters.level) &&
    (!filters.type || filters.type === 'manual' || filters.type === 'card') &&
    (!filters.evidence || filters.evidence === 'demo'));
}
/** Separate synthetic boundary. This never changes the production-import policy. */
export function validatePrototype(articles: readonly PrototypeArticle[]): void {
  const ids = new Set<string>(); const slugs = new Set<string>(); const cards = new Set<string>();
  const require = (ok: unknown, message: string) => { if (!ok) throw new Error(`Prototype: ${message}`); };
  require(articles.length > 1, 'multiple synthetic records required');
  for (const a of articles) {
    require(/^DEMO-\d{3}$/.test(a.id) && !ids.has(a.id), 'invalid or duplicate DEMO ID'); ids.add(a.id);
    require(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a.slug) && !slugs.has(a.slug), 'invalid or duplicate slug'); slugs.add(a.slug);
    require(a.metadata.mode === 'demo' && a.metadata.editorialStatus === 'demo' && a.metadata.technicalStatus === 'unverified' && a.metadata.sourceVersion === null && a.metadata.map === 'none' && a.metadata.lane === 'demo', 'real-source or verification claim forbidden');
    require(a.publicationStatus === 'demo-only', 'real publication authorization forbidden');
    require(['general', 'chernarus-plus', 'livonia'].includes(a.mapScope), 'unknown scope');
    require(/^DEMO-CARD-\d{3}$/.test(a.quickCard.id) && !cards.has(a.quickCard.id) && a.quickCard.articleId === a.id && a.quickCard.demonstration === true, 'invalid card relationship'); cards.add(a.quickCard.id);
    require(a.fieldCard.signals.length === 2 && Object.values(a.fieldCard).flat().every(v => typeof v === 'string' && v.trim()), 'complete quick-card fields required');
    require(a.sections.length > 0 && new Set(a.sections.map(s => s.id)).size === a.sections.length, 'sections required and unique');
    require(a.sections.every(s => /^[a-z0-9-]+$/.test(s.id) && !['ficha-rapida', 'referencias', 'version'].includes(s.id) && s.title && s.paragraphs.length && s.paragraphs.every(p => p.trim())), 'unsafe or empty section');
    require(a.references.every(r => /^\/(?!\/)[a-z0-9/#-]*$/.test(r.href) && !r.href.includes('..')), 'unsafe reference');
  }
  for (const a of articles) require(a.relatedDemoIds.every(id => ids.has(id) && id !== a.id) && new Set(a.relatedDemoIds).size === a.relatedDemoIds.length, 'unresolved or duplicate cross-reference');
}
