import assert from 'node:assert/strict';
import { demoArticles } from '../src/data/demo';
import { validateDemoArticle } from '../src/lib/content';
assert.equal(demoArticles.length, 1, 'The MVP contains exactly one synthetic article.');
for (const article of demoArticles) validateDemoArticle(article);
console.log('Content validation passed: 1 synthetic article, 1 demo quick card, 0 master manuscripts.');

import { catalog } from '../src/data/catalog';
import { validatePrototype } from '../src/lib/prototype';
validatePrototype(catalog);
console.log(`Prototype validation passed: ${catalog.length} DEMO articles and cards; 0 real manuscripts.`);
