import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  releases: defineTable({
    title: v.string(),
    releaseDate: v.string(),
    type: v.string(),
    status: v.string(),
    description: v.string(),
    coverUrl: v.optional(v.string()),
    links: v.optional(v.array(v.string())),
    isPublic: v.boolean(),
  }).index("by_releaseDate", ["releaseDate"]),
  donationClicks: defineTable({
    channel: v.union(v.literal("vn_bank"), v.literal("paypal"), v.literal("stripe")),
    amountPreset: v.optional(v.string()),
    createdAt: v.number(),
    ref: v.optional(v.string()),
  }).index("by_createdAt", ["createdAt"]),
  collabLeads: defineTable({
    name: v.string(),
    email: v.string(),
    org: v.optional(v.string()),
    message: v.string(),
    budget: v.optional(v.string()),
    deadline: v.optional(v.string()),
    source: v.optional(v.string()),
    createdAt: v.number(),
    status: v.union(v.literal("new"), v.literal("responded"), v.literal("archived")),
  }).index("by_createdAt", ["createdAt"]),
  settings: defineTable({
    bankName: v.string(),
    bankAccountName: v.string(),
    bankAccountNumber: v.string(),
    bankQrUrl: v.optional(v.string()),
    paypalUrl: v.optional(v.string()),
    stripeUrl: v.optional(v.string()),
    socials: v.array(v.object({ label: v.string(), url: v.string() })),
    updatedAt: v.number(),
  }),
});
