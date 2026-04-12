import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const listAll = queryGeneric({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("releases").order("desc").collect();
  },
});

export const upsert = mutationGeneric({
  args: {
    id: v.optional(v.id("releases")),
    title: v.string(),
    releaseDate: v.string(),
    type: v.string(),
    status: v.string(),
    description: v.string(),
    coverUrl: v.optional(v.string()),
    links: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const payload = {
      title: args.title,
      releaseDate: args.releaseDate,
      type: args.type,
      status: args.status,
      description: args.description,
      coverUrl: args.coverUrl,
      links: args.links,
      isPublic: args.isPublic,
    };

    if (args.id) {
      await ctx.db.patch(args.id, payload);
      return args.id;
    }

    return await ctx.db.insert("releases", payload);
  },
});

export const remove = mutationGeneric({
  args: { id: v.id("releases") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
