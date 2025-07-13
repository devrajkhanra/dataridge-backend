import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { validateRequest } from "../../middleware/validation";
import { enhancedRestrictTo } from "../../middleware/enhanced-auth";
import { materialTakeoffSchema } from "./schemas";
import { ApiResponse } from "../../types/common";
import { MaterialTakeoff } from "../../types/construction";

interface MaterialTakeoffsOptions {
  supabaseService: SupabaseService;
}

const materialTakeoffsRoutes: FastifyPluginAsync<MaterialTakeoffsOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  // Get material takeoffs
  fastify.get(
    "/material-takeoffs",
    {
      preHandler: [enhancedRestrictTo(["admin", "user"])],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const { project_id } = request.query as any;

      let query = supabaseService
        .getClient()
        .from("material_takeoffs")
        .select("*")
        .order("created_at", { ascending: false });

      if (project_id) {
        query = query.eq("project_id", project_id);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch material takeoffs: ${error.message}`);
      }

      const response: ApiResponse<MaterialTakeoff[]> = {
        success: true,
        data: data as MaterialTakeoff[],
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(response);
    }
  );

  // Create material takeoff
  fastify.post(
    "/material-takeoffs",
    {
      preHandler: [
        enhancedRestrictTo(["admin", "user"]),
        validateRequest({ body: materialTakeoffSchema }),
      ],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const body = request.body as any;

      // Calculate total cost
      const totalCost = body.materials.reduce((sum: number, material: any) => {
        const materialTotal = material.quantity * material.unit_cost;
        material.total_cost = materialTotal;
        return sum + materialTotal;
      }, 0);

      const takeoffData = {
        ...body,
        id: crypto.randomUUID(),
        total_cost: totalCost,
        status: 'draft',
        created_by: userId,
      };

      const { data, error } = await supabaseService
        .getClient()
        .from("material_takeoffs")
        .insert(takeoffData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create material takeoff: ${error.message}`);
      }

      const response: ApiResponse<MaterialTakeoff> = {
        success: true,
        data: data as MaterialTakeoff,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.status(201).send(response);
    }
  );

  // Update material takeoff status
  fastify.put(
    "/material-takeoffs/:id/status",
    {
      preHandler: [enhancedRestrictTo(["admin"])],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      const { data, error } = await supabaseService
        .getClient()
        .from("material_takeoffs")
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update material takeoff: ${error.message}`);
      }

      const response: ApiResponse<MaterialTakeoff> = {
        success: true,
        data: data as MaterialTakeoff,
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

export default materialTakeoffsRoutes;