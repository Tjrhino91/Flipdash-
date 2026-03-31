import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

// Type for Better Auth user (for TypeScript)
interface BetterAuthUser {
  _id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: boolean;
  createdAt: number;
  updatedAt: number;
}

// Helper to safely get auth user (returns null instead of throwing)
async function safeGetAuthUser(ctx: any): Promise<BetterAuthUser | null> {
  try {
    return await authComponent.getAuthUser(ctx) as BetterAuthUser | null;
  } catch {
    return null;
  }
}

// List all vehicles for the authenticated user
export const listVehicles = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("vehicles")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

// Alias for listVehicles
export const getMyVehicles = listVehicles;

// Get a single vehicle by ID (only if owned by user)
export const getVehicle = query({
  args: { id: v.id("vehicles") },
  handler: async (ctx, args) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return null;

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== user._id) return null;
    return item;
  },
});

// List all expenses for the authenticated user
export const listExpenses = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("expenses")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

// Alias for listExpenses
export const getMyExpenses = listExpenses;

// Get a single expense by ID (only if owned by user)
export const getExpense = query({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return null;

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== user._id) return null;
    return item;
  },
});

// List all appraisals for the authenticated user
export const listAppraisals = query({
  args: {},
  handler: async (ctx) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("appraisals")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect();
  },
});

// Alias for listAppraisals
export const getMyAppraisals = listAppraisals;

// Get a single appraisal by ID (only if owned by user)
export const getAppraisal = query({
  args: { id: v.id("appraisals") },
  handler: async (ctx, args) => {
    const user = await safeGetAuthUser(ctx);
    if (!user) return null;

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== user._id) return null;
    return item;
  },
});
