import type { User } from "@prisma/client";

/** What the client is allowed to see — never the raw Prisma row. */
export interface UserDTO {
  id: string;
  phone: string;
  email: string | null;
  fullName: string | null;
  role: string;
  profileCompleted: boolean;
}

export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    phone: user.phone,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    profileCompleted: Boolean(user.profileCompletedAt),
  };
}
