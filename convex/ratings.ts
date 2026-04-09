import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

const categoryValidator = v.union(
  v.literal("movies"),
  v.literal("shows"),
  v.literal("anime"),
  v.literal("food")
);

export const list = query({
  args: { category: categoryValidator },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("ratings")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();

    return items.map((r) => ({ ...r, id: r._id }));
  },
});

export const getById = query({
  args: { id: v.id("ratings") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) return null;
    return { ...row, id: row._id };
  },
});

export const add = mutation({
  args: {
    title: v.string(),
    category: categoryValidator,
    subCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("ratings", {
      title: args.title,
      category: args.category,
      subCategory: args.subCategory,
      rohitRating: undefined,
      farhinRating: undefined,
      watched: false,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("ratings"),
    rohitRating: v.optional(v.union(v.number(), v.null())),
    farhinRating: v.optional(v.union(v.number(), v.null())),
    watched: v.optional(v.boolean()),
    subCategory: v.optional(v.string()),
    title: v.optional(v.string()),
    posterUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const patch = { updatedAt: Date.now() };
    if (rest.rohitRating !== undefined)
      patch.rohitRating = rest.rohitRating === null ? undefined : rest.rohitRating;
    if (rest.farhinRating !== undefined)
      patch.farhinRating = rest.farhinRating === null ? undefined : rest.farhinRating;
    if (rest.watched !== undefined) patch.watched = rest.watched;
    if (rest.subCategory !== undefined) patch.subCategory = rest.subCategory;
    if (rest.title !== undefined) patch.title = rest.title;
    if (rest.posterUrl !== undefined) patch.posterUrl = rest.posterUrl;
    await ctx.db.patch(id, patch);
  },
});

export const setPosterUrl = mutation({
  args: {
    id: v.id("ratings"),
    posterUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      posterUrl: args.posterUrl,
      updatedAt: Date.now(),
    });
  },
});

export const bulkInsert = mutation({
  args: {
    items: v.array(
      v.object({
        title: v.string(),
        category: categoryValidator,
        subCategory: v.optional(v.string()),
        rohitRating: v.optional(v.number()),
        farhinRating: v.optional(v.number()),
        watched: v.boolean(),
      })
    ),
    replaceCategory: v.optional(categoryValidator),
  },
  handler: async (ctx, args) => {
    if (args.replaceCategory) {
      const existing = await ctx.db
        .query("ratings")
        .withIndex("by_category", (q) =>
          q.eq("category", args.replaceCategory)
        )
        .collect();
      for (const row of existing) {
        await ctx.db.delete(row._id);
      }
    }
    const now = Date.now();
    for (const item of args.items) {
      await ctx.db.insert("ratings", {
        ...item,
        createdAt: now,
        updatedAt: now,
      });
    }
    return args.items.length;
  },
});

export const remove = mutation({
  args: { id: v.id("ratings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// --- Poster lookup ---------------------------------------------------------
//
// fetchPoster is a Convex action (not a mutation) so it can call out to
// external APIs. It looks up the row, hits TMDB (movies/shows) or Jikan
// (anime), and writes the resulting URL back via setPosterUrl. Failures are
// swallowed — a missing poster is not worth surfacing as a UI error.
//
// Robustness layers:
//   1. Title cleaning  — strip year/region parens before searching.
//   2. Original-title fallback — if the cleaned title fails, retry with the
//      raw title as the user typed it.
//   3. Cross-category fallback — a movie that misses /search/movie is retried
//      against /search/tv (and vice versa); anime falls back to TMDB tv then
//      movie when Jikan misses.

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w154";
const TMDB_API_BASE = "https://api.themoviedb.org/3";
const JIKAN_API_BASE = "https://api.jikan.moe/v4";

let warnedNoTmdbKey = false;

// Strip parenthesised qualifiers like "(2021)", "(US)", "[Sub]" so the search
// query is closer to TMDB's canonical title. Always returns a non-empty
// string — falls back to the original if cleaning would empty it.
function cleanTitle(raw) {
  const cleaned = raw
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s*\[[^\]]*\]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : raw;
}

async function searchTmdb(query, kind) {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    if (!warnedNoTmdbKey) {
      // eslint-disable-next-line no-console
      console.warn(
        "TMDB_API_KEY not set — movie/show posters will be skipped. Run `npx convex env set TMDB_API_KEY <key>`."
      );
      warnedNoTmdbKey = true;
    }
    return null;
  }
  const path = kind === "movie" ? "/search/movie" : "/search/tv";
  const url = `${TMDB_API_BASE}${path}?api_key=${encodeURIComponent(
    key
  )}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  // Walk results to find the first with a poster_path — sometimes the top
  // hit is a niche entry with no artwork while #2 has one.
  for (const result of json?.results ?? []) {
    if (result?.poster_path) {
      return `${TMDB_IMAGE_BASE}${result.poster_path}`;
    }
  }
  return null;
}

// Try cleaned title first, then raw title as a fallback. Both are searched
// against the same TMDB endpoint (movie or tv).
async function lookupTmdb(title, kind) {
  const cleaned = cleanTitle(title);
  const first = await searchTmdb(cleaned, kind);
  if (first) return first;
  if (cleaned !== title) {
    return await searchTmdb(title, kind);
  }
  return null;
}

async function searchJikan(query) {
  const url = `${JIKAN_API_BASE}/anime?q=${encodeURIComponent(
    query
  )}&limit=1&sfw=true`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const first = json?.data?.[0];
  return (
    first?.images?.jpg?.image_url ??
    first?.images?.webp?.image_url ??
    null
  );
}

async function lookupJikan(title) {
  const cleaned = cleanTitle(title);
  const first = await searchJikan(cleaned);
  if (first) return first;
  if (cleaned !== title) {
    return await searchJikan(title);
  }
  return null;
}

async function lookupPoster(title, category) {
  try {
    if (category === "movies") {
      // Movie first, then TV (covers mis-tabbed entries and movie franchises
      // with TV adaptations).
      return (
        (await lookupTmdb(title, "movie")) ??
        (await lookupTmdb(title, "tv"))
      );
    }
    if (category === "shows") {
      return (
        (await lookupTmdb(title, "tv")) ??
        (await lookupTmdb(title, "movie"))
      );
    }
    if (category === "anime") {
      // Jikan/MAL is the most accurate source for anime, but TMDB has many
      // shows and almost all anime films, so use it as a fallback.
      return (
        (await lookupJikan(title)) ??
        (await lookupTmdb(title, "tv")) ??
        (await lookupTmdb(title, "movie"))
      );
    }
    return null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`Poster lookup failed for "${title}" (${category}):`, err);
    return null;
  }
}

export const fetchPoster = action({
  args: {
    id: v.id("ratings"),
    // When true, ignore any cached posterUrl and re-run the lookup. Used by
    // the manual "refresh" button on a row.
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, force }) => {
    const item = await ctx.runQuery(api.ratings.getById, { id });
    if (!item) return null;
    if (item.posterUrl && !force) return null;
    const url = await lookupPoster(item.title, item.category);
    if (url) {
      await ctx.runMutation(api.ratings.setPosterUrl, { id, posterUrl: url });
    }
    return url;
  },
});
