import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get recent transactions for user (all agents)
export const getRecentTransactions = query({
  args: { 
    sessionId: v.optional(v.id("sessions")),
    limit: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    if (!args.sessionId) {
      // Return demo transactions for guest users
      const demoUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("isDemo"), true))
        .first();

      if (!demoUser) return [];

      return await ctx.db
        .query("transactions")
        .withIndex("by_user_and_timestamp", (q) => q.eq("userId", demoUser._id))
        .order("desc")
        .take(limit);
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return [];
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_timestamp", (q) => q.eq("userId", session.userId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

// Get transactions for specific agent
export const getAgentTransactions = query({
  args: { 
    sessionId: v.optional(v.id("sessions")),
    agentId: v.id("agents"),
    limit: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    if (!args.sessionId) {
      // For demo users, just return transactions for the agent
      return await ctx.db
        .query("transactions")
        .withIndex("by_agent_and_timestamp", (q) => q.eq("agentId", args.agentId))
        .order("desc")
        .take(limit);
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return [];
    }

    // Verify agent belongs to user
    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.userId !== session.userId) {
      return [];
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_agent_and_timestamp", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

// Simulate agent trade (for demo or bot execution)
export const executeAgentTrade = mutation({
  args: {
    agentId: v.id("agents"),
    type: v.union(v.literal("buy"), v.literal("sell"), v.literal("swap")),
    asset: v.string(),
    baseAsset: v.optional(v.string()),
    quoteAsset: v.optional(v.string()),
    amount: v.number(),
    price: v.number(),
    metadata: v.optional(v.object({
      strategy: v.optional(v.string()),
      signal: v.optional(v.string()),
      confidence: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const value = args.amount * args.price;
    const fee = value * 0.001; // 0.1% fee
    
    // Simple P&L calculation (random for demo)
    const pnl = (Math.random() - 0.4) * value * 0.1; // Slightly positive bias

    // Create transaction
    const transactionId = await ctx.db.insert("transactions", {
      userId: agent.userId,
      agentId: args.agentId,
      type: args.type,
      asset: args.asset,
      baseAsset: args.baseAsset,
      quoteAsset: args.quoteAsset,
      amount: args.amount,
      price: args.price,
      value: value,
      fee: fee,
      pnl: pnl,
      status: "completed",
      timestamp: Date.now(),
      metadata: args.metadata,
    });

    // Update agent stats
    const newTotalTrades = agent.totalTrades + 1;
    const newTotalPnL = agent.totalPnL + pnl;
    const newWinRate = pnl > 0 ? 
      ((agent.winRate * agent.totalTrades) + 1) / newTotalTrades :
      (agent.winRate * agent.totalTrades) / newTotalTrades;

    await ctx.db.patch(args.agentId, {
      totalTrades: newTotalTrades,
      totalPnL: newTotalPnL,
      winRate: newWinRate,
      currentBalance: agent.currentBalance + pnl - fee,
      lastTradeAt: Date.now(),
    });

    return transactionId;
  },
});
