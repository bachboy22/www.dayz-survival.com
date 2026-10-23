# MVP implementation plan (Codex)

1. Initialize Astro + TypeScript, pin dependencies and ensure `npm run build` succeeds.
2. Implement accessible responsive shell and navigation: Home, Manual, Chernarus, Livonia (draft placeholder), Sources/version notes, About.
3. Create schemas for article, quick card, citations, editorial status and technical evidence by build/map. Ensure draft/unverified data cannot be included in production exports.
4. Build from synthetic fixtures only: one fictional sample article and sample search result, clearly labeled as demos.
5. Add local full-text search over static approved-content exports (once an authorized importer is available), tags, cross-links and reading-time/quick-card views.
6. Create read-only importer contract and validation (exact allowed IDs, hashes, status and build provenance); do not bundle the private Source Master.
7. Add basic accessibility and automated unit/integration checks plus CI that builds but does not deploy.
8. Deliver screenshots, a short architecture decision record, list of changed files, passing tests, and PR/patch. Do not connect production Cloudflare.

Acceptance: local static build works; no live deploy; no private manuscript bytes in repository; example pages are clearly demonstrations; editorial states and verification status never conflated.
