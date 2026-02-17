import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  itineraries: defineTable({
    title: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
    status: v.string(),
    activities: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        type: v.string(),
        startTime: v.optional(v.string()),
        endTime: v.optional(v.string()),
        location: v.optional(
          v.object({
            name: v.optional(v.string()),
            address: v.optional(v.string()),
            crossStreet: v.optional(v.string()),
            neighborhood: v.optional(v.string()),
            mapsUrl: v.optional(v.string()),
            stops: v.optional(v.any()),
          })
        ),
        notes: v.optional(v.string()),
        tips: v.optional(v.string()),
        budget: v.optional(
          v.object({
            estimated: v.optional(v.any()),
            actual: v.optional(v.any()),
            note: v.optional(v.string()),
          })
        ),
        completed: v.boolean(),
        order: v.number(),
      })
    ),
    travelSegments: v.optional(v.array(v.any())),
    keyLocations: v.optional(
      v.array(
        v.object({
          name: v.optional(v.string()),
          address: v.optional(v.string()),
          shortNote: v.optional(v.string()),
        })
      )
    ),
    budget: v.optional(
      v.object({
        estimated: v.optional(
          v.object({
            total: v.optional(v.any()),
            breakdown: v.optional(v.string()),
          })
        ),
        actual: v.optional(
          v.object({
            total: v.optional(v.any()),
            breakdown: v.optional(v.any()),
          })
        ),
      })
    ),
    memories: v.optional(
      v.object({
        reflection: v.optional(v.string()),
        favoriteMemory: v.optional(v.string()),
        rating: v.optional(v.any()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_date", ["date"]),

  anniversaries: defineTable({
    title: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
    recurring: v.boolean(),
    createdAt: v.number(),
  }).index("by_date", ["date"]),

  loveNotes: defineTable({
    fromName: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
