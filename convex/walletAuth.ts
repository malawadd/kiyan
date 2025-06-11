import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const loginWithWallet = action({
  args: {
    address: v.string(),
    signature: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<{ sessionId: any; user: any }> => {
    // Verify signature in Node.js action
    const result: { sessionId: any; user: any } = await ctx.runAction(internal.walletAuthNode.verifySignatureAndCreateSession, {
      address: args.address,
      signature: args.signature,
      message: args.message,
    });

    return result;
  },
});

export const createUserAndSession = mutation({
  args: {
    address: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    let user = await ctx.db
      .query("users")
      .withIndex("by_wallet_address", (q) => q.eq("walletAddress", args.address))
      .unique();

    // Create user if doesn't exist
    if (!user) {
      const userId = await ctx.db.insert("users", {
        walletAddress: args.address,
        name: `${args.address.slice(0, 6)}...${args.address.slice(-4)}`,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    // Create session
    const sessionId = await ctx.db.insert("sessions", {
      userId: user!._id,
      walletAddress: args.address,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return { sessionId, user };
  },
});

export const getCurrentUser = query({
  args: { sessionId: v.optional(v.id("sessions")) },
  handler: async (ctx, args) => {
    if (!args.sessionId) return null;

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    return user;
  },
});

export const logout = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.sessionId);
  },
});
