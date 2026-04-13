import { mutationGeneric, queryGeneric } from "convex/server";
import { v } from "convex/values";

const donationSchema = v.object({
  bankName: v.string(),
  bankAccountName: v.string(),
  bankAccountNumber: v.string(),
  bankBin: v.optional(v.string()),
  bankQrUrl: v.optional(v.string()),
  paypalUrl: v.optional(v.string()),
  stripeUrl: v.optional(v.string()),
});

export const getPublic = queryGeneric({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("siteSettings").first();
  },
});

export const upsert = mutationGeneric({
  args: {
    brandName: v.string(),
    heroTitle: v.string(),
    heroSubtitle: v.string(),
    donation: donationSchema,
    socials: v.array(v.object({ label: v.string(), url: v.string() })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("siteSettings").first();
    const payload = {
      brandName: args.brandName,
      heroTitle: args.heroTitle,
      heroSubtitle: args.heroSubtitle,
      donation: args.donation,
      socials: args.socials,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("siteSettings", payload);
  },
});
