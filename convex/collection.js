import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if(!user) return new ConvexError('Unauthorized');
    return await ctx.db.query("legoSets").collect();
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
    collectionId: v.optional(v.id('collections')),
    quantity: v.optional(v.number()),
    condition: v.optional(v.string()),
  },
  handler: async (ctx, { name, num_parts, set_img_url, set_num, set_url, theme_id, year, collectionId }) => {
    // Get the logged-in user
    const user = await ctx.auth.getUserIdentity();
    console.log("User: ", user);
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
    const setId = await ctx.db.insert('legoSets', {
      ownerId: user.subject,
      collectionId: collectionId || null, 
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

    return collectionId;
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
      .query("legoSets")
      .filter((q) => q.eq(q.field("collectionId"), collectionId))
      .collect();

    return legoSets;
  },
});

// get quantity and condition of a set in a collection
export const getCollectionSetQuantities = query({
  args: {
    collectionId: v.id('collections'),
  },
  handler: async (ctx, { collectionId }) => {
    return await ctx.db
      .query('collectionSetQuantity')
      .withIndex('by_collection', (q) => q.eq('collectionId', collectionId))
      .collect();
  },
});


// Add the quantity and condition of a set in a collection AI GENERATED Check.
export const addCollectionSetQuantity = mutation({
  args: {
    collectionId: v.id('collections'),
    setNum: v.string(),
    quantity: v.number(),
    condition: v.optional(v.string()),
    ownerId: v.string(),
  },
  handler: async (ctx, { collectionId, setNum, quantity, condition , ownerId}) => {
    return await ctx.db.insert('collectionSetQuantity', {
      collectionId,
      setNum,
      quantity,
      condition,
      ownerId,
    });
  },
});

export const removeSetFromCollection = mutation({
  args: {
    setNum: v.string(),
    collectionId: v.id("collections"),
  },
  handler: async (ctx, { setNum, collectionId }) => {
    console.log("Removing set:", setNum, "from collection:", collectionId);

    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Ensure the collection exists and belongs to the user
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.ownerId !== user.subject) {
      throw new Error("Collection not found or unauthorized");
    }

    // Find the specific collection entry for the given setNum
    const collectionEntry = await ctx.db
      .query("collectionSetQuantity")
      .withIndex("by_set_num_and_collection", (q) =>
        q.eq("setNum", setNum).eq("collectionId", collectionId)
      )
      .first();

    if (!collectionEntry) {
      throw new Error("Set not found in collection");
    }

    // If quantity is more than 1, decrement it instead of deleting
    if (collectionEntry.quantity > 1) {
      await ctx.db.patch(collectionEntry._id, {
        quantity: collectionEntry.quantity - 1,
      });
    } else {
      // If only one exists, delete the record from collectionSetQuantity
      await ctx.db.delete(collectionEntry._id);

      // // Now, check if there are any remaining entries for this setNum in this collection
      // const remainingEntries = await ctx.db
      //   .query("collectionSetQuantity")
      //   .withIndex("by_set_num_and_collection", (q) =>
      //     q.eq("setNum", setNum).eq("collectionId", collectionId)
      //   )
      //   .collect();

      // If there are no more entries for this set in the collection, remove it from legoSets
      //if (remainingEntries.length === 0) {
        const legoSetEntry = await ctx.db
          .query("legoSets")
          .withIndex("by_set_num", (q) => q.eq("set_num", setNum))
          .first();

        if (legoSetEntry) {
          await ctx.db.delete(legoSetEntry._id);
        }
      }
    //}

    return { success: true, message: "Set removed from collection" };
  },
});

// Add a quantity of a set to a collection using collectionId, setNum, ownerId, and quantity
export const addQuantityToCollection = mutation({
  args: {
    collectionId: v.id('collections'),
    setNum: v.string(),
    ownerId: v.string(),
    quantity: v.number(),
    condition: v.optional(v.string()),
  },
  handler: async (ctx, { collectionId, setNum, ownerId, quantity, condition }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Unauthorized');
    }
    // Ensure the user is the owner of the collection
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.ownerId !== user.subject) {
      throw new Error('Collection not found or unauthorized');
    }

    // Check if the set already exists in the collection
    const existingEntry = await ctx.db
      .query('collectionSetQuantity')
      .withIndex('by_set_num_and_collection', (q) => q.eq('setNum', setNum).eq('collectionId', collectionId))
      .first();

    // If the set already exists, increment the quantity
    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, { quantity: existingEntry.quantity + quantity });
    } else {
      console.error("There is no existing entry for this set in the collection");
    }

    return { success: true, message: 'Quantity added to collection' };
  },
});

// get the quantity of a set in a collection
export const getCollectionSetQuantity = query({
  args: {
    collectionId: v.id('collections'),
    setNum: v.string(),
  },
  handler: async (ctx, { collectionId, setNum }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Ensure the user is the owner of the collection
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.ownerId !== user.subject) {
      throw new Error('Collection not found or unauthorized');
    }

    // Get the quantity of the set in the collection
    const entry = await ctx.db
      .query('collectionSetQuantity')
      .withIndex('by_set_num_and_collection', (q) => q.eq('setNum', setNum).eq('collectionId', collectionId))
      .first();

    return entry?.quantity || 0;
  },
});

// Update the quantity of a set in a collection
export const updateCollectionQuantity = mutation({
  args: {
    collectionId: v.id('collections'),
    setNum: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, { collectionId, setNum, quantity }) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Ensure the user is the owner of the collection
    const collection = await ctx.db.get(collectionId);
    if (!collection || collection.ownerId !== user.subject) {
      throw new Error('Collection not found or unauthorized');
    }

    // Get the collectionSetQuantity entry for the set
    const entry = await ctx.db
      .query('collectionSetQuantity')
      .withIndex('by_set_num_and_collection', (q) => q.eq('setNum', setNum).eq('collectionId', collectionId))
      .first();

    // Update the quantity
    if (entry) {
      await ctx.db.patch(entry._id, { quantity });
    }

    return { success: true, message: 'Quantity updated successfully' };
  },
});