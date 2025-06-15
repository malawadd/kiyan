import { v } from "convex/values";
import { action, mutation, ActionCtx, MutationCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Import agent from Fleek
export const importAgent = action({
  args: {
    sessionId: v.id("sessions"),
    fleekId: v.string(),
    fleekKey: v.string(),
    nameOverride: v.optional(v.string())
  },
  handler: async (
    ctx: ActionCtx,
    args
  ): Promise<{ agentId: Id<"agents">, agentData: any }> => {
    // Fetch agent from Fleek API
    const response = await fetch(`https://api.fleek.xyz/api/v1/ai-agents/${args.fleekId}`, {
      headers: {
        'X-Api-Key': args.fleekKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.statusText}`);
    }

    const agentData  = await response.json();
    // const agentData = apiResponse.data[0];

    // Create agent directly
    const agentId = await ctx.runMutation(api.fleekAgents.createFleekAgent, {
      sessionId: args.sessionId,
      name: args.nameOverride || agentData.name,
      fleekId: args.fleekId,
      fleekData: agentData,
    });

    return { agentId, agentData };
  }
});

// Store Fleek agent data
export const createFleekAgent = mutation({
  args: {
    sessionId: v.id("sessions"),
    name: v.string(),
    fleekId: v.string(),
    fleekData: v.any(),
  },
  handler: async (
    ctx: MutationCtx,
    args
  ): Promise<Id<"agents">> => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Invalid session");

    return await ctx.db.insert("agents", {
      userId: session.userId,
      name: args.name,
      description: args.fleekData.description,
      status: "paused",
      strategy: "fleek",
      fundsAllocated: 0,
      currentBalance: 0,
      totalPnL: 0,
      totalTrades: 0,
      winRate: 0,
      createdAt: Date.now(),
      config: {
        riskLevel: "medium",
        maxTradeSize: 1000,
        stopLoss: 0.05,
        takeProfit: 0.15
      },
      fleekId: args.fleekId,
      fleekData: args.fleekData,
      storyInfo: undefined
    });
  }
});

// Save Story Protocol info
export const saveStoryInfo = mutation({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    ipId: v.string(),
    vault: v.string(),
    licenseTermsId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Invalid session");

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.userId !== session.userId) {
      throw new Error("Agent not found or access denied");
    }

    await ctx.db.patch(args.agentId, {
      storyInfo: {
        ipId: args.ipId,
        vault: args.vault,
        licenseTermsId: args.licenseTermsId,
        createdAt: Date.now()
      }
    });

    return true;
  }
});

// Record token sale configuration
export const sellTokens = mutation({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    amount: v.number(),
    priceWei: v.string()
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Invalid session");

    const agent = await ctx.db.get(args.agentId);
    if (!agent || agent.userId !== session.userId) {
      throw new Error("Agent not found or access denied");
    }

    await ctx.db.patch(args.agentId, {
      tokenSale: {
        amount: args.amount,
        priceWei: args.priceWei,
        createdAt: Date.now()
      }
    });

    return true;
  }
});

// Update agent via Fleek API and sync with Convex
export const updateAgentViaFleek = action({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    apiKey: v.string(),
    updateData: v.object({
      name: v.optional(v.string()),
      avatar: v.optional(v.string()),
      characterFile: v.optional(v.string()),
      publicChat: v.optional(v.boolean()),
      tee: v.optional(v.boolean())
    })
  },
  handler: async (
    ctx: ActionCtx,
    args
  ): Promise<any> => {
    const session: any = await ctx.runQuery(api.walletAuth.getCurrentUser, { sessionId: args.sessionId });
    if (!session) throw new Error("Invalid session");

    const agent: any = await ctx.runQuery(api.agents.getAgent, { sessionId: args.sessionId, agentId: args.agentId });
    if (!agent || agent.userId !== session._id) {
      throw new Error("Agent not found or access denied");
    }

    const response: Response = await fetch(`https://api.fleek.xyz/api/v1/ai-agents/${agent.fleekId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': args.apiKey
      },
      body: JSON.stringify(args.updateData)
    });

    if (!response.ok) {
      throw new Error(`Fleek API error: ${response.statusText}`);
    }

    const updatedFleekData: any = await response.json();

    await ctx.runMutation(api.fleekAgents.syncAgentFromFleek, {
      agentId: args.agentId,
      fleekData: updatedFleekData
    });

    return updatedFleekData;
  }
});

// Sync agent data from Fleek response
export const syncAgentFromFleek = mutation({
  args: {
    agentId: v.id("agents"),
    fleekData: v.any()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      name: args.fleekData.name,
      fleekData: args.fleekData,
      
    });
    return true;
  }
});

// Start an agent via Fleek API
export const startAgentViaFleek = action({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    apiKey: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const session: any = await ctx.runQuery(api.walletAuth.getCurrentUser, { sessionId: args.sessionId });
    if (!session) throw new Error("Invalid session");
    const agent: any = await ctx.runQuery(api.agents.getAgent, { sessionId: args.sessionId, agentId: args.agentId });
    if (!agent || agent.userId !== session._id) {
      throw new Error("Agent not found or access denied");
    }
    const response: Response = await fetch(`https://api.fleek.xyz/api/v1/ai-agents/${agent.fleekId}/start`, {
      method: 'POST',
      headers: {
        'X-Api-Key': args.apiKey
      }
    });
    if (!response.ok) {
      throw new Error(`Fleek API error: ${response.statusText}`);
    }
    // Optionally update agent status in DB
    await ctx.runMutation(api.fleekAgents.setAgentStatus, { agentId: args.agentId, status: "active" });
    return { success: true };
  }
});

// Stop an agent via Fleek API
export const stopAgentViaFleek = action({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    apiKey: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const session: any = await ctx.runQuery(api.walletAuth.getCurrentUser, { sessionId: args.sessionId });
    if (!session) throw new Error("Invalid session");
    const agent: any = await ctx.runQuery(api.agents.getAgent, { sessionId: args.sessionId, agentId: args.agentId });
    if (!agent || agent.userId !== session._id) {
      throw new Error("Agent not found or access denied");
    }
    const response: Response = await fetch(`https://api.fleek.xyz/api/v1/ai-agents/${agent.fleekId}/stop`, {
      method: 'POST',
      headers: {
        'X-Api-Key': args.apiKey
      }
    });
    if (!response.ok) {
      throw new Error(`Fleek API error: ${response.statusText}`);
    }
    // Optionally update agent status in DB
    await ctx.runMutation(api.fleekAgents.setAgentStatus, { agentId: args.agentId, status: "stopped" });
    return { success: true };
  }
});

// Helper mutation to update agent status in DB
export const setAgentStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(v.literal("active"), v.literal("stopped"), v.literal("paused")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, { status: args.status });
    return true;
  }
});