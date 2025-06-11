import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Seed demo data for guest users
export const seedDemoData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if demo user already exists
    const existingDemoUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isDemo"), true))
      .first();

    if (existingDemoUser) {
      return existingDemoUser._id;
    }

    // Create demo user
    const demoUserId = await ctx.db.insert("users", {
      name: "Demo User",
      createdAt: Date.now(),
      isDemo: true,
    });

    // Create demo agents
    const agent1Id = await ctx.db.insert("agents", {
      userId: demoUserId,
      name: "Momentum Trader",
      description: "High-frequency momentum trading strategy",
      status: "active",
      strategy: "momentum",
      fundsAllocated: 10000,
      currentBalance: 12450,
      totalPnL: 2450,
      totalTrades: 156,
      winRate: 0.68,
      createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
      lastTradeAt: Date.now() - (5 * 60 * 1000),
      config: {
        riskLevel: "medium",
        maxTradeSize: 1000,
        stopLoss: 0.05,
        takeProfit: 0.15,
      },
    });

    const agent2Id = await ctx.db.insert("agents", {
      userId: demoUserId,
      name: "Grid Bot",
      description: "Grid trading strategy for sideways markets",
      status: "active",
      strategy: "grid",
      fundsAllocated: 5000,
      currentBalance: 5280,
      totalPnL: 280,
      totalTrades: 89,
      winRate: 0.72,
      createdAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
      lastTradeAt: Date.now() - (2 * 60 * 1000),
      config: {
        riskLevel: "low",
        maxTradeSize: 500,
        stopLoss: 0.03,
        takeProfit: 0.08,
      },
    });

    const agent3Id = await ctx.db.insert("agents", {
      userId: demoUserId,
      name: "Arbitrage Hunter",
      description: "Cross-exchange arbitrage opportunities",
      status: "paused",
      strategy: "arbitrage",
      fundsAllocated: 8000,
      currentBalance: 7650,
      totalPnL: -350,
      totalTrades: 34,
      winRate: 0.44,
      createdAt: Date.now() - (21 * 24 * 60 * 60 * 1000),
      lastTradeAt: Date.now() - (3 * 60 * 60 * 1000),
      config: {
        riskLevel: "high",
        maxTradeSize: 2000,
        stopLoss: 0.08,
        takeProfit: 0.25,
      },
    });

    // Create demo transactions
    const assets = ["BTC", "ETH", "USDC", "SOL", "AVAX"];
    const agents = [agent1Id, agent2Id, agent3Id];

    for (let i = 0; i < 50; i++) {
      const agentId = agents[Math.floor(Math.random() * agents.length)];
      const asset = assets[Math.floor(Math.random() * assets.length)];
      const type = Math.random() > 0.5 ? "buy" : "sell";
      const amount = Math.random() * 10 + 0.1;
      const price = Math.random() * 50000 + 1000;
      const value = amount * price;
      const fee = value * 0.001;
      const pnl = (Math.random() - 0.4) * value * 0.1;

      await ctx.db.insert("transactions", {
        userId: demoUserId,
        agentId: agentId,
        type: type as "buy" | "sell",
        asset: asset,
        amount: amount,
        price: price,
        value: value,
        fee: fee,
        pnl: pnl,
        status: "completed",
        timestamp: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000),
        metadata: {
          strategy: "demo",
          confidence: Math.random(),
        },
      });
    }

    // Create demo fund allocations
    await ctx.db.insert("funds", {
      userId: demoUserId,
      agentId: agent1Id,
      amount: 10000,
      type: "allocation",
      status: "completed",
      createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
      completedAt: Date.now() - (7 * 24 * 60 * 60 * 1000),
    });

    await ctx.db.insert("funds", {
      userId: demoUserId,
      agentId: agent2Id,
      amount: 5000,
      type: "allocation",
      status: "completed",
      createdAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
      completedAt: Date.now() - (14 * 24 * 60 * 60 * 1000),
    });

    await ctx.db.insert("funds", {
      userId: demoUserId,
      agentId: agent3Id,
      amount: 8000,
      type: "allocation",
      status: "completed",
      createdAt: Date.now() - (21 * 24 * 60 * 60 * 1000),
      completedAt: Date.now() - (21 * 24 * 60 * 60 * 1000),
    });

    // Create portfolio snapshots for chart data
    for (let i = 30; i >= 0; i--) {
      const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000);
      const baseValue = 23000;
      const variation = (Math.random() - 0.5) * 2000;
      
      await ctx.db.insert("portfolioSnapshots", {
        userId: demoUserId,
        totalValue: baseValue + variation + (i * 50), // Slight upward trend
        totalAllocated: 23000,
        totalPnL: (baseValue + variation + (i * 50)) - 23000,
        agentCount: 3,
        activeAgentCount: i > 3 ? 2 : 3, // Agent 3 paused recently
        timestamp: timestamp,
      });
    }

    return demoUserId;
  },
});

// Public mutation to initialize demo data
export const initializeDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    // This is a public endpoint that can be called to seed demo data
    // In production, you might want to protect this or run it automatically
    await ctx.runMutation(internal.demoData.seedDemoData, {});
    return "Demo data initialization triggered";
  },
});
