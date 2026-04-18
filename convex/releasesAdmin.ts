import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const bulkImportRelease = v.object({
  title: v.string(),
  releaseDate: v.string(),
  type: v.string(),
  status: v.string(),
  description: v.string(),
  coverUrl: v.optional(v.string()),
  links: v.optional(v.array(v.string())),
  isPublic: v.boolean(),
});

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

export const bulkImport = mutationGeneric({
  args: {
    releases: v.array(bulkImportRelease),
  },
  handler: async (ctx, args) => {
    if (args.releases.length === 0) {
      return { inserted: 0, skippedDuplicates: 0, invalidCount: 0 };
    }

    const uniqueDates = [...new Set(args.releases.map((release) => release.releaseDate))];
    const existingByKey = new Map<string, true>();

    const existingGroups = await Promise.all(
      uniqueDates.map((releaseDate) =>
        ctx.db
          .query("releases")
          .withIndex("by_releaseDate", (q) => q.eq("releaseDate", releaseDate))
          .collect()
      )
    );

    for (const group of existingGroups) {
      for (const release of group) {
        existingByKey.set(`${release.title}::${release.releaseDate}`, true);
      }
    }

    let inserted = 0;
    let skippedDuplicates = 0;

    for (const release of args.releases) {
      const duplicateKey = `${release.title}::${release.releaseDate}`;
      if (existingByKey.has(duplicateKey)) {
        skippedDuplicates += 1;
        continue;
      }

      await ctx.db.insert("releases", {
        title: release.title,
        releaseDate: release.releaseDate,
        type: release.type,
        status: release.status,
        description: release.description,
        coverUrl: release.coverUrl,
        links: release.links,
        isPublic: release.isPublic,
      });
      existingByKey.set(duplicateKey, true);
      inserted += 1;
    }

    return { inserted, skippedDuplicates, invalidCount: 0 };
  },
});
