import "server-only";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export function findUserByPhone(phone: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { phone } });
}

export function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export interface CreateUserInput {
  phone: string;
  fullName: string;
  email?: string;
}

export function createUser(input: CreateUserInput): Promise<User> {
  return prisma.user.create({
    data: {
      phone: input.phone,
      phoneVerifiedAt: new Date(),
      fullName: input.fullName,
      email: input.email && input.email.length > 0 ? input.email : undefined,
      profileCompletedAt: new Date(),
    },
  });
}
