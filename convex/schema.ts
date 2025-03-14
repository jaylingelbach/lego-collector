import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Users table - stores information about the users
  users: defineTable({
    userId: v.string(), // Unique ID for the user
    username: v.string(), // Username for the user
    email: v.string(), // Email for the user (optional)
  }),

  // Collections table - stores information about each collection (singular collection)
  collections: defineTable({
    ownerId: v.string(), // Reference to the user who owns the collection
    name: v.string(), // Name of the collection (e.g., "Star Wars Sets")
    createdAt: v.number(), // Timestamp of when the collection was created
  }),

  // LEGO sets table - stores information about each LEGO set, linked to a collection
  legoSets: defineTable({
    collectionId: v.id('collections'), // Links to the collection this set belongs to
    ownerId: v.string(), // Reference to the user who owns the collection
    name: v.string(), // Name of the LEGO set
    num_parts: v.number(), // Number of parts in the set
    set_img_url: v.optional(v.string()), // Image URL for the LEGO set
    set_num: v.string(), // Set number (e.g., 75255)
    set_url: v.string(), // URL for the LEGO set
    theme_id: v.number(), // Theme ID (e.g., Star Wars, City)
    year: v.number(), // Year the LEGO set was released
  })
    .index('by_theme', ['theme_id'])
    .index('by_year', ['year'])
    .index('by_set_num', ['set_num']),

  collectionSetQuantity: defineTable({
    collectionId: v.id('collections'), // Links to the collection this set belongs to
    setNum: v.string(), // Set number (e.g., 75255)
    quantity: v.number(), // Number of sets in the collection
    condition: v.union(v.literal('new'), v.literal('used')), // Condition of the set (new or used)
    ownerId: v.string(), // Reference to the user who owns the collection
  })
    .index('by_collection', ['collectionId'])
    .index('by_set_num', ['setNum'])
    .index('by_set_num_and_collection', ['setNum', 'collectionId']),
});
