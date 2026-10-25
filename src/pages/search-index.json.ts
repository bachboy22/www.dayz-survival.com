import type { APIRoute } from 'astro';
import { catalog } from '../data/catalog';
import { buildSearchIndex } from '../lib/search-index';
export const prerender = true;
export const GET: APIRoute = () => new Response(JSON.stringify(buildSearchIndex(catalog)), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
