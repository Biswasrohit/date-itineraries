import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db
      .query("loveNotes")
      .withIndex("by_createdAt")
      .order("asc")
      .collect();

    return notes.map((n) => ({
      ...n,
      id: n._id,
    }));
  },
});

export const send = mutation({
  args: {
    fromName: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("loveNotes", {
      fromName: args.fromName,
      message: args.message,
      createdAt: Date.now(),
    });
  },
});
