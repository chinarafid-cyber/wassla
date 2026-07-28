import { describe, it, expect } from "vitest";
import { UserRole } from "@prisma/client";
import { roleSatisfiesRoute } from "@/config/roles";

describe("roleSatisfiesRoute", () => {
  it("allows any role on unrestricted routes", () => {
    expect(roleSatisfiesRoute(UserRole.CUSTOMER, "/dashboard")).toBe(true);
    expect(roleSatisfiesRoute(UserRole.VISITOR, "/profile")).toBe(true);
  });

  it("only allows ADMIN on /admin", () => {
    expect(roleSatisfiesRoute(UserRole.ADMIN, "/admin")).toBe(true);
    expect(roleSatisfiesRoute(UserRole.CUSTOMER, "/admin")).toBe(false);
    expect(roleSatisfiesRoute(UserRole.MERCHANT, "/admin")).toBe(false);
  });

  it("allows MERCHANT and ADMIN on /merchant, but not CUSTOMER", () => {
    expect(roleSatisfiesRoute(UserRole.MERCHANT, "/merchant")).toBe(true);
    expect(roleSatisfiesRoute(UserRole.ADMIN, "/merchant")).toBe(true);
    expect(roleSatisfiesRoute(UserRole.CUSTOMER, "/merchant")).toBe(false);
  });

  it("matches nested paths under a protected prefix", () => {
    expect(roleSatisfiesRoute(UserRole.CUSTOMER, "/admin/users/123")).toBe(false);
    expect(roleSatisfiesRoute(UserRole.ADMIN, "/admin/users/123")).toBe(true);
  });
});
