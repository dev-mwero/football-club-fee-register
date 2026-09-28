import { describe, expect, it } from "vitest";
import { isAdminApiPath, isPublicPath } from "@/lib/paths";

describe("isPublicPath", () => {
  it("allows the invitation lookup endpoint", () => {
    expect(isPublicPath("/api/v1/auth/invite")).toBe(true);
  });

  it("allows account creation from an invitation without a session", () => {
    expect(isPublicPath("/api/v1/auth/register")).toBe(true);
  });

  it("allows the auth pages and login endpoints", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/register")).toBe(true);
    expect(isPublicPath("/api/v1/auth/login")).toBe(true);
    expect(isPublicPath("/api/auth/login")).toBe(true);
  });

  it("protects the dashboard and every non-auth API route", () => {
    expect(isPublicPath("/dashboard")).toBe(false);
    expect(isPublicPath("/dashboard/users")).toBe(false);
    expect(isPublicPath("/api/v1/players")).toBe(false);
    expect(isPublicPath("/api/v1/auth/logout")).toBe(false);
    expect(isPublicPath("/api/v1/admin/invites")).toBe(false);
  });

  it("does not treat lookalike paths as public", () => {
    expect(isPublicPath("/loginfoo")).toBe(false);
    expect(isPublicPath("/register-foo")).toBe(false);
    expect(isPublicPath("/api/v1/auth/registerx")).toBe(false);
  });
});

describe("isAdminApiPath", () => {
  it("matches the admin routes that actually exist", () => {
    expect(isAdminApiPath("/api/v1/admin/invites")).toBe(true);
    expect(isAdminApiPath("/api/v1/admin/users")).toBe(true);
    expect(isAdminApiPath("/api/v1/admin/invites/abc123")).toBe(true);
  });

  it("does not match the legacy /api/admin prefix", () => {
    expect(isAdminApiPath("/api/admin/invites")).toBe(false);
  });

  it("does not match non-admin API routes", () => {
    expect(isAdminApiPath("/api/v1/players")).toBe(false);
    expect(isAdminApiPath("/api/v1/auth/invite")).toBe(false);
    expect(isAdminApiPath("/dashboard/users")).toBe(false);
  });
});
