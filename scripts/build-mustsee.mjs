// One-off build script: converts the "1001 Movies You Must See Before You Die"
// IMDb export (CSV) into a bundled JSON of fully-normalised TMDB Movie objects,
// so the Must-See category loads instantly (no runtime IMDb->TMDB lookups).
//
// Usage: node scripts/build-mustsee.mjs
// Reads the TMDB v4 read token from .env (EXPO_PUBLIC_TMDB_ACCESS_TOKEN); the
// token is never printed.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CSV_PATH = join(
  homedir(),
  'Downloads',
  '570236b1-65e2-455c-8402-e7680484fc7d.csv',
);
const OUT_PATH = join(ROOT, 'src', 'api', 'mustSee.json');

// TMDB movie genre id -> name (static; matches src/constants/genres.ts).
const GENRE = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

function readToken() {
  const env = readFileSync(join(ROOT, '.env'), 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(/^\s*EXPO_PUBLIC_TMDB_ACCESS_TOKEN\s*=\s*(.+)\s*$/);
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  throw new Error('EXPO_PUBLIC_TMDB_ACCESS_TOKEN not found in .env');
}

// Minimal RFC-4180-ish CSV line parser (handles quoted fields with commas).
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  // Rows can contain quoted newlines; join a proper record first.
  const records = [];
  let buf = '';
  let quotes = 0;
  for (const line of text.split(/\r?\n/)) {
    buf += (buf ? '\n' : '') + line;
    quotes += (line.match(/"/g) || []).length;
    if (quotes % 2 === 0) { records.push(buf); buf = ''; }
  }
  const header = parseCsvLine(records.shift());
  const idx = (name) => header.indexOf(name);
  const iConst = idx('Const');
  const iType = idx('Title Type');
  const iTitle = idx('Title');
  const iYear = idx('Year');
  return records
    .filter((r) => r.trim().length > 0)
    .map((r) => {
      const f = parseCsvLine(r);
      return {
        imdb: f[iConst],
        type: f[iType],
        title: f[iTitle],
        year: f[iYear],
      };
    });
}

async function findTmdb(imdbId, token) {
  const url = `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id&language=en-US`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { accept: 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.status === 429) { await sleep(1500); continue; }
      if (!res.ok) return null;
      const data = await res.json();
      return data.movie_results?.[0] ?? null;
    } catch {
      await sleep(500);
    }
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toMovie(m) {
  const year = m.release_date ? Number(m.release_date.slice(0, 4)) : null;
  const genreIds = m.genre_ids ?? [];
  return {
    id: String(m.id),
    title: m.title,
    year: Number.isFinite(year) ? year : null,
    genreIds,
    genres: genreIds.map((g) => GENRE[g]).filter(Boolean),
    posterPath: m.poster_path ?? null,
    backdropPath: m.backdrop_path ?? null,
    overview: m.overview ?? '',
    voteAverage: m.vote_average ?? 0,
    voteCount: m.vote_count ?? 0,
    popularity: m.popularity ?? 0,
    mediaType: 'movie',
  };
}

async function main() {
  const token = readToken();
  const rows = parseCsv(readFileSync(CSV_PATH, 'utf8')).filter(
    (r) => r.imdb?.startsWith('tt') && (r.type === 'Movie' || r.type === 'Short'),
  );
  console.log(`Films to resolve: ${rows.length}`);

  const results = [];
  const missing = [];
  const CONCURRENCY = 10;
  let done = 0;
  for (let i = 0; i < rows.length; i += CONCURRENCY) {
    const batch = rows.slice(i, i + CONCURRENCY);
    const resolved = await Promise.all(
      batch.map(async (row) => {
        const m = await findTmdb(row.imdb, token);
        return m ? { row, movie: toMovie(m) } : { row, movie: null };
      }),
    );
    for (const r of resolved) {
      if (r.movie) results.push(r.movie);
      else missing.push(`${r.row.imdb} ${r.row.title}`);
    }
    done += batch.length;
    if (done % 100 === 0 || done === rows.length) {
      console.log(`  ${done}/${rows.length} (kept ${results.length})`);
    }
  }

  // De-dup by TMDB id (a couple of IMDb ids can map to the same film).
  const seen = new Set();
  const unique = results.filter((m) =>
    seen.has(m.id) ? false : (seen.add(m.id), true),
  );

  writeFileSync(OUT_PATH, JSON.stringify(unique));
  console.log(`\nWrote ${unique.length} movies -> ${OUT_PATH}`);
  if (missing.length) {
    console.log(`Unresolved (${missing.length}):`);
    missing.slice(0, 40).forEach((x) => console.log('  ' + x));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
