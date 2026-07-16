const redis = require('../config/redis');
const config = require('../config');

/**
 * Bulletproof Redis rate limiter for score submissions.
 * Caps users at RATE_LIMIT_MAX requests per RATE_LIMIT_WINDOW_SECONDS.
 * Uses a pipeline so INCR + EXPIRE NX run together — EXPIRE NX only sets
 * TTL when the key has none, preventing zombie keys after restarts.
 */
async function scoreRateLimiter(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const key = `ratelimit:score:${userId}`;

  try {
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, config.rateLimitWindowSeconds, 'NX');
    const results = await pipeline.exec();

    if (!results || results.some(([err]) => err)) {
      const firstError = results?.find(([err]) => err)?.[0];
      console.error('[rate-limit] redis pipeline error:', firstError);
      return res.status(503).json({ error: 'Rate limiter temporarily unavailable.' });
    }

    const count = results[0][1];

    if (count > config.rateLimitMax) {
      return res.status(429).json({
        error: `Too many score submissions. Max ${config.rateLimitMax} per ${config.rateLimitWindowSeconds} seconds.`,
      });
    }

    res.setHeader('X-RateLimit-Limit', String(config.rateLimitMax));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, config.rateLimitMax - count)));
    return next();
  } catch (error) {
    console.error('[rate-limit] unexpected error:', error);
    return res.status(503).json({ error: 'Rate limiter temporarily unavailable.' });
  }
}

module.exports = { scoreRateLimiter };
