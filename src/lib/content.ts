import { createHash } from 'node:crypto';

export const SOURCE_BASELINE = Object.freeze({ version: 'v0.16.1', approvedArticles: 84, identifiers: 294, packages: 42 } as const);
export type EditorialStatus = 'demo' | 'draft' | 'approved' | 'rejected';
export type TechnicalStatus = 'unverified' | 'documentary' | 'verified';
export type ContentLane = 'core' | 'CHR' | 'LIV' | 'AUD-130';
export type EvidenceLane = 'C29' | 'E30' | 'CE26' | 'D30DOC' | 'D26';
export type GameMap = 'chernarus-plus' | 'livonia';
export interface ArticleSection { id: string; title: string; paragraphs: string[] }
export interface QuickCard { id: string; articleId: string; title: string; items: string[]; demonstration: true }
export interface ArticleReference { label: string; href: string }
export interface DemoArticle {
  id: string; slug: string; title: string; summary: string; tags: string[];
  readingMinutes: number; sections: ArticleSection[]; quickCard: QuickCard; references: ArticleReference[];
  metadata: { mode: 'demo'; editorialStatus: 'demo'; technicalStatus: 'unverified'; sourceVersion: null; map: 'none'; lane: 'demo'; notice: string };
}
export interface Citation { id: string; label: string; url: string; accessedAt: string }
export interface TechnicalEvidence {
  lane: EvidenceLane; status: TechnicalStatus; gameBuild: string; buildChannel: 'stable' | 'experimental';
  map: GameMap; platform: 'vanilla-pc'; checkedAt: string; reviewer: string; citationIds: string[];
}
export interface ImportArticle {
  id: string; slug: string; title: string; summary: string; tags: string[]; lane: ContentLane;
  editorialStatus: EditorialStatus; sourceVersion: 'v0.16.1'; demonstration: boolean; rawText: string;
  sourceSha256: string; map: GameMap; citations: Citation[]; technicalEvidence: TechnicalEvidence[]; relatedIds: string[];
}
export interface ImportEnvelope { schemaVersion: 1; sourceVersion: 'v0.16.1'; articles: ImportArticle[] }
export interface ApprovedEntry { id: string; sha256: string; map: GameMap; gameBuild: string; buildChannel: 'stable' | 'experimental' }
export interface ImportAuthorization {
  schemaVersion: 1; sourceVersion: 'v0.16.1'; approvedBy: string; approvedAt: string; entries: ApprovedEntry[];
}

