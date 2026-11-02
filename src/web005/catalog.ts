import { readFileSync } from 'node:fs';
import {resolve} from 'node:path';
export interface Entry {
  id: string; title: string; category: string; map: string; status: string; words: number;
  source_hash: string; html: string; body_text: string; related_ids: string[];
  outline: { id: string; title: string; level: number }[];
  evidence: Record<string, string>;
}
export const families: Record<string, string> = { MAN: 'Supervivencia', COM: 'Combate', EQP: 'Equipo', CHR: 'Chernarus', MEC: 'Mecánicas', GUI: 'Guías prácticas', ARC: 'Archivo técnico', LIV: 'Livonia' };
export const states: Record<string, string> = { aprobado_v0161: 'Aprobado v0.16.1', aprobado_chr_r02: 'Aprobado CHR r02', revision_propuesta_chr: 'Revisión propuesta CHR', piloto_liv_original: 'Piloto Livonia original', propuesta_nueva: 'Propuesta nueva' };
// Build-only: fail closed outside the explicitly private build.
export const entries: Entry[] = process.env.WEB005_PRIVATE === '1'
  ? JSON.parse(readFileSync(resolve('private/web005/catalog.json'), 'utf8')) : [];
if (process.env.WEB005_PRIVATE === '1' && (entries.length !== 308 || new Set(entries.map(e => e.id)).size !== 308)) throw new Error('WEB-005 requires 308 unique complete entries');
export const byId = new Map(entries.map(e => [e.id, e]));
