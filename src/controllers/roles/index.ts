import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { roleSchema } from "./schemas";

interface RolesRoutesOptions {
  supabaseService: SupabaseService;
}

interface RoleParams {
  Params: { id: string };
}

const rolesRoutes: FastifyPluginAsync<RolesRoutesOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  fastify.get(
    "/roles",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("roles")
          .select("*");
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to fetch roles");
      }
    }
  );

  fastify.post(
    "/roles",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const body = roleSchema.parse(request.body);
        const { data, error } = await supabaseService
          .getClient()
          .from("roles")
          .insert(body)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to add role");
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/roles/:id",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest<RoleParams>, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const { id } = request.params;
        const { data, error } = await supabaseService
          .getClient()
          .from("roles")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to delete role");
      }
    }
  );
};

export default rolesRoutes;
