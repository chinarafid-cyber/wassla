import { describe, it, expect } from "vitest";
import { generateRefreshToken, hashRefreshToken } from "@/lib/tokens";

describe("generateRefreshToken", () => {
  it("generates high-entropy, unique tokens", () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(32);
  });
});

describe("hashRefreshToken", () => {
  it("is deterministic for the same input", () => {
    const token = generateRefreshToken();
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
  });

  it("produces different hashes for different tokens", () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(hashRefreshToken(a)).not.toBe(hashRefreshToken(b));
  });

  it("never contains the original token", () => {
    const token = generateRefreshToken();
    expect(hashRefreshToken(token)).not.toContain(token);
  });
});
