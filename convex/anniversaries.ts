import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const anniversaries = await ctx.db
      .query("anniversaries")
      .withIndex("by_date")
      .order("asc")
      .collect();

    return anniversaries.map((a) => ({
      ...a,
      id: a._id,
    }));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
    recurring: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("anniversaries", {
      title: args.title,
      date: args.date,
      description: args.description || "",
      recurring: args.recurring,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("anniversaries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