type RecordValue = Record<string, unknown>;
const ID = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HASH = /^[a-f0-9]{64}$/;
const LANES = ['C29', 'E30', 'CE26', 'D30DOC', 'D26'];
function requireCondition(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function object(value: unknown, name: string): RecordValue {
  requireCondition(value !== null && typeof value === 'object' && !Array.isArray(value), `${name}: expected object`); return value as RecordValue;
}
function fields(value: RecordValue, allowed: string[], name: string): void {
  for (const key of Object.keys(value)) requireCondition(allowed.includes(key), `${name}: unexpected field`);
  for (const key of allowed) requireCondition(Object.hasOwn(value, key), `${name}: missing field ${key}`);
}
function text(value: unknown, name: string): asserts value is string { requireCondition(typeof value === 'string' && value.trim().length > 0, `${name}: expected nonempty string`); }
function list(value: unknown, name: string): asserts value is unknown[] { requireCondition(Array.isArray(value), `${name}: expected array`); }
function unique(values: unknown[], name: string): void { requireCondition(new Set(values).size === values.length, `${name}: duplicates are forbidden`); }
function strings(value: unknown, name: string): asserts value is string[] { list(value, name); value.forEach((item) => text(item, name)); unique(value, name); }
function identifier(value: unknown, name: string): asserts value is string { text(value, name); requireCondition(ID.test(value), `${name}: invalid identifier`); }
function date(value: unknown, name: string): void {
  text(value, name);
  const parsed = Date.parse(value);
  requireCondition(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(parsed), `${name}: expected UTC timestamp`);
  requireCondition(new Date(parsed).toISOString() === value.replace(/(?<!\.\d{3})Z$/, '.000Z'), `${name}: invalid calendar date`);
}
function hash(value: unknown, name: string): void { text(value, name); requireCondition(HASH.test(value), `${name}: expected SHA-256`); }
function citationUrl(value: unknown): void {
  text(value, 'citation.url'); const parsed = new URL(value);
  requireCondition(parsed.protocol === 'https:' && !parsed.username && !parsed.password, 'citation.url: HTTPS URL without credentials required');
}

/** Hash the exact UTF-8 export text, with no normalization or editorial rewriting. */
export function sourceHash(rawText: string): string { return createHash('sha256').update(rawText, 'utf8').digest('hex'); }

/** Demo content is isolated from approved-source exports. */
export function validateDemoArticle(value: unknown): asserts value is DemoArticle {
  const a = object(value, 'demo');
  requireCondition(a.id === 'DEMO-001' && a.slug === 'leer-una-ficha', 'demo: expected isolated sample identifier');
  text(a.title, 'demo.title'); text(a.summary, 'demo.summary'); strings(a.tags, 'demo.tags');
  requireCondition(Number.isInteger(a.readingMinutes) && Number(a.readingMinutes) > 0, 'demo: invalid reading time');
  const meta = object(a.metadata, 'demo.metadata');
  requireCondition(meta.mode === 'demo' && meta.editorialStatus === 'demo' && meta.technicalStatus === 'unverified' && meta.sourceVersion === null && meta.map === 'none' && meta.lane === 'demo', 'demo: cannot claim approval, technical verification or master provenance');
  text(meta.notice, 'demo.notice');
  list(a.sections, 'demo.sections'); requireCondition(a.sections.length > 0, 'demo: sections required');
  const ids = a.sections.map((entry) => {
    const section = object(entry, 'demo.section'); text(section.id, 'section.id'); requireCondition(SLUG.test(section.id), 'demo: invalid section anchor');
    text(section.title, 'section.title'); strings(section.paragraphs, 'section.paragraphs'); requireCondition(section.paragraphs.length > 0, 'demo: empty section'); return section.id;
  });
  unique(ids, 'demo.section IDs');
  const card = object(a.quickCard, 'demo.quickCard');
  requireCondition(card.id === 'DEMO-CARD-001' && card.articleId === a.id && card.demonstration === true, 'demo: quick card must stay in demo namespace');
  text(card.title, 'card.title'); strings(card.items, 'card.items'); requireCondition(card.items.length > 0, 'demo: empty quick card');
  list(a.references, 'demo.references');
  const refs = a.references.map((entry) => {
    const ref = object(entry, 'demo.reference'); text(ref.label, 'reference.label'); text(ref.href, 'reference.href');
    requireCondition(/^\/(?!\/)[a-z0-9\/#-]*$/.test(ref.href) && !ref.href.includes('..'), 'demo: unsafe cross-reference'); return ref.href;
  });
  unique(refs, 'demo.references');
}

export function validateAuthorization(value: unknown): asserts value is ImportAuthorization {
  const auth = object(value, 'authorization');
  fields(auth, ['schemaVersion', 'sourceVersion', 'approvedBy', 'approvedAt', 'entries'], 'authorization');
  requireCondition(auth.schemaVersion === 1 && auth.sourceVersion === SOURCE_BASELINE.version, 'authorization: unsupported schema or source version');
  text(auth.approvedBy, 'authorization.approvedBy'); date(auth.approvedAt, 'authorization.approvedAt'); list(auth.entries, 'authorization.entries');
  requireCondition(auth.entries.length > 0 && auth.entries.length <= SOURCE_BASELINE.approvedArticles, 'authorization: expected a reviewed subset of at most 84 articles');
  const ids = auth.entries.map((entry) => {
    const e = object(entry, 'authorization.entry'); fields(e, ['id', 'sha256', 'map', 'gameBuild', 'buildChannel'], 'authorization.entry');
    identifier(e.id, 'authorization.id'); hash(e.sha256, 'authorization.sha256');
    requireCondition(!/^(?:DEMO|CHR|LIV|AUD)(?:-|$)/.test(e.id), 'authorization: isolated or demo namespace is blocked');
    requireCondition(e.map === 'chernarus-plus', 'authorization: Livonia requires a separate approved policy'); text(e.gameBuild, 'authorization.gameBuild');
    requireCondition(e.buildChannel === 'stable' || e.buildChannel === 'experimental', 'authorization: invalid build channel'); return e.id;
  });
  unique(ids, 'authorization.ids');
}

/** One invalid record rejects the entire batch. This function never writes files. */
export function validateProductionImport(value: unknown, authorization: unknown): asserts value is ImportEnvelope {
  validateAuthorization(authorization);
  const envelope = object(value, 'import'); fields(envelope, ['schemaVersion', 'sourceVersion', 'articles'], 'import');
  requireCondition(envelope.schemaVersion === 1 && envelope.sourceVersion === SOURCE_BASELINE.version, 'import: unsupported schema or source version');
  list(envelope.articles, 'import.articles');
  requireCondition(envelope.articles.length > 0 && envelope.articles.length <= SOURCE_BASELINE.approvedArticles, 'import: expected a nonempty reviewed subset of at most 84 articles');
  const approved = new Map(authorization.entries.map((entry) => [entry.id, entry]));
  const articleIds: string[] = []; const slugs: string[] = [];
  for (const record of envelope.articles) {
    const a = object(record, 'article');
    fields(a, ['id', 'slug', 'title', 'summary', 'tags', 'lane', 'editorialStatus', 'sourceVersion', 'demonstration', 'rawText', 'sourceSha256', 'map', 'citations', 'technicalEvidence', 'relatedIds'], 'article');
    identifier(a.id, 'article.id'); requireCondition(approved.has(a.id), 'article: ID absent from the exact reviewed allowlist');
    const expected = approved.get(a.id)!;
    requireCondition(a.lane === 'core', 'article: CHR, LIV and AUD-130 remain isolated');
    requireCondition(a.demonstration === false && a.editorialStatus === 'approved', 'article: demonstrations and unapproved content cannot be exported');
    requireCondition(a.sourceVersion === SOURCE_BASELINE.version, 'article: source version mismatch');
    text(a.slug, 'article.slug'); requireCondition(SLUG.test(a.slug), 'article: unsafe slug'); slugs.push(a.slug);
    text(a.title, 'article.title'); text(a.summary, 'article.summary'); strings(a.tags, 'article.tags');
    text(a.rawText, 'article.rawText'); hash(a.sourceSha256, 'article.sourceSha256');
    requireCondition(sourceHash(a.rawText) === a.sourceSha256 && a.sourceSha256 === expected.sha256, 'article: source hash mismatch');
    requireCondition(a.map === expected.map && a.map === 'chernarus-plus', 'article: map not authorized');
    list(a.citations, 'article.citations'); requireCondition(a.citations.length > 0, 'article: citations required');
    const citationIds = a.citations.map((record) => {
      const c = object(record, 'citation'); fields(c, ['id', 'label', 'url', 'accessedAt'], 'citation');
      identifier(c.id, 'citation.id'); text(c.label, 'citation.label'); citationUrl(c.url); date(c.accessedAt, 'citation.accessedAt'); return c.id;
    });
    unique(citationIds, 'article.citation IDs'); list(a.technicalEvidence, 'article.technicalEvidence');
    requireCondition(a.technicalEvidence.length > 0, 'article: technical provenance required independently of editorial approval');
    const evidenceKeys: string[] = [];
    for (const record of a.technicalEvidence) {
      const e = object(record, 'evidence');
      fields(e, ['lane', 'status', 'gameBuild', 'buildChannel', 'map', 'platform', 'checkedAt', 'reviewer', 'citationIds'], 'evidence');
      requireCondition(typeof e.lane === 'string' && LANES.includes(e.lane), 'evidence: unknown evidence lane');
      requireCondition(e.lane !== 'D26', 'evidence: D26 is blocked and cannot substantiate official statistics');
      requireCondition(e.status === 'verified', 'evidence: unverified or documentary evidence cannot be exported as technical verification');
      requireCondition(e.gameBuild === expected.gameBuild && e.buildChannel === expected.buildChannel, 'evidence: build provenance mismatch');
      requireCondition(e.map === expected.map && e.platform === 'vanilla-pc', 'evidence: map/platform provenance mismatch');
      date(e.checkedAt, 'evidence.checkedAt'); text(e.reviewer, 'evidence.reviewer'); strings(e.citationIds, 'evidence.citationIds');
      requireCondition(e.citationIds.length > 0 && e.citationIds.every((id) => citationIds.includes(id)), 'evidence: unresolved citation');
      evidenceKeys.push(`${e.lane}:${e.gameBuild}:${e.map}`);
    }
    unique(evidenceKeys, 'article.evidence records'); strings(a.relatedIds, 'article.relatedIds');
    for (const id of a.relatedIds) { identifier(id, 'relatedId'); requireCondition(id !== a.id, 'article: self-reference forbidden'); }
    articleIds.push(a.id);
  }
  unique(articleIds, 'import.article IDs'); unique(slugs, 'import.slugs');
  for (const a of envelope.articles as ImportArticle[]) requireCondition(a.relatedIds.every((id) => articleIds.includes(id)), 'article: unresolved cross-reference in export');
}

/** Pure export boundary; publication still requires separate human authorization. */
export function createProductionExport(value: unknown, authorization: unknown): ImportEnvelope {
  validateProductionImport(value, authorization); return structuredClone(value);
}
