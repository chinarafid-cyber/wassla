import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  verifyAccessToken,
  signVerificationTicket,
  verifyVerificationTicket,
} from "@/lib/jwt";
import { UserRole } from "@prisma/client";

describe("access tokens", () => {
  it("round-trips the payload", async () => {
    const token = await signAccessToken({
      sub: "user_1",
      role: UserRole.CUSTOMER,
      sessionId: "session_1",
    });

    const payload = await verifyAccessToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("user_1");
    expect(payload?.role).toBe(UserRole.CUSTOMER);
    expect(payload?.sessionId).toBe("session_1");
  });

  it("rejects a tampered token", async () => {
    const token = await signAccessToken({
      sub: "user_1",
      role: UserRole.CUSTOMER,
      sessionId: "session_1",
    });

    expect(await verifyAccessToken(`${token}tampered`)).toBeNull();
  });
});

describe("verification tickets", () => {
  it("round-trips the phone and isNewUser flag", async () => {
    const ticket = await signVerificationTicket({ phone: "+966500000000", isNewUser: true });
    const payload = await verifyVerificationTicket(ticket);

    expect(payload).not.toBeNull();
    expect(payload?.phone).toBe("+966500000000");
    expect(payload?.isNewUser).toBe(true);
  });
});

describe("token type confusion", () => {
  it("an access token is never accepted as a verification ticket", async () => {
    const accessToken = await signAccessToken({
      sub: "user_1",
      role: UserRole.CUSTOMER,
      sessionId: "session_1",
    });

    expect(await verifyVerificationTicket(accessToken)).toBeNull();
  });

  it("a verification ticket is never accepted as an access token", async () => {
    const ticket = await signVerificationTicket({ phone: "+966500000000", isNewUser: false });

    expect(await verifyAccessToken(ticket)).toBeNull();
  });
});
