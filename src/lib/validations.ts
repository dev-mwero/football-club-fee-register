import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  inviteToken: z.string().min(1, "Invite token is required"),
});

export const createInviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "PARENT", "COACH"]),
});

export const createPlayerSchema = z.object({
  fullName: z.string().min(2).max(200).trim(),
  dateOfBirth: z.string(),
  position: z.string().min(1).trim(),
  teamCategory: z.string().min(1).trim(),
  parent: z.string().regex(/^[a-f\d]{24}$/i, "Invalid parent ID"),
});

export const updatePlayerSchema = z.object({
  fullName: z.string().min(2).max(200).trim().optional(),
  dateOfBirth: z.string().optional(),
  position: z.string().min(1).trim().optional(),
  teamCategory: z.string().min(1).trim().optional(),
  parent: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Invalid parent ID")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]).optional(),
});

export const createFeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  amount: z.number().positive("Amount must be positive"),
  frequency: z.enum(["ONE_TIME", "MONTHLY", "TERMLY", "YEARLY"]),
  description: z.string().max(500).optional(),
});

export const updateFeeSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  amount: z.number().positive().optional(),
  frequency: z.enum(["ONE_TIME", "MONTHLY", "TERMLY", "YEARLY"]).optional(),
  description: z.string().max(500).optional(),
  active: z.boolean().optional(),
});

export const assignFeeSchema = z.object({
  player: z.string().regex(/^[a-f\d]{24}$/i, "Invalid player ID"),
  feeStructure: z.string().regex(/^[a-f\d]{24}$/i, "Invalid fee structure ID"),
  amountDue: z.number().positive("Amount must be positive"),
});

export const autoBillSchema = z.object({
  feeStructure: z.string().regex(/^[a-f\d]{24}$/i),
  amountDue: z.number().positive(),
  periodKey: z.string().min(1),
  teamCategory: z.string().optional(),
  playerIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
  billingLabel: z.string().max(200).optional(),
  billingReason: z.string().max(500).optional(),
  chargeType: z.enum(["FEE", "EXPENSE"]).optional(),
});

export const updateFeeRecordSchema = z.object({
  amountPaid: z.number().min(0),
});

export const initializePaymentSchema = z.object({
  playerId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid player ID"),
  amount: z.number().positive("Amount must be positive").max(1_000_000),
});

export const manualPaymentSchema = z.object({
  playerId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid player ID"),
  parentId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid parent ID"),
  amount: z.number().positive("Amount must be positive"),
  notes: z.string().max(500).optional(),
});

export const mongoIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format"),
});
