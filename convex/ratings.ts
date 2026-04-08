import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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

export const add = mutation({
  args: {
    title: v.string(),
    category: categoryValidator,
    subCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("ratings", {
      title: args.title,
      category: args.category,
      subCategory: args.subCategory,
      rohitRating: undefined,
      farhinRating: undefined,
      watched: false,
      createdAt: now,
      updatedAt: now,
    });
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
    await ctx.db.patch(id, patch);
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
