import { PrismaClient, UserRole, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Bootstraps the first ADMIN account. There is no username/password or
 * self-service role upgrade in this system, so without this script no
 * account could ever reach ADMIN — every other role is reachable through
 * the normal phone/OTP signup flow.
 */
async function main() {
  const adminPhone = process.env.SEED_ADMIN_PHONE;

  if (!adminPhone) {
    console.log(
      "SEED_ADMIN_PHONE is not set in the environment — skipping admin bootstrap.",
    );
    return;
  }

  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { role: UserRole.ADMIN, status: UserStatus.ACTIVE },
    create: {
      phone: adminPhone,
      phoneVerifiedAt: new Date(),
      fullName: process.env.SEED_ADMIN_NAME ?? "Admin",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      profileCompletedAt: new Date(),
    },
  });

  console.log(`Seeded admin user ${admin.phone} (${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
