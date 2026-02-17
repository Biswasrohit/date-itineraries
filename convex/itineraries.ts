import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const itineraries = await ctx.db
      .query("itineraries")
      .withIndex("by_date")
      .order("desc")
      .collect();

    return itineraries.map((itinerary) => ({
      ...itinerary,
      id: itinerary._id,
    }));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
    activities: v.optional(v.array(v.any())),
    travelSegments: v.optional(v.array(v.any())),
    keyLocations: v.optional(v.array(v.any())),
    budget: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("itineraries", {
      title: args.title,
      date: args.date,
      description: args.description || "",
      status: "upcoming",
      activities: (args.activities as any) || [],
      travelSegments: args.travelSegments || [],
      keyLocations: (args.keyLocations as any) || [],
      budget: (args.budget as any) || {
        estimated: { total: 0, breakdown: "" },
        actual: { total: null, breakdown: null },
      },
      memories: { reflection: "", favoriteMemory: "", rating: null },
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("itineraries"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("itineraries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
