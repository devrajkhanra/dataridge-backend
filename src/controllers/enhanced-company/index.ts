import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import { EnhancedCompanyService } from "../../services/enhanced-company.service";
import { CompanyRepository } from "../../repositories/company.repository";
import { validateRequest } from "../../middleware/validation";
import { enhancedRestrictTo } from "../../middleware/enhanced-auth";
import { rateLimit } from "../../middleware/security";
import { createCompanySchema, updateCompanySchema, companyParamsSchema, paginationQuerySchema } from "./schemas";
import { ApiResponse, PaginationParams } from "../../types/common";

interface CompanyRoutesOptions {
  companyService: EnhancedCompanyService;
}

interface CompanyParams {
  Params: { id: string };
}

interface CompanyQuery {
  Querystring: PaginationParams;
}

const enhancedCompanyRoutes: FastifyPluginAsync<CompanyRoutesOptions> = async (
  fastify: FastifyInstance,
  { companyService }
) => {
  // Rate limiting for company operations
  const companyRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req) => `company:${req.user?.sub || req.ip}`,
  });

  // Get all companies (admin only)
  fastify.get<{ Querystring: PaginationParams }>(
    "/companies",
    {
      preHandler: [
        companyRateLimit,
        enhancedRestrictTo(["admin"]),
        validateRequest({ query: paginationQuerySchema }),
      ],
    },
    async (request: FastifyRequest<CompanyQuery>, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const pagination = request.query;

      const companies = await companyService.getAllCompanies(
        Object.keys(pagination).length > 0 ? pagination : undefined,
        requestId
      );

      const response: ApiResponse = {
        success: true,
        data: companies,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(response);
    }
  );

  // Get user's companies
  fastify.get<{ Querystring: PaginationParams }>(
    "/companies/my",
    {
      preHandler: [
        companyRateLimit,
        enhancedRestrictTo(["admin", "user"]),
        validateRequest({ query: paginationQuerySchema }),
      ],
    },
    async (request: FastifyRequest<CompanyQuery>, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const pagination = request.query;

      const companies = await companyService.getCompaniesByUser(
        userId,
        Object.keys(pagination).length > 0 ? pagination : undefined,
        requestId
      );

      const response: ApiResponse = {
        success: true,
        data: companies,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(response);
    }
  );

  // Get company by ID
  fastify.get<{ Params: { id: string } }>(
    "/companies/:id",
    {
      preHandler: [
        companyRateLimit,
        enhancedRestrictTo(["admin", "user"]),
        validateRequest({ params: companyParamsSchema }),
      ],
    },
    async (request: FastifyRequest<CompanyParams>, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const { id } = request.params;

      const company = await companyService.getCompanyById(id, userId, requestId);

      const response: ApiResponse = {
        success: true,
        data: company,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(response);
    }
  );

  // Create company
  fastify.post(
    "/companies",
    {
      preHandler: [
        rateLimit({
          windowMs: 15 * 60 * 1000,
          maxRequests: 10, // Stricter limit for creation
          keyGenerator: (req) => `company_create:${req.user?.sub || req.ip}`,
        }),
        enhancedRestrictTo(["admin"]),
        validateRequest({ body: createCompanySchema }),
      ],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const body = request.body as any;

      const company = await companyService.createCompany(body, userId, requestId);

      const response: ApiResponse = {
        success: true,
        data: company,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.status(201).send(response);
    }
  );

  // Update company
  fastify.put<{ Params: { id: string } }>(
    "/companies/:id",
    {
      preHandler: [
        companyRateLimit,
        enhancedRestrictTo(["admin"]),
        validateRequest({ 
          params: companyParamsSchema,
          body: updateCompanySchema 
        }),
      ],
    },
    async (request: FastifyRequest<CompanyParams>, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const { id } = request.params;
      const body = request.body as any;

      const company = await companyService.updateCompany(id, body, userId, requestId);

      const response: ApiResponse = {
        success: true,
        data: company,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(response);
    }
  );

  // Delete company
  fastify.delete<{ Params: { id: string } }>(
    "/companies/:id",
    {
      preHandler: [
        rateLimit({
          windowMs: 15 * 60 * 1000,
          maxRequests: 5, // Very strict limit for deletion
          keyGenerator: (req) => `company_delete:${req.user?.sub || req.ip}`,
        }),
        enhancedRestrictTo(["admin"]),
        validateRequest({ params: companyParamsSchema }),
      ],
    },
    async (request: FastifyRequest<CompanyParams>, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const { id } = request.params;

      await companyService.deleteCompany(id, userId, requestId);

      const response: ApiResponse = {
        success: true,
        data: { message: "Company deleted successfully" },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(response);
    }
  );
};

export default enhancedCompanyRoutes;