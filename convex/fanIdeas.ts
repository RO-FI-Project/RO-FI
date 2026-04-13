import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const submit = mutationGeneric({
  args: {
    fanName: v.string(),
    idea: v.string(),
    proposedDate: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.fanName.trim() || !args.idea.trim()) {
      throw new Error("Vui lòng nhập tên và ý tưởng.");
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
      idea: args.idea.trim(),
      proposedDate: args.proposedDate,
      status: "new",
      createdAt: Date.now(),
    });
  },
});
