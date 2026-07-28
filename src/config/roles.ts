import { UserRole } from "@prisma/client";

/** Route prefixes that require one of the listed roles. Consumed by `proxy.ts`. */
export const PROTECTED_ROLE_ROUTES: Record<string, UserRole[]> = {
  "/admin": [UserRole.ADMIN],
  "/merchant": [UserRole.MERCHANT, UserRole.ADMIN],
};

export function roleSatisfiesRoute(role: UserRole, pathname: string): boolean {
  const requiredRoles = Object.entries(PROTECTED_ROLE_ROUTES).find(([prefix]) =>
    pathname.startsWith(prefix),
  )?.[1];

  return !requiredRoles || requiredRoles.includes(role);
}
