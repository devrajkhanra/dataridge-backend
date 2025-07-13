import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { validateRequest } from "../../middleware/validation";
import { enhancedRestrictTo } from "../../middleware/enhanced-auth";
import { changeOrderSchema, changeOrderQuerySchema } from "./schemas";
import { ApiResponse } from "../../types/common";
import { ChangeOrder } from "../../types/construction";

interface ChangeOrdersOptions {
  supabaseService: SupabaseService;
}

const changeOrdersRoutes: FastifyPluginAsync<ChangeOrdersOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  // Get change orders
  fastify.get(
    "/change-orders",
    {
      preHandler: [
        enhancedRestrictTo(["admin", "user"]),
        validateRequest({ query: changeOrderQuerySchema }),
      ],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const { project_id, status } = request.query as any;

      let query = supabaseService
        .getClient()
        .from("change_orders")
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
        throw new Error(`Failed to fetch change orders: ${error.message}`);
      }

      const response: ApiResponse<ChangeOrder[]> = {
        success: true,
        data: data as ChangeOrder[],
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.send(response);
    }
  );

  // Create change order with cost estimation
  fastify.post(
    "/change-orders",
    {
      preHandler: [
        enhancedRestrictTo(["admin", "user"]),
        validateRequest({ body: changeOrderSchema }),
      ],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const body = request.body as any;

      // Calculate total costs
      const laborTotal = body.labor_costs?.reduce((sum: number, item: any) => 
        sum + (item.hours * item.rate_per_hour), 0) || 0;
      
      const materialTotal = body.material_costs?.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unit_cost), 0) || 0;
      
      const equipmentTotal = body.equipment_costs?.reduce((sum: number, item: any) => 
        sum + (item.hours * item.rate_per_hour), 0) || 0;

      const subtotal = laborTotal + materialTotal + equipmentTotal;
      const overhead = subtotal * (body.overhead_percentage || 0) / 100;
      const profit = (subtotal + overhead) * (body.profit_percentage || 0) / 100;
      const totalCost = subtotal + overhead + profit;

      const changeOrderData = {
        ...body,
        id: crypto.randomUUID(),
        change_number: `CO-${Date.now()}`,
        total_cost: totalCost,
        requested_by: userId,
        status: 'draft',
      };

      const { data, error } = await supabaseService
        .getClient()
        .from("change_orders")
        .insert(changeOrderData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create change order: ${error.message}`);
      }

      const response: ApiResponse<ChangeOrder> = {
        success: true,
        data: data as ChangeOrder,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: process.env.API_VERSION || '1.0.0',
        },
      };

      return reply.status(201).send(response);
    }
  );

  // Update change order status
  fastify.put(
    "/change-orders/:id/status",
    {
      preHandler: [enhancedRestrictTo(["admin"])],
    },
    async (request, reply) => {
      const requestId = request.headers['x-request-id'] as string;
      const userId = request.user!.sub;
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updateData.approved_by = userId;
      }

      const { data, error } = await supabaseService
        .getClient()
        .from("change_orders")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update change order: ${error.message}`);
      }

      const response: ApiResponse<ChangeOrder> = {
        success: true,
        data: data as ChangeOrder,
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

export default changeOrdersRoutes;