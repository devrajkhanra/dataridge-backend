import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { validateRequest } from "../../middleware/validation";
import { enhancedRestrictTo } from "../../middleware/enhanced-auth";
import { dailyReportSchema, dailyReportQuerySchema } from "./schemas";
import { ApiResponse } from "../../types/common";
import { DailyReport } from "../../types/construction";

interface DailyReportsOptions {
  supabaseService: SupabaseService;
}

const dailyReportsRoutes: FastifyPluginAsync<DailyReportsOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  // Get daily reports for a project
  fastify.get(
    "/daily-reports",
    {
      preHandler: [
        enhancedRestrictTo(["admin", "user"]),
        validateRequest({ query: dailyReportQuerySchema }),
      ],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const { project_id, date_from, date_to } = request.query as any;

      let query = supabaseService
        .getClient()
        .from("daily_reports")
        .select("*")
        .order("report_date", { ascending: false });

      if (project_id) {
        query = query.eq("project_id", project_id);
      }

      if (date_from) {
        query = query.gte("report_date", date_from);
      }

      if (date_to) {
        query = query.lte("report_date", date_to);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch daily reports: ${error.message}`);
      }

      const response: ApiResponse<DailyReport[]> = {
        success: true,
        data: data as DailyReport[],
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(response);
    }
  );

  // Create daily report
  fastify.post(
    "/daily-reports",
    {
      preHandler: [
        enhancedRestrictTo(["admin", "user"]),
        validateRequest({ body: dailyReportSchema }),
      ],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const body = request.body as any;

      const reportData = {
        ...body,
        created_by: userId,
        id: crypto.randomUUID(),
      };

      const { data, error } = await supabaseService
        .getClient()
        .from("daily_reports")
        .insert(reportData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create daily report: ${error.message}`);
      }

      const response: ApiResponse<DailyReport> = {
        success: true,
        data: data as DailyReport,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.status(201).send(response);
    }
  );

  // Get daily report by ID
  fastify.get(
    "/daily-reports/:id",
    {
      preHandler: [enhancedRestrictTo(["admin", "user"])],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const { id } = request.params as { id: string };

      const { data, error } = await supabaseService
        .getClient()
        .from("daily_reports")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return reply.status(404).send({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Daily report not found' },
          });
        }
        throw new Error(`Failed to fetch daily report: ${error.message}`);
      }

      const response: ApiResponse<DailyReport> = {
        success: true,
        data: data as DailyReport,
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

export default dailyReportsRoutes;