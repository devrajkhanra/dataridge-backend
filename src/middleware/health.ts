import { FastifyRequest, FastifyReply } from "fastify";
import { databaseService } from "../config/database";
import { cacheService } from "../services/cache.service";
import { ApiResponse } from "../types/common";

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
    };
    cache: {
      status: 'up' | 'down';
      responseTime?: number;
    };
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
}

export async function healthCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Check database health
    const dbStart = Date.now();
    const dbHealthy = await databaseService.health();
    const dbResponseTime = Date.now() - dbStart;

    // Check cache health
    const cacheStart = Date.now();
    let cacheHealthy = true;
    try {
      await cacheService.set('health_check', 'ok', 10);
      await cacheService.get('health_check');
    } catch {
      cacheHealthy = false;
    }
    const cacheResponseTime = Date.now() - cacheStart;

    // System metrics
    const memUsage = process.memoryUsage();
    const memTotal = memUsage.heapTotal;
    const memUsed = memUsage.heapUsed;
    const memPercentage = (memUsed / memTotal) * 100;

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (!dbHealthy || !cacheHealthy) {
      overallStatus = 'unhealthy';
    } else if (dbResponseTime > 1000 || cacheResponseTime > 500 || memPercentage > 90) {
      overallStatus = 'degraded';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || '1.0.0',
      uptime: process.uptime(),
      services: {
        database: {
          status: dbHealthy ? 'up' : 'down',
          responseTime: dbResponseTime,
        },
        cache: {
          status: cacheHealthy ? 'up' : 'down',
          responseTime: cacheResponseTime,
        },
      },
      system: {
        memory: {
          used: memUsed,
          total: memTotal,
          percentage: Math.round(memPercentage * 100) / 100,
        },
        cpu: {
          usage: process.cpuUsage().user / 1000000, // Convert to seconds
        },
      },
    };

    const response: ApiResponse<HealthStatus> = {
      success: true,
      data: healthStatus,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.headers['x-request-id'] as string || 'health-check',
        version: process.env.API_VERSION || '1.0.0',
      },
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return reply.status(statusCode).send(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
        details: { originalError: error },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.headers['x-request-id'] as string || 'health-check',
        version: process.env.API_VERSION || '1.0.0',
      },
    };

    return reply.status(503).send(response);
  }
}

// Readiness check (for Kubernetes)
export async function readinessCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const dbHealthy = await databaseService.health();
    
    if (dbHealthy) {
      return reply.status(200).send({ status: 'ready' });
    } else {
      return reply.status(503).send({ status: 'not ready' });
    }
  } catch (error) {
    return reply.status(503).send({ status: 'not ready', error: error });
  }
}

// Liveness check (for Kubernetes)
export async function livenessCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  return reply.status(200).send({ status: 'alive' });
}