import { query } from "./_generated/server";
import { v } from "convex/values";

// Get portfolio statistics for user
export const getPortfolioStats = query({
  args: { sessionId: v.optional(v.id("sessions")) },
  handler: async (ctx, args) => {
    if (!args.sessionId) {
      // Return demo portfolio stats
      const demoUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("isDemo"), true))
        .first();

      if (!demoUser) {
        return {
          totalValue: 0,
          totalAllocated: 0,
          totalPnL: 0,
          agentCount: 0,
          activeAgentCount: 0,
          agents: [],
        };
      }

      const agents = await ctx.db
        .query("agents")
        .withIndex("by_user", (q) => q.eq("userId", demoUser._id))
        .collect();

      const totalAllocated = agents.reduce((sum, agent) => sum + agent.fundsAllocated, 0);
      const totalPnL = agents.reduce((sum, agent) => sum + agent.totalPnL, 0);
      const totalValue = agents.reduce((sum, agent) => sum + agent.currentBalance, 0);
      const activeAgentCount = agents.filter(agent => agent.status === "active").length;

      return {
        totalValue,
        totalAllocated,
        totalPnL,
        agentCount: agents.length,
        activeAgentCount,
        agents: agents.map(agent => ({
          id: agent._id,
          name: agent.name,
          status: agent.status,
          fundsAllocated: agent.fundsAllocated,
          currentBalance: agent.currentBalance,
          totalPnL: agent.totalPnL,
          winRate: agent.winRate,
          totalTrades: agent.totalTrades,
        })),
      };
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return {
        totalValue: 0,
        totalAllocated: 0,
        totalPnL: 0,
        agentCount: 0,
        activeAgentCount: 0,
        agents: [],
      };
    }

    const agents = await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    const totalAllocated = agents.reduce((sum, agent) => sum + agent.fundsAllocated, 0);
    const totalPnL = agents.reduce((sum, agent) => sum + agent.totalPnL, 0);
    const totalValue = agents.reduce((sum, agent) => sum + agent.currentBalance, 0);
    const activeAgentCount = agents.filter(agent => agent.status === "active").length;

    return {
      totalValue,
      totalAllocated,
      totalPnL,
      agentCount: agents.length,
      activeAgentCount,
      agents: agents.map(agent => ({
        id: agent._id,
        name: agent.name,
        status: agent.status,
        fundsAllocated: agent.fundsAllocated,
        currentBalance: agent.currentBalance,
        totalPnL: agent.totalPnL,
        winRate: agent.winRate,
        totalTrades: agent.totalTrades,
      })),
    };
  },
});

// Get performance chart data
export const getPerformanceData = query({
  args: { 
    sessionId: v.optional(v.id("sessions")),
    days: v.optional(v.number()) 
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    if (!args.sessionId) {
      // Return demo performance data
      const demoUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("isDemo"), true))
        .first();

      if (!demoUser) return [];

      const snapshots = await ctx.db
        .query("portfolioSnapshots")
        .withIndex("by_user_and_timestamp", (q) => 
          q.eq("userId", demoUser._id).gte("timestamp", startTime)
        )
        .collect();

      return snapshots;
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return [];
    }

    const snapshots = await ctx.db
      .query("portfolioSnapshots")
      .withIndex("by_user_and_timestamp", (q) => 
        q.eq("userId", session.userId).gte("timestamp", startTime)
      )
      .collect();

    return snapshots;
  },
});
