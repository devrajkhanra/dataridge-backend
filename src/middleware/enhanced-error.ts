import { FastifyRequest, FastifyReply, FastifyError } from "fastify";
import { ZodError } from "zod";
import { AppError, ErrorCode, ApiResponse } from "../types/common";
import { loggerService } from "../services/logger.service";

export default function enhancedErrorHandler(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const requestId = request.headers['x-request-id'] as string || 'unknown';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log the error
  loggerService.error("Request error", error, {
    requestId,
    action: 'error_handler',
    resource: request.url,
    metadata: {
      method: request.method,
      statusCode: reply.statusCode,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    },
  });

  let statusCode = 500;
  let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
  let message = "Internal server error";
  let details: Record<string, any> | undefined;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorCode = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = "Validation failed";
    details = {
      errors: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    };
  } else if ('statusCode' in error && error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
    
    // Map common HTTP status codes to error codes
    switch (statusCode) {
      case 400:
        errorCode = ErrorCode.VALIDATION_ERROR;
        break;
      case 401:
        errorCode = ErrorCode.AUTHENTICATION_ERROR;
        break;
      case 403:
        errorCode = ErrorCode.AUTHORIZATION_ERROR;
        break;
      case 404:
        errorCode = ErrorCode.NOT_FOUND;
        break;
      case 409:
        errorCode = ErrorCode.CONFLICT;
        break;
      case 429:
        errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
        break;
      default:
        errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  // Prepare response
  const response: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details,
      ...(isDevelopment && { stack: error.stack }),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
      version: process.env.API_VERSION || '1.0.0',
    },
  };

  // Don't expose sensitive information in production
  if (!isDevelopment) {
    if (statusCode >= 500) {
      response.error!.message = "Internal server error";
      delete response.error!.details;
    }
    delete response.error!.stack;
  }

  return reply.status(statusCode).send(response);
}

// Global error handler for uncaught exceptions
export function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (error) => {
    loggerService.error("Uncaught exception", error, {
      requestId: 'global',
      action: 'uncaught_exception',
    });
    
    // Graceful shutdown
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    loggerService.error("Unhandled rejection", reason as Error, {
      requestId: 'global',
      action: 'unhandled_rejection',
      metadata: { promise: promise.toString() },
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    loggerService.info("SIGTERM received, shutting down gracefully", {
      requestId: 'global',
      action: 'shutdown',
    });
    process.exit(0);
  });

  process.on('SIGINT', () => {
    loggerService.info("SIGINT received, shutting down gracefully", {
      requestId: 'global',
      action: 'shutdown',
    });
    process.exit(0);
  });
}