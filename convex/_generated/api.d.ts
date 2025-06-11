/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as agents from "../agents.js";
import type * as auth from "../auth.js";
import type * as demoData from "../demoData.js";
import type * as fleekAgents from "../fleekAgents.js";
import type * as funds from "../funds.js";
import type * as http from "../http.js";
import type * as portfolio from "../portfolio.js";
import type * as router from "../router.js";
import type * as transactions from "../transactions.js";
import type * as walletAuth from "../walletAuth.js";
import type * as walletAuthNode from "../walletAuthNode.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  auth: typeof auth;
  demoData: typeof demoData;
  fleekAgents: typeof fleekAgents;
  funds: typeof funds;
  http: typeof http;
  portfolio: typeof portfolio;
  router: typeof router;
  transactions: typeof transactions;
  walletAuth: typeof walletAuth;
  walletAuthNode: typeof walletAuthNode;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
