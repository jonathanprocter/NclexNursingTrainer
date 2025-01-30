import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30 // requests per minute
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig = defaultConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip;
    const now = Date.now();
    
    let clientData = requestCounts.get(clientIP);
    
    if (!clientData || now > clientData.resetTime) {
      clientData = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }
    
    if (clientData.count >= config.maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    clientData.count++;
    requestCounts.set(clientIP, clientData);
    next();
  };
}
