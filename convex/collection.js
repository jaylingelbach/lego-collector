import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if(!user) return new ConvexError('Unauthorized');
    return await ctx.db.query("legoCollection").collect();
  },
});

export const addSetToDB = mutation({
  args: {
    ownerId: v.string(),
    name: v.string(),
    num_parts: v.number(),
    set_img_url: v.string(),
    set_num: v.string(),
    set_url: v.string(),
    theme_id: v.number(),
    year: v.number(),
    collectionId: v.optional(v.id('collections')), // Optional collection to add it to
  },
  handler: async (ctx, { name, num_parts, set_img_url, set_num, set_url, theme_id, year, collectionId }) => {
    // Get the logged-in user
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Ensure the collection exists if provided
    if (collectionId) {
      const collection = await ctx.db.get(collectionId);
      if (!collection || collection.ownerId !== user.subject) {
        throw new Error('Invalid collection');
      }
    }

    // Insert the new set into the database
    const setId = await ctx.db.insert('legoCollection', {
      ownerId: user.subject,
      collectionId: collectionId || null, // If no collection, set to null
      name,
      num_parts,
      set_img_url,
      set_num,
      set_url,
      theme_id,
      year,
    });

    return setId;
  },
});

export const addCollection = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const collectionId = await ctx.db.insert("collections", {
      ownerId: user.subject,
      name,
      createdAt: Date.now(),
    });

    console.log("Collection ID:", collectionId);

    return collectionId;  // Return the generated collectionId
  },
});


// Remove a collection
export const deleteCollection = mutation({
  args: {
    collectionId: v.id("collections"),
  },
  handler: async (ctx, { collectionId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Find the collection
    const collection = await ctx.db.get(collectionId);
    if (!collection) {
      throw new Error("Collection not found");
    }

    // Ensure the user owns the collection
    if (collection.ownerId !== user.subject) {
      throw new Error("You are not authorized to delete this collection");
    }

    // Delete all sets that belong to this collection
    const setsInCollection = await ctx.db
      .query("sets")
      .filter((q) => q.eq(q.field("collectionId"), collectionId))
      .collect();

    for (const set of setsInCollection) {
      await ctx.db.delete(set._id);
    }

    // Delete the collection
    await ctx.db.delete(collectionId);

    return { success: true, message: "Collection deleted successfully" };
  },
});


export const getUserCollections = query({
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("collections")
      .filter((q) => q.eq(q.field("ownerId"), user.subject))
      .collect();
  },
});

// Get collection by id
export const getCollectionById = query({
  args: {
    collectionId: v.id("collections"),
  },
  handler: async (ctx, { collectionId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.ownerId !== user.subject) {
      throw new Error("Collection not found");
    }

    return collection;
  },
});

export const getLegoSetsForCollection = query({
  args: {
    collectionId: v.id("collections"),
  },
  handler: async (ctx, { collectionId }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Ensure the collection exists and belongs to the user
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.ownerId !== user.subject) {
      throw new Error("Collection not found");
    }

    // Fetch LEGO sets for this collection
    const legoSets = await ctx.db
      .query("legoCollection")
      .filter((q) => q.eq(q.field("collectionId"), collectionId))
      .collect();

    return legoSets;
  },
});
