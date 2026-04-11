import { queryGeneric } from "convex/server";
import { v } from "convex/values";

export const listByMonth = queryGeneric({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const paddedMonth = String(args.month).padStart(2, "0");
    const start = `${args.year}-${paddedMonth}-01`;
    const endMonth = args.month === 12 ? 1 : args.month + 1;
    const endYear = args.month === 12 ? args.year + 1 : args.year;
    const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    return await ctx.db
      .query("releases")
      .withIndex("by_releaseDate", (q) => q.gte("releaseDate", start).lt("releaseDate", end))
      .collect();
  },
});
