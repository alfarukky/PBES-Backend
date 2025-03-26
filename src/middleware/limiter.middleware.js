import rateLimit from 'express-rate-limit';

// General rate limiter for all API routes
export const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes (default)
  max: Number(process.env.RATE_LIMIT_MAX) || 100, // 100 requests per windowMs (default)
  handler: (req, res) => {
    const retryAfter =
      Math.ceil((req.rateLimit?.resetTime - Date.now()) / 1000) || 60; // Ensure retry-after is a valid number
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      message: 'Too many requests, please try again later.',
    });
  },
});

// Stricter rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes (default)
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10, // 10 requests per windowMs (default)
  handler: (req, res) => {
    const retryAfter =
      Math.ceil((req.rateLimit?.resetTime - Date.now()) / 1000) || 60;
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      message: 'Too many authentication requests, please try again later.',
    });
  },
});

export const resendVerificationEmailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Allow 3 requests per windowMs
  handler: (req, res) => {
    const retryAfter =
      Math.ceil((req.rateLimit?.resetTime - Date.now()) / 1000) || 60; // Ensure valid number
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      message: 'Too many requests, please try again later.',
    });
  },
});
