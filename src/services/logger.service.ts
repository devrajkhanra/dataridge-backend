import pino from "pino";
import { ILogger, LogContext } from "../types/common";

export class LoggerService implements ILogger {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      } : undefined,
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: ['password', 'token', 'authorization', 'cookie'],
        censor: '[REDACTED]',
      },
    });
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.formatLog(context), message);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const logData = this.formatLog(context);
    if (error) {
      logData.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    this.logger.error(logData, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.formatLog(context), message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.formatLog(context), message);
  }

  private formatLog(context?: LogContext): Record<string, any> {
    if (!context) return {};

    return {
      requestId: context.requestId,
      userId: context.userId,
      action: context.action,
      resource: context.resource,
      metadata: context.metadata,
    };
  }

  // Create child logger with persistent context
  child(context: Partial<LogContext>): LoggerService {
    const childLogger = new LoggerService();
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }
}

// Singleton instance
export const loggerService = new LoggerService();