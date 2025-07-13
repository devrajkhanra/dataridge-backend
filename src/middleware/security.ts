import { FastifyRequest, FastifyReply } from "fastify";
import { AppError, ErrorCode } from "../types/common";
import { loggerService } from "../services/logger.service";

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: FastifyRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const key = keyGenerator(request);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }

    let record = rateLimitStore.get(key);
    
    if (!record || record.resetTime < now) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, record);
    }

    record.count++;

    if (record.count > maxRequests) {
      loggerService.warn("Rate limit exceeded", {
        requestId: request.headers['x-request-id'] as string,
        action: 'rate_limit_exceeded',
        metadata: {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          count: record.count,
          limit: maxRequests,
        },
      });

      throw new AppError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        "Too many requests",
        429,
        {
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
          limit: maxRequests,
          remaining: 0,
        }
      );
    }

    // Add rate limit headers
    reply.header('X-RateLimit-Limit', maxRequests);
    reply.header('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    reply.header('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
  };
}

// Security headers middleware
export async function securityHeaders(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Security headers
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production') {
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // CSP header
  reply.header(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
  );
}

// CORS configuration
export const corsOptions = {
  origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
};

// Request ID middleware
export async function requestId(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const requestId = request.headers['x-request-id'] as string || 
                   crypto.randomUUID();
  
  request.headers['x-request-id'] = requestId;
  reply.header('X-Request-ID', requestId);
}

// Request logging middleware
export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const startTime = Date.now();
  const requestId = request.headers['x-request-id'] as string;

  loggerService.info("Request started", {
    requestId,
    action: 'request_start',
    metadata: {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    },
  });

  reply.addHook('onSend', async () => {
    const duration = Date.now() - startTime;
    
    loggerService.info("Request completed", {
      requestId,
      action: 'request_complete',
      metadata: {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration,
      },
    });
  });
}