import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

export const createLead = mutationGeneric({
  args: {
    name: v.string(),
    email: v.string(),
    organization: v.optional(v.string()),
    budget: v.optional(v.string()),
    deadline: v.optional(v.string()),
    message: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("collabLeads", {
      name: args.name,
      email: args.email,
      org: args.organization,
      budget: args.budget,
      deadline: args.deadline,
      message: args.message,
      source: args.source,
      createdAt: Date.now(),
      status: "new",
    });
  },
});
