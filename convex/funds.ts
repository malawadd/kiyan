import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get fund allocations for user
export const getUserFunds = query({
  args: { sessionId: v.optional(v.id("sessions")) },
  handler: async (ctx, args) => {
    if (!args.sessionId) return [];

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return [];
    }

    const funds = await ctx.db
      .query("funds")
      .withIndex("by_user", (q) => q.eq("userId", session.userId))
      .order("desc")
      .collect();

    return funds;
  },
});

// Get fund allocations for specific agent
export const getAgentFunds = query({
  args: { 
    sessionId: v.optional(v.id("sessions")),
    agentId: v.id("agents") 
  },
  handler: async (ctx, args) => {
    if (!args.sessionId) return [];

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return [];
    }

    const funds = await ctx.db
      .query("funds")
      .withIndex("by_user_and_agent", (q) => 
        q.eq("userId", session.userId).eq("agentId", args.agentId)
      )
      .order("desc")
      .collect();

    return funds;
  },
});

// Allocate funds to agent
export const fundAgent = mutation({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    amount: v.number(),
    txHash: v.optional(v.string()),
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

    // Demo users can't fund agents
    if (user.isDemo) {
      throw new Error("Demo users cannot fund agents");
    }

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.userId !== session.userId) {
      throw new Error("Agent not found or access denied");
    }

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    // Create fund allocation record
    const fundId = await ctx.db.insert("funds", {
      userId: session.userId,
      agentId: args.agentId,
      amount: args.amount,
      type: "allocation",
      status: args.txHash ? "completed" : "pending",
      txHash: args.txHash,
      createdAt: Date.now(),
      completedAt: args.txHash ? Date.now() : undefined,
    });

    // Update agent's allocated funds if completed
    if (args.txHash) {
      await ctx.db.patch(args.agentId, {
        fundsAllocated: agent.fundsAllocated + args.amount,
        currentBalance: agent.currentBalance + args.amount,
      });
    }

    return fundId;
  },
});

// Withdraw funds from agent
export const withdrawFromAgent = mutation({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const user = await ctx.db.get(session.userId);
    if (user?.isDemo) {
      throw new Error("Demo users cannot withdraw funds");
    }

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.userId !== session.userId) {
      throw new Error("Agent not found or access denied");
    }

    if (args.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    if (args.amount > agent.currentBalance) {
      throw new Error("Insufficient agent balance");
    }

    // Create withdrawal record
    const fundId = await ctx.db.insert("funds", {
      userId: session.userId,
      agentId: args.agentId,
      amount: args.amount,
      type: "withdrawal",
      status: "completed",
      createdAt: Date.now(),
      completedAt: Date.now(),
    });

    // Update agent balance
    await ctx.db.patch(args.agentId, {
      currentBalance: agent.currentBalance - args.amount,
    });

    return fundId;
  },
});
