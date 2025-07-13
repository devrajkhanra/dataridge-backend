import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { validateRequest } from "../../middleware/validation";
import { enhancedRestrictTo } from "../../middleware/enhanced-auth";
import { rfiSchema, rfiResponseSchema } from "./schemas";
import { ApiResponse } from "../../types/common";
import { RFI } from "../../types/construction";

interface RFIsOptions {
  supabaseService: SupabaseService;
}

const rfisRoutes: FastifyPluginAsync<RFIsOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  // Get RFIs
  fastify.get(
    "/rfis",
    {
      preHandler: [enhancedRestrictTo(["admin", "user"])],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const { project_id, status } = request.query as any;

      let query = supabaseService
        .getClient()
        .from("rfis")
        .select("*")
        .order("created_at", { ascending: false });

      if (project_id) {
        query = query.eq("project_id", project_id);
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch RFIs: ${error.message}`);
      }

      const response: ApiResponse<RFI[]> = {
        success: true,
        data: data as RFI[],
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(response);
    }
  );

  // Create RFI
  fastify.post(
    "/rfis",
    {
      preHandler: [
        enhancedRestrictTo(["admin", "user"]),
        validateRequest({ body: rfiSchema }),
      ],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const body = request.body as any;

      const rfiData = {
        ...body,
        id: crypto.randomUUID(),
        rfi_number: `RFI-${Date.now()}`,
        submitted_by: userId,
        status: 'open',
      };

      const { data, error } = await supabaseService
        .getClient()
        .from("rfis")
        .insert(rfiData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create RFI: ${error.message}`);
      }

      const response: ApiResponse<RFI> = {
        success: true,
        data: data as RFI,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.status(201).send(response);
    }
  );

  // Respond to RFI
  fastify.post(
    "/rfis/:id/respond",
    {
      preHandler: [
        enhancedRestrictTo(["admin", "user"]),
        validateRequest({ body: rfiResponseSchema }),
      ],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const { id } = request.params as { id: string };
      const { response, response_attachments } = request.body as any;

      const updateData = {
        response,
        response_attachments: response_attachments || [],
        status: 'responded',
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseService
        .getClient()
        .from("rfis")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to respond to RFI: ${error.message}`);
      }

      const apiResponse: ApiResponse<RFI> = {
        success: true,
        data: data as RFI,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(apiResponse);
    }
  );
};

export default rfisRoutes;