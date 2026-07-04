import { describe, expect, it } from "vitest";
import {
  assignFeeSchema,
  createFeeSchema,
  createPlayerSchema,
  loginSchema,
  manualPaymentSchema,
  mongoIdParamSchema,
  registerSchema,
} from "./validations";

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+254712345678",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "john@example.com",
      phone: "+254712345678",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+254712345678",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional role", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      phone: "+254712345678",
      password: "password123",
      role: "ADMIN",
    });
    expect(result.success).toBe(true);
  });
});

describe("createPlayerSchema", () => {
  it("accepts valid player data", () => {
    const result = createPlayerSchema.safeParse({
      fullName: "Jane Smith",
      dateOfBirth: "2010-01-15",
      position: "Forward",
      teamCategory: "U14",
      parent: "507f1f77bcf86cd799439011",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid parent ID", () => {
    const result = createPlayerSchema.safeParse({
      fullName: "Jane Smith",
      dateOfBirth: "2010-01-15",
      position: "Forward",
      teamCategory: "U14",
      parent: "invalid-id",
    });
    expect(result.success).toBe(false);
  });
});

describe("createFeeSchema", () => {
  it("accepts valid fee data", () => {
    const result = createFeeSchema.safeParse({
      name: "Registration Fee",
      amount: 5000,
      frequency: "ONE_TIME",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative amount", () => {
    const result = createFeeSchema.safeParse({
      name: "Registration Fee",
      amount: -100,
      frequency: "ONE_TIME",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid frequency", () => {
    const result = createFeeSchema.safeParse({
      name: "Registration Fee",
      amount: 5000,
      frequency: "WEEKLY",
    });
    expect(result.success).toBe(false);
  });
});

describe("assignFeeSchema", () => {
  it("accepts valid assignment data", () => {
    const result = assignFeeSchema.safeParse({
      player: "507f1f77bcf86cd799439011",
      feeStructure: "507f1f77bcf86cd799439012",
      amountDue: 5000,
    });
    expect(result.success).toBe(true);
  });
});

describe("manualPaymentSchema", () => {
  it("accepts valid payment data", () => {
    const result = manualPaymentSchema.safeParse({
      playerId: "507f1f77bcf86cd799439011",
      parentId: "507f1f77bcf86cd799439012",
      amount: 5000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional notes", () => {
    const result = manualPaymentSchema.safeParse({
      playerId: "507f1f77bcf86cd799439011",
      parentId: "507f1f77bcf86cd799439012",
      amount: 5000,
      notes: "Cash payment",
    });
    expect(result.success).toBe(true);
  });
});

describe("mongoIdParamSchema", () => {
  it("accepts valid MongoDB ID", () => {
    const result = mongoIdParamSchema.safeParse({
      id: "507f1f77bcf86cd799439011",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid ID", () => {
    const result = mongoIdParamSchema.safeParse({
      id: "not-a-valid-id",
    });
    expect(result.success).toBe(false);
  });

  it("accepts uppercase hex (valid ObjectId)", () => {
    const result = mongoIdParamSchema.safeParse({
      id: "507F1F77BCF86CD799439011",
    });
    expect(result.success).toBe(true);
  });
});
