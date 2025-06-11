import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get all agents for a user
export const getUserAgents = query({
  args: { sessionId: v.optional(v.id("sessions")) },
  handler: async (ctx, args) => {
    if (!args.sessionId) return [];

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return [];
    }

    const agents = await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .collect();

    return agents;
  },
});

// Get single agent details
export const getAgent = query({
  args: { 
    sessionId: v.optional(v.id("sessions")),
    agentId: v.id("agents") 
  },
  handler: async (ctx, args) => {
    if (!args.sessionId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.userId !== session.userId) {
      return null;
    }

    return agent;
  },
});

// Create new agent
export const createAgent = mutation({
  args: {
    sessionId: v.id("sessions"),
    name: v.string(),
    description: v.optional(v.string()),
    strategy: v.string(),
    config: v.object({
      riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      maxTradeSize: v.number(),
      stopLoss: v.number(),
      takeProfit: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Demo users can't create agents
    if (user.isDemo) {
      throw new Error("Demo users cannot create agents");
    }

    const agentId = await ctx.db.insert("agents", {
      userId: session.userId,
      name: args.name,
      description: args.description,
      status: "paused",
      strategy: args.strategy,
      fundsAllocated: 0,
      currentBalance: 0,
      totalPnL: 0,
      totalTrades: 0,
      winRate: 0,
      createdAt: Date.now(),
      config: args.config,
    });

    return agentId;
  },
});

// Update agent status
export const updateAgentStatus = mutation({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("stopped")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.userId !== session.userId) {
      throw new Error("Agent not found or access denied");
    }

    const user = await ctx.db.get(session.userId);
    if (user?.isDemo) {
      throw new Error("Demo users cannot modify agents");
    }

    await ctx.db.patch(args.agentId, {
      status: args.status,
    });

    return args.agentId;
  },
});

// Get demo agents for guest users
export const getDemoAgents = query({
  args: {},
  handler: async (ctx) => {
    // Return demo agents for guest users
    const demoUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isDemo"), true))
      .first();

    if (!demoUser) return [];

    const agents = await ctx.db
      .query("agents")
      .withIndex("by_user", (q) => q.eq("userId", demoUser._id))
      .collect();

    return agents;
  },
});
