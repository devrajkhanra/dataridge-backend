import { FastifyRequest, FastifyReply } from "fastify";
import { ZodSchema, ZodError } from "zod";
import { AppError, ErrorCode } from "../types/common";
import { loggerService } from "../services/logger.service";

export interface ValidationOptions {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
  headers?: ZodSchema;
}

export function validateRequest(options: ValidationOptions) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const requestId = request.headers['x-request-id'] as string || 
                       crypto.randomUUID();

      // Validate body
      if (options.body && request.body) {
        try {
          request.body = options.body.parse(request.body);
        } catch (error) {
          if (error instanceof ZodError) {
            throw new AppError(
              ErrorCode.VALIDATION_ERROR,
              "Request body validation failed",
              400,
              { 
                field: 'body',
                errors: error.errors.map(e => ({
                  path: e.path.join('.'),
                  message: e.message,
                  code: e.code
                }))
              }
            );
          }
          throw error;
        }
      }

      // Validate params
      if (options.params && request.params) {
        try {
          request.params = options.params.parse(request.params);
        } catch (error) {
          if (error instanceof ZodError) {
            throw new AppError(
              ErrorCode.VALIDATION_ERROR,
              "Request parameters validation failed",
              400,
              { 
                field: 'params',
                errors: error.errors.map(e => ({
                  path: e.path.join('.'),
                  message: e.message,
                  code: e.code
                }))
              }
            );
          }
          throw error;
        }
      }

      // Validate query
      if (options.query && request.query) {
        try {
          request.query = options.query.parse(request.query);
        } catch (error) {
          if (error instanceof ZodError) {
            throw new AppError(
              ErrorCode.VALIDATION_ERROR,
              "Query parameters validation failed",
              400,
              { 
                field: 'query',
                errors: error.errors.map(e => ({
                  path: e.path.join('.'),
                  message: e.message,
                  code: e.code
                }))
              }
            );
          }
          throw error;
        }
      }

      // Validate headers
      if (options.headers && request.headers) {
        try {
          request.headers = options.headers.parse(request.headers);
        } catch (error) {
          if (error instanceof ZodError) {
            throw new AppError(
              ErrorCode.VALIDATION_ERROR,
              "Request headers validation failed",
              400,
              { 
                field: 'headers',
                errors: error.errors.map(e => ({
                  path: e.path.join('.'),
                  message: e.message,
                  code: e.code
                }))
              }
            );
          }
          throw error;
        }
      }

      loggerService.debug("Request validation successful", {
        requestId,
        action: 'validation',
        resource: request.url,
        metadata: { method: request.method }
      });

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        "Unexpected validation error",
        500,
        { originalError: error }
      );
    }
  };
}

// Input sanitization middleware
export async function sanitizeInput(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Sanitize string inputs to prevent XSS
    if (request.body && typeof request.body === 'object') {
      request.body = sanitizeObject(request.body);
    }

    if (request.query && typeof request.query === 'object') {
      request.query = sanitizeObject(request.query);
    }

    if (request.params && typeof request.params === 'object') {
      request.params = sanitizeObject(request.params);
    }
  } catch (error) {
    throw new AppError(
      ErrorCode.VALIDATION_ERROR,
      "Input sanitization failed",
      400,
      { originalError: error }
    );
  }
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}