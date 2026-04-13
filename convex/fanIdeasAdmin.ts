import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const statusUnion = v.union(
  v.literal("new"),
  v.literal("reviewing"),
  v.literal("approved"),
  v.literal("declined")
);

export const list = queryGeneric({
  args: {
    status: v.optional(statusUnion),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("fanIdeas")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("fanIdeas").order("desc").collect();
  },
});

export const updateStatus = mutationGeneric({
  args: {
    id: v.id("fanIdeas"),
    status: statusUnion,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
