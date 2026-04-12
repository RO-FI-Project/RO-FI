import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const list = queryGeneric({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("collabLeads").order("desc").collect();
  },
});

export const updateStatus = mutationGeneric({
  args: {
    id: v.id("collabLeads"),
    status: v.union(v.literal("new"), v.literal("responded"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
