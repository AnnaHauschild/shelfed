// Helper for fun-fact work: resolves show/film titles to TMDB ids so the keys
// in src/api/funFacts.ts are never guessed.
//
// Usage: node scripts/tmdb-id.mjs tv "Breaking Bad" "The Wire"
// Reads the TMDB v4 read token from .env; the token is never printed.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function readToken() {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*EXPO_PUBLIC_TMDB_ACCESS_TOKEN\s*=\s*(.+)\s*$/);
    if (m) return m[1].trim();
  }
  throw new Error('EXPO_PUBLIC_TMDB_ACCESS_TOKEN not found in .env');
}

const [mediaType, ...titles] = process.argv.slice(2);
if (mediaType !== 'tv' && mediaType !== 'movie') {
  console.error('First argument must be "tv" or "movie".');
  process.exit(1);
}

const token = readToken();

for (const title of titles) {
  const url = `https://api.themoviedb.org/3/search/${mediaType}?query=${encodeURIComponent(title)}&language=en-US`;
  const res = await fetch(url, {
    headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const hits = (data.results ?? []).slice(0, 3).map((r) => {
    const name = mediaType === 'tv' ? r.name : r.title;
    const date = mediaType === 'tv' ? r.first_air_date : r.release_date;
    return `${r.id} | ${name} (${(date ?? '').slice(0, 4)})`;
  });
  console.log(`\n== ${title}`);
  console.log(hits.join('\n') || '  no hit');
}
