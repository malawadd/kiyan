import { StoryClient, LicenseTerms  } from "@story-protocol/core-sdk";
import { v } from "convex/values";
import { action, mutation, ActionCtx, MutationCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { http } from "viem";
import { keccak256, stringToBytes } from "viem";

// Initialize Story Protocol client (used in development only)
const _storyClient = StoryClient.newClient({
  chainId: 1315, // Sepolia testnet
  transport: http("https://aeneid.storyrpc.io"),
});

// Helper function to create metadata hash
const createMetadataHash = (data: object) => {
  const jsonStr = JSON.stringify(data);
  return keccak256(stringToBytes(jsonStr));
};

// Helper to register IP on Story Protocol
async function registerOnStoryProtocol(
  agentData: any,
  spgNftContract: `0x${string}` = "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc"
) {
  const ipMetadata = {
    title: agentData.name,
    description: agentData.description || "Trading agent imported from Fleek",
    image: agentData.image || "https://picsum.photos/200",
    external_url: `https://fleek.xyz/agents/${agentData.id}`,
    attributes: [
      { trait_type: "Type", value: "Trading Agent" },
      { trait_type: "Platform", value: "Fleek" },
      { trait_type: "Strategy", value: agentData.strategy || "Custom" }
    ]
  };

  const nftMetadata = {
    name: `${agentData.name} Ownership NFT`,
    description: `NFT representing ownership of ${agentData.name} trading agent`,
    image: agentData.image || "https://picsum.photos/200",
    external_url: `https://fleek.xyz/agents/${agentData.id}`,
  };

  // Register IP
  const response = await _storyClient.ipAsset.mintAndRegisterIp({
    spgNftContract,
    ipMetadata: {
      ipMetadataURI: `data:application/json,${JSON.stringify(ipMetadata)}`,
      ipMetadataHash: createMetadataHash(ipMetadata),
      nftMetadataURI: `data:application/json,${JSON.stringify(nftMetadata)}`,
      nftMetadataHash: createMetadataHash(nftMetadata),
    },
  });
  return {
    ipId: response.ipId,
    txHash: response.txHash,
    vault: response.tokenId || ""
  };
}

// Helper to create and attach license terms
async function attachLicenseTerms(ipId: `0x{string}`, pilTemplate: any) {
  const licenseTerms: LicenseTerms = {
    mintingFee: pilTemplate.terms.defaultMintingFee,
    mintingCurrency: pilTemplate.terms.currency,
    transferable: pilTemplate.terms.transferable,
    commercial: pilTemplate.terms.commercialUse,
    attribution: pilTemplate.terms.commercialAttribution,
    validUntil: pilTemplate.terms.expiration,
    revShare: pilTemplate.terms.commercialRevShare,
    territories: ["*"],
    contentRestrictions: [],
  };
  // Use correct method from SDK
  const response = await _storyClient.ipAsset.registerPilTermsAndAttach({
    ipId,
    licenseTermsData: [{ terms: licenseTerms }],
  });
  return response.policyId;
}

export const buyShares = mutation({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    amount: v.number(),
    value: v.string()
  },
  handler: async (ctx, { sessionId, agentId, amount, value }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Invalid session");
    const agent = await ctx.db.get(agentId);
    if (!agent) throw new Error("Agent not found");
    if (!agent.tokenSale) throw new Error("Agent shares not available for sale");
    if (amount > agent.tokenSale.amount) throw new Error("Not enough shares available");
    const requiredValue = BigInt(agent.tokenSale.priceWei) * BigInt(amount);
    if (BigInt(value) < requiredValue) throw new Error("Insufficient payment");
    await ctx.db.patch(agentId, {
      tokenSale: {
        ...agent.tokenSale,
        amount: agent.tokenSale.amount - amount
      }
    });
    await ctx.db.insert("transactions", {
      userId: session.userId,
      agentId,
      type: "buy",
      asset: "SHARES",
      amount,
      price: parseFloat(agent.tokenSale.priceWei) / 1e18,
      value: parseFloat(value) / 1e18,
      fee: 0,
      pnl: 0,
      status: "completed",
      timestamp: Date.now(),
      metadata: {
        strategy: "share_purchase"
      }
    });
    return { success: true };
  }
});

export const importAgent = action({
  args: {
    sessionId: v.id("sessions"),
    fleekId: v.string(),
    fleekKey: v.string(),
    nameOverride: v.optional(v.string()),
    pilTemplate: v.object({
      name: v.string(),
      description: v.string(),
      terms: v.object({
        defaultMintingFee: v.string(),
        currency: v.string(),
        royaltyPolicy: v.string(),
        transferable: v.boolean(),
        expiration: v.string(),
        commercialUse: v.boolean(),
        commercialAttribution: v.boolean(),
        commercialRevShare: v.number(),
      })
    })
  },
  handler: async (
    ctx: ActionCtx,
    args
  ): Promise<Id<"agents">> => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Invalid session");
    const response = await fetch(`https://api.fleek.xyz/api/v1/ai-agents/${args.fleekId}`, {
      headers: {
        'X-Api-Key': args.fleekKey
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch agent: ${response.statusText}`);
    }
    const agentData = await response.json();
    const storyRegistration = await registerOnStoryProtocol(agentData);
    const policyId = await attachLicenseTerms(storyRegistration.ipId, args.pilTemplate);
    const agentId = await ctx.runMutation(api.fleekAgents.createFleekAgent, {
      sessionId: args.sessionId,
      name: args.nameOverride || agentData.name,
      fleekId: args.fleekId,
      fleekData: agentData,
      storyInfo: {
        ipId: storyRegistration.ipId,
        vault: storyRegistration.vault,
        createdAt: Date.now()
      }
    });
    return agentId;
  }
});

export const createFleekAgent = mutation({
  args: {
    sessionId: v.id("sessions"),
    name: v.string(),
    fleekId: v.string(),
    fleekData: v.any(),
    storyInfo: v.optional(v.object({
      ipId: v.string(),
      vault: v.string(),
      createdAt: v.number()
    }))
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
      storyInfo: args.storyInfo
    });
  }
});

export const saveStoryInfo = mutation({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
    ipId: v.string(),
    vault: v.string()
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
        createdAt: Date.now()
      }
    });
    return true;
  }
});

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

export const claimRevenue = action({
  args: {
    sessionId: v.id("sessions"),
    agentId: v.id("agents"),
  },
  handler: async (
    ctx: ActionCtx,
    args
  ): Promise<boolean> => {
    const agent = await ctx.runQuery(api.agents.getAgent, {
      sessionId: args.sessionId,
      agentId: args.agentId
    });
    if (!agent?.storyInfo?.vault) {
      throw new Error("Agent not properly registered with Story Protocol");
    }
    // Use correct SDK method for claimable revenue
    const claimable = await _storyClient.royalty.getClaimableRevenue({
      vault: agent.storyInfo.vault
    });
    if (!claimable || claimable === "0") {
      throw new Error("No revenue available to claim");
    }
    // Use correct SDK method to claim all revenue
    await _storyClient.royalty.claimAllRevenue({
      vault: agent.storyInfo.vault
    });
    return true;
  }
});