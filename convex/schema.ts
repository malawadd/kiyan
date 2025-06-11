import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const applicationTables = {
  users: defineTable({
    walletAddress: v.optional(v.string()),
    name: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    // Legacy auth fields
    isAnonymous: v.optional(v.boolean()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
  }).index("by_wallet_address", ["walletAddress"]),
  
  sessions: defineTable({
    userId: v.id("users"),
    walletAddress: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...applicationTables,
});
