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
  fanIdeas: defineTable({
    fanName: v.string(),
    idea: v.string(),
    proposedDate: v.string(),
    status: v.union(v.literal("new"), v.literal("reviewing"), v.literal("approved"), v.literal("declined")),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_status", ["status"]),
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
  adminUsers: defineTable({
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
  adminAuditLogs: defineTable({
    actorEmail: v.string(),
    actorRole: v.string(),
    action: v.string(),
    resource: v.string(),
    resourceId: v.optional(v.string()),
    before: v.optional(v.string()),
    after: v.optional(v.string()),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_resource", ["resource"]),
  siteSettings: defineTable({
    brandName: v.string(),
    heroTitle: v.string(),
    heroSubtitle: v.string(),
    donation: v.object({
      bankName: v.string(),
      bankAccountName: v.string(),
      bankAccountNumber: v.string(),
      bankQrUrl: v.optional(v.string()),
      paypalUrl: v.optional(v.string()),
      stripeUrl: v.optional(v.string()),
    }),
    socials: v.array(v.object({ label: v.string(), url: v.string() })),
    updatedAt: v.number(),
  }),
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
