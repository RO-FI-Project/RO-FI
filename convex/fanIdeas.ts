import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const submit = mutationGeneric({
  args: {
    fanName: v.string(),
    title: v.string(),
    idea: v.string(),
    proposedDate: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.fanName.trim() || !args.title.trim() || !args.idea.trim()) {
      throw new Error("Vui lòng nhập đầy đủ thông tin.");
    }
    if (!datePattern.test(args.proposedDate)) {
      throw new Error("Ngày đề xuất không hợp lệ.");
    }

    const conflictingRelease = await ctx.db
      .query("releases")
      .withIndex("by_releaseDate", (q) => q.eq("releaseDate", args.proposedDate))
      .first();

    if (conflictingRelease) {
      throw new Error("Ngày này đã có lịch phát hành.");
    }

    await ctx.db.insert("fanIdeas", {
      fanName: args.fanName.trim(),
      title: args.title.trim(),
      idea: args.idea.trim(),
      proposedDate: args.proposedDate,
      likes: 0,
      status: "new",
      createdAt: Date.now(),
    });
  },
});

export const listPublicRecent = queryGeneric({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 12, 50);
    return await ctx.db.query("fanIdeas").order("desc").take(limit);
  },
});

export const incrementLike = mutationGeneric({
  args: {
    id: v.id("fanIdeas"),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.id);
    if (!idea) {
      throw new Error("Ý tưởng không tồn tại.");
    }
    await ctx.db.patch(args.id, { likes: idea.likes + 1 });
  },
});
