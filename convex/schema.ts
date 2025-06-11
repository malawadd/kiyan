import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Extended users table for trading
  users: defineTable({
    walletAddress: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    isDemo: v.optional(v.boolean()),
  })
    .index("by_wallet_address", ["walletAddress"])
    .index("by_email", ["email"])
    .index("by_phone", ["phone"]),

  // Sessions for wallet auth
  sessions: defineTable({
    userId: v.id("users"),
    walletAddress: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_wallet", ["walletAddress"]),

  // Trading agents/bots
  agents: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("stopped")),
    strategy: v.string(), // "momentum", "arbitrage", "grid", etc.
    fundsAllocated: v.number(), // Total funds allocated to this agent
    currentBalance: v.number(), // Current balance after trades
    totalPnL: v.number(), // Profit and Loss
    totalTrades: v.number(),
    winRate: v.number(), // Percentage of winning trades
    createdAt: v.number(),
    lastTradeAt: v.optional(v.number()),
    config: v.object({
      riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      maxTradeSize: v.number(),
      stopLoss: v.number(),
      takeProfit: v.number(),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"]),

  // Fund allocations to agents
  funds: defineTable({
    userId: v.id("users"),
    agentId: v.id("agents"),
    amount: v.number(),
    type: v.union(v.literal("allocation"), v.literal("withdrawal")),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    txHash: v.optional(v.string()), // On-chain transaction hash if applicable
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_agent", ["agentId"])
    .index("by_user_and_agent", ["userId", "agentId"])
    .index("by_status", ["status"]),

  // Trading transactions
  transactions: defineTable({
    userId: v.id("users"),
    agentId: v.id("agents"),
    type: v.union(v.literal("buy"), v.literal("sell"), v.literal("swap")),
    asset: v.string(), // "BTC", "ETH", "USDC", etc.
    baseAsset: v.optional(v.string()), // For swaps: what we're trading from
    quoteAsset: v.optional(v.string()), // For swaps: what we're trading to
    amount: v.number(),
    price: v.number(),
    value: v.number(), // Total value of trade
    fee: v.number(),
    pnl: v.number(), // Profit/Loss for this specific trade
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    exchange: v.optional(v.string()),
    txHash: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.object({
      strategy: v.optional(v.string()),
      signal: v.optional(v.string()),
      confidence: v.optional(v.number()),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_agent", ["agentId"])
    .index("by_user_and_timestamp", ["userId", "timestamp"])
    .index("by_agent_and_timestamp", ["agentId", "timestamp"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  // Portfolio snapshots for performance tracking
  portfolioSnapshots: defineTable({
    userId: v.id("users"),
    totalValue: v.number(),
    totalAllocated: v.number(),
    totalPnL: v.number(),
    agentCount: v.number(),
    activeAgentCount: v.number(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_timestamp", ["userId", "timestamp"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
