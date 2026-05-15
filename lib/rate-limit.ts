import { createHash } from "crypto";
import { NextResponse } from "next/server";

type Bucket = {
  tokens: number;
  updatedAt: number;
};

type RateLimitConfig = {
  namespace: string;
  key: string;
  capacity: number;
  refillTokens: number;
  refillIntervalMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
};

const globalForRateLimit = globalThis as unknown as {
  tokenBuckets?: Map<string, Bucket>;
  tokenBucketLastCleanup?: number;
};

const buckets = globalForRateLimit.tokenBuckets || new Map<string, Bucket>();
globalForRateLimit.tokenBuckets = buckets;

function hashKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function cleanup(now: number) {
  const lastCleanup = globalForRateLimit.tokenBucketLastCleanup || 0;
  if (now - lastCleanup < 5 * 60 * 1000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.updatedAt > 60 * 60 * 1000) {
      buckets.delete(key);
    }
  }
  globalForRateLimit.tokenBucketLastCleanup = now;
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function consumeToken({
  namespace,
  key,
  capacity,
  refillTokens,
  refillIntervalMs,
}: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const bucketKey = `${namespace}:${hashKey(key)}`;
  const bucket = buckets.get(bucketKey) || {
    tokens: capacity,
    updatedAt: now,
  };

  const elapsed = now - bucket.updatedAt;
  const refillAmount = Math.floor(elapsed / refillIntervalMs) * refillTokens;
  if (refillAmount > 0) {
    bucket.tokens = Math.min(capacity, bucket.tokens + refillAmount);
    bucket.updatedAt =
      bucket.updatedAt + Math.floor(elapsed / refillIntervalMs) * refillIntervalMs;
  }

  if (bucket.tokens < 1) {
    buckets.set(bucketKey, bucket);
    const retryAfter = Math.max(
      1,
      Math.ceil((refillIntervalMs - (now - bucket.updatedAt)) / 1000),
    );
    return {
      allowed: false,
      limit: capacity,
      remaining: 0,
      retryAfter,
    };
  }

  bucket.tokens -= 1;
  bucket.updatedAt = now;
  buckets.set(bucketKey, bucket);

  return {
    allowed: true,
    limit: capacity,
    remaining: Math.floor(bucket.tokens),
    retryAfter: 0,
  };
}

export function rateLimitResponse(result: RateLimitResult, message: string) {
  return NextResponse.json(
    { error: message, retryAfter: result.retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
      },
    },
  );
}
