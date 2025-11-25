/**
 * Simple in-memory rate limiter for serverless environments.
 *
 * For production with multiple instances, consider upgrading to:
 * - @upstash/ratelimit with Redis
 * - Or use Vercel Edge Config for rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  limit: number;
  /**
   * Time window in seconds
   */
  windowInSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // If no entry or window has passed, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowInSeconds * 1000,
    };
    rateLimitStore.set(key, newEntry);

    return {
      success: true,
      remaining: config.limit - 1,
      reset: newEntry.resetTime,
      limit: config.limit,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
      limit: config.limit,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    success: true,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
    limit: config.limit,
  };
}

// Preset configurations for different endpoints
export const RATE_LIMITS = {
  // AI generation endpoints - more restrictive
  aiGeneration: {
    limit: 10,
    windowInSeconds: 60, // 10 requests per minute
  },
  // General API endpoints - less restrictive
  api: {
    limit: 100,
    windowInSeconds: 60, // 100 requests per minute
  },
  // Auth endpoints - moderate
  auth: {
    limit: 20,
    windowInSeconds: 60, // 20 requests per minute
  },
} as const;

/**
 * Create rate limit key from user ID and endpoint
 */
export function createRateLimitKey(userId: string, endpoint: string): string {
  return `${userId}:${endpoint}`;
}
