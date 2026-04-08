// One-shot importer: parses the four CSVs in tempdir/ and bulk-inserts into Convex.
// Usage: node scripts/importRatings.mjs
//
// Requires VITE_CONVEX_URL in .env or env.
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Load VITE_CONVEX_URL from .env.local or .env
function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    try {
      const text = readFileSync(join(root, name), 'utf8');
      for (const line of text.split('\n')) {
        const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*?)\s*(#.*)?$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
      }
    } catch {}
  }
}
loadEnv();

const url = process.env.VITE_CONVEX_URL;
if (!url) {
  console.error('VITE_CONVEX_URL not set');
  process.exit(1);
}

// Simple CSV parser (handles quoted fields).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(cur);
      cur = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f !== ''));
}

function num(v) {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function bool(v) {
  return String(v).trim().toUpperCase() === 'TRUE';
}

function loadCsv(filename) {
  const text = readFileSync(join(root, 'tempdir', filename), 'utf8');
  return parseCsv(text);
}

// Movies & Shows: Title, <watched TRUE/FALSE>, Rohit, Farhin, Total
function parseSimple(filename, category) {
  const rows = loadCsv(filename).slice(1); // drop header
  const items = [];
  for (const r of rows) {
    const title = (r[0] || '').trim();
    if (!title) continue;
    items.push({
      title,
      category,
      watched: bool(r[1]),
      rohitRating: num(r[2]),
      farhinRating: num(r[3]),
    });
  }
  return items;
}

// Anime: Title, Genre, RohitSeen, RohitRating, FarhinSeen, FarhinRating, Total
function parseAnime() {
  const rows = loadCsv('Farhin Rohit Anime Master List.csv').slice(1);
  const items = [];
  for (const r of rows) {
    const title = (r[0] || '').trim();
    if (!title) continue;
    const genre = (r[1] || '').trim() || undefined;
    items.push({
      title,
      category: 'anime',
      subCategory: genre,
      watched: bool(r[2]) || bool(r[4]),
      rohitRating: num(r[3]),
      farhinRating: num(r[5]),
    });
  }
  return items;
}

// Food: Title, Cuisine, RohitTried, RohitRating, FarhinTried, FarhinRating, Total
function parseFood() {
  const rows = loadCsv('Farhin Rohit Food Master List.csv').slice(1);
  const items = [];
  for (const r of rows) {
    const title = (r[0] || '').trim();
    if (!title) continue;
    const cuisine = (r[1] || '').trim() || undefined;
    items.push({
      title,
      category: 'food',
      subCategory: cuisine,
      watched: bool(r[2]) || bool(r[4]),
      rohitRating: num(r[3]),
      farhinRating: num(r[5]),
    });
  }
  return items;
}

async function main() {
  const client = new ConvexHttpClient(url);

  const batches = [
    { category: 'movies', items: parseSimple('Farhin Rohit Movies List.csv', 'movies') },
    { category: 'shows', items: parseSimple('Farhin Rohit Master List.csv', 'shows') },
    { category: 'anime', items: parseAnime() },
    { category: 'food', items: parseFood() },
  ];

  for (const batch of batches) {
    console.log(`Importing ${batch.items.length} ${batch.category}...`);
    const n = await client.mutation(api.ratings.bulkInsert, {
      items: batch.items,
      replaceCategory: batch.category,
    });
    console.log(`  inserted ${n}`);
  }

  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
