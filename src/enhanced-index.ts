import "dotenv/config";
import fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import compress from "@fastify/compress";

// Enhanced plugins and middleware
import jwtPlugin from "./plugins/jwt";
import loggingPlugin from "./plugins/logging";
import supabasePlugin from "./plugins/supabase";

// Enhanced middleware
import enhancedErrorHandler, { setupGlobalErrorHandlers } from "./middleware/enhanced-error";
import { enhancedAuthMiddleware } from "./middleware/enhanced-auth";
import { sanitizeInput } from "./middleware/validation";
import { securityHeaders, requestId, requestLogger, corsOptions } from "./middleware/security";
import { healthCheck, readinessCheck, livenessCheck } from "./middleware/health";

// Enhanced services
import { databaseService } from "./config/database";
import { cacheService } from "./services/cache.service";
import { loggerService } from "./services/logger.service";
import { EnhancedCompanyService } from "./services/enhanced-company.service";
import { CompanyRepository } from "./repositories/company.repository";

// Enhanced controllers
import enhancedCompanyRoutes from "./controllers/enhanced-company/index";

// Construction-specific controllers
import dailyReportsRoutes from "./controllers/construction/daily-reports";
import changeOrdersRoutes from "./controllers/construction/change-orders";
import rfisRoutes from "./controllers/construction/rfis";
import materialTakeoffsRoutes from "./controllers/construction/material-takeoffs";

// Legacy controllers (to be refactored)
import dataRoutes from "./controllers/data/index";
import laborRoutes from "./controllers/labor/index";
import projectsRoutes from "./controllers/projects/index";
import rolesRoutes from "./controllers/roles/index";
import schemaRoutes from "./controllers/schema/index";
import templateRoutes from "./controllers/template/index";
import usersRoutes from "./controllers/users/index";
import { SupabaseService } from "./services/supabase.service";
import { DesignationsService } from "./services/designations.service";

// Setup global error handlers
setupGlobalErrorHandlers();

const app = fastify({ 
  logger: false, // We use our custom logger
  trustProxy: true,
  disableRequestLogging: true,
});

async function startServer() {
  try {
    // Register security plugins
    await app.register(helmet, {
      contentSecurityPolicy: false, // We handle this in middleware
    });

    await app.register(cors, corsOptions);

    await app.register(compress, {
      global: true,
      encodings: ['gzip', 'deflate'],
    });

    // Register core plugins
    await app.register(jwtPlugin);
    await app.register(loggingPlugin);
    await app.register(supabasePlugin);

    // Register global middleware
    app.addHook('preHandler', requestId);
    app.addHook('preHandler', securityHeaders);
    app.addHook('preHandler', requestLogger);
    app.addHook('preHandler', sanitizeInput);

    // Register error handler
    app.setErrorHandler(enhancedErrorHandler);

    // Health check routes (no auth required)
    app.get('/health', healthCheck);
    app.get('/ready', readinessCheck);
    app.get('/alive', livenessCheck);

    // API info route
    app.get('/api/info', async (request, reply) => {
      return reply.send({
        name: 'DataRidge Backend API',
        version: process.env.API_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      });
    });

    // Initialize services
    const supabaseService = new SupabaseService();
    const designationsService = new DesignationsService();
    
    // Initialize enhanced services
    const companyRepository = new CompanyRepository(databaseService.getClient());
    const enhancedCompanyService = new EnhancedCompanyService(companyRepository);

    // Start cache cleanup
    cacheService.startCleanupInterval();

    // Register API routes with authentication
    await app.register(async function(fastify) {
      // Add authentication to all API routes
      fastify.addHook('preHandler', enhancedAuthMiddleware);

      // Enhanced routes
      await fastify.register(enhancedCompanyRoutes, { 
        prefix: '/api/v1',
        companyService: enhancedCompanyService 
      });

      // Construction-specific routes
      await fastify.register(dailyReportsRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });
      await fastify.register(changeOrdersRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });
      await fastify.register(rfisRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });
      await fastify.register(materialTakeoffsRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });

      // Legacy routes (to be refactored)
      await fastify.register(dataRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });
      await fastify.register(laborRoutes, { 
        prefix: '/api/v1',
        supabaseService, 
        designationsService 
      });
      await fastify.register(projectsRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });
      await fastify.register(rolesRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });
      await fastify.register(schemaRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });
      await fastify.register(templateRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });
      await fastify.register(usersRoutes, { 
        prefix: '/api/v1',
        supabaseService 
      });
    });

    // Start server
    const port = parseInt(process.env.PORT || '3000');
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });

    loggerService.info("Server started successfully", {
      requestId: 'startup',
      action: 'server_start',
      metadata: { port, host, environment: process.env.NODE_ENV },
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      loggerService.info(`Received ${signal}, shutting down gracefully`, {
        requestId: 'shutdown',
        action: 'graceful_shutdown',
      });

      try {
        await app.close();
        await databaseService.close();
        await cacheService.flush();
        
        loggerService.info("Server shut down successfully", {
          requestId: 'shutdown',
          action: 'shutdown_complete',
        });
        
        process.exit(0);
      } catch (error) {
        loggerService.error("Error during shutdown", error as Error, {
          requestId: 'shutdown',
          action: 'shutdown_error',
        });
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    loggerService.error("Failed to start server", error as Error, {
      requestId: 'startup',
      action: 'startup_error',
    });
    process.exit(1);
  }
}

// Start the server
startServer();