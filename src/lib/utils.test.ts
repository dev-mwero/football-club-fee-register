import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn()", () => {
  it("merges class names correctly", () => {
    expect(cn("px-4", "py-2")).toContain("px-4");
    expect(cn("px-4", "py-2")).toContain("py-2");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).not.toContain("hidden");
  });

  it("resolves Tailwind conflicts", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});
