const WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const MAX_REQUESTS = Number(process.env.AUTH_RATE_LIMIT_MAX || 10);

const attempts = new Map();

setInterval(() => {
  const now = Date.now();

  for (const [key, entry] of attempts.entries()) {
    if (entry.expiresAt <= now) {
      attempts.delete(key);
    }
  }
}, Math.min(WINDOW_MS, 60 * 1000)).unref();

const getRateLimitKey = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : String(forwardedFor || req.ip || req.socket.remoteAddress || "unknown").split(",")[0].trim();

  return `${ip}:${req.path}`;
};

module.exports = (req, res, next) => {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || existing.expiresAt <= now) {
    attempts.set(key, {
      count: 1,
      expiresAt: now + WINDOW_MS
    });

    return next();
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((existing.expiresAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      message: "Too many authentication attempts. Please try again later."
    });
  }

  existing.count += 1;
  attempts.set(key, existing);
  return next();
};
