import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  legoCollections: defineTable({
    title: v.string(),
    // Store references instead of full objects.
    setIds: v.array(v.id('legoSets')),
  }),

  legoSets: defineTable({
    name: v.string(),
    year: v.number(),
    theme_id: v.number(),
    set_img_url: v.string(),
    set_url: v.string(),
    last_modified_dt: v.string(),
  })
    .index('by_theme', ['theme_id']) // Find sets by theme
    .index('by_year', ['year']), // Find sets by year,
});
