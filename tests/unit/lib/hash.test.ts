import { describe, it, expect } from "vitest";
import { hashSecret, verifySecretHash } from "@/lib/hash";

describe("hashSecret / verifySecretHash", () => {
  it("verifies a value against its own hash", async () => {
    const hash = await hashSecret("123456");
    expect(await verifySecretHash("123456", hash)).toBe(true);
  });

  it("rejects an incorrect value", async () => {
    const hash = await hashSecret("123456");
    expect(await verifySecretHash("654321", hash)).toBe(false);
  });

  it("never stores the value in plaintext", async () => {
    const hash = await hashSecret("123456");
    expect(hash).not.toBe("123456");
    expect(hash).not.toContain("123456");
  });
});
