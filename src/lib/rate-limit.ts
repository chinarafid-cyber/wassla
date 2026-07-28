import "server-only";
import { redis } from "@/lib/redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/** Fixed-window counter, e.g. "max 5 OTP requests per phone per hour". */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`;
  const count = await redis.incr(redisKey);

  if (count === 1) {
    await redis.expire(redisKey, windowSeconds);
  }

  const ttl = await redis.ttl(redisKey);
  const resetAt = new Date(Date.now() + Math.max(ttl, 0) * 1000);

  return {
    allowed: count <= limit,
    remaining: Math.max(limit - count, 0),
    resetAt,
  };
}

export interface CooldownResult {
  onCooldown: boolean;
  retryAfterSeconds: number;
}

/** Simple TTL-based cooldown, e.g. "resend OTP after 30s". */
export async function checkCooldown(key: string): Promise<CooldownResult> {
  const ttl = await redis.ttl(`cooldown:${key}`);
  return { onCooldown: ttl > 0, retryAfterSeconds: Math.max(ttl, 0) };
}

export async function setCooldown(key: string, seconds: number): Promise<void> {
  await redis.set(`cooldown:${key}`, "1", "EX", seconds);
}
