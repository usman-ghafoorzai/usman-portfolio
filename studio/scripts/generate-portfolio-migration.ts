import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { profile } from '../../src/data/profile';
import { siteContent } from '../../src/data/siteContent';
import { projects } from '../../src/data/projects';
import { experiences } from '../../src/data/experiences';
import { technologies } from '../../src/data/technologies';
import { capabilityAreas } from '../../src/data/capabilities';
import { buildSanityMigrationDocuments, renderSanityMigrationNdjson } from '../../src/content/adapters/sanity/migration/sanity-migration';

// Run from the repository root. This script and its imports perform no network operations.
const documents = buildSanityMigrationDocuments({ profile, siteContent, projects, experiences, technologies, capabilityAreas });
const ndjson = renderSanityMigrationNdjson(documents);
const directory = resolve('studio/.sanity/migrations');
const output = resolve(directory, 'portfolio.ndjson');
await mkdir(directory, { recursive: true });
await writeFile(output, ndjson, 'utf8');
const counts: Record<string, number> = {};
for (const document of documents) counts[document._type] = (counts[document._type] ?? 0) + 1;
console.log(JSON.stringify({ output, total: documents.length, counts, sha256: createHash('sha256').update(ndjson).digest('hex') }, null, 2));
