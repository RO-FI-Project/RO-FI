import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

export const logClick = mutationGeneric({
  args: {
    channel: v.union(v.literal("vn_bank"), v.literal("paypal"), v.literal("stripe")),
    amountPreset: v.optional(v.string()),
    ref: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("donationClicks", {
      channel: args.channel,
      amountPreset: args.amountPreset,
      ref: args.ref,
      createdAt: Date.now(),
    });
  },
});
