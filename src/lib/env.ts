import "server-only";
import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    DATABASE_URL: z
      .string()
      .refine(
        (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
        "DATABASE_URL must be a postgresql:// connection string",
      ),
    REDIS_URL: z
      .string()
      .refine(
        (value) => value.startsWith("redis://") || value.startsWith("rediss://"),
        "REDIS_URL must be a redis:// connection string",
      ),

    JWT_ACCESS_SECRET: z
      .string()
      .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

    SMS_PROVIDER: z.enum(["console", "twilio"]).default("console"),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_FROM_NUMBER: z.string().optional(),

    SEED_ADMIN_PHONE: z.string().optional(),
    SEED_ADMIN_NAME: z.string().optional(),

    // Exposes a way for Playwright to read a just-sent OTP code (see
    // `src/app/api/v1/auth/otp/test-code/route.ts`). Double-gated: the route
    // itself also checks NODE_ENV !== "production", so a stray true value in
    // a real deployment still can't activate it.
    E2E_TEST_MODE: z
      .string()
      .optional()
      .transform((value) => value === "true"),
  })
  .refine((data) => data.JWT_ACCESS_SECRET !== data.JWT_REFRESH_SECRET, {
    message: "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values",
    path: ["JWT_REFRESH_SECRET"],
  })
  .refine((data) => data.NODE_ENV !== "production" || data.SMS_PROVIDER === "twilio", {
    message: "SMS_PROVIDER must be 'twilio' when NODE_ENV=production",
    path: ["SMS_PROVIDER"],
  })
  .refine(
    (data) =>
      data.SMS_PROVIDER !== "twilio" ||
      (data.TWILIO_ACCOUNT_SID && data.TWILIO_AUTH_TOKEN && data.TWILIO_FROM_NUMBER),
    {
      message:
        "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER are required when SMS_PROVIDER=twilio",
      path: ["TWILIO_ACCOUNT_SID"],
    },
  )
  .refine((data) => data.NODE_ENV !== "production" || !data.E2E_TEST_MODE, {
    message: "E2E_TEST_MODE must not be enabled when NODE_ENV=production",
    path: ["E2E_TEST_MODE"],
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:\n" +
      parsed.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n"),
  );
  throw new Error("Invalid environment variables — see log above.");
}

export const env = parsed.data;
