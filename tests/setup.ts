// Provides valid-shaped env vars so `@/lib/env` validation passes when a
// unit test imports modules that read `env` (e.g. `@/lib/jwt`). No real
// Postgres/Redis connection is opened by any test in tests/unit — modules
// that would open one (`@/lib/prisma`, `@/lib/redis`) are always mocked.
// (NODE_ENV is already set to "test" by Vitest itself.)
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL ??= "redis://localhost:6379";
process.env.JWT_ACCESS_SECRET ??= "test-access-secret-must-be-at-least-32-chars";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-must-be-at-least-32-chars";
process.env.SMS_PROVIDER ??= "console";
