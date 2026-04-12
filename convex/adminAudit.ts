import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

export const listRecent = queryGeneric({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("adminAuditLogs").order("desc").take(50);
  },
});

export const logAction = mutationGeneric({
  args: {
    actorEmail: v.string(),
    actorRole: v.string(),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    before: v.optional(v.string()),
    after: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("adminAuditLogs", {
      actorEmail: args.actorEmail,
      actorRole: args.actorRole,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      before: args.before,
      after: args.after,
      ip: args.ip,
      userAgent: args.userAgent,
      createdAt: Date.now(),
    });
  },
});
