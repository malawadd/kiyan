"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { verifyMessage } from "viem";
import { api } from "./_generated/api";

export const verifySignatureAndCreateSession = internalAction({
  args: {
    address: v.string(),
    signature: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args): Promise<{ sessionId: any; user: any }> => {
    // Verify the signature using viem in Node.js runtime
    const isValid = await verifyMessage({
      address: args.address as `0x${string}`,
      message: args.message,
      signature: args.signature as `0x${string}`,
    });

    if (!isValid) {
      throw new Error("Invalid signature");
    }

    // Create user and session via mutation
    const result: { sessionId: any; user: any } = await ctx.runMutation(api.walletAuth.createUserAndSession, {
      address: args.address,
    });

    return result;
  },
});
