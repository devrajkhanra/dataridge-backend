import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { dataSchema } from "./schemas";

interface DataRoutesOptions {
  supabaseService: SupabaseService;
}

interface DataParams {
  Params: { id: string };
}

const dataRoutes: FastifyPluginAsync<DataRoutesOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  fastify.get(
    "/data",
    { preHandler: fastify.restrictTo(["admin", "user"]) },
    async (request, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const { data, error } = await supabaseService
          .getClient()
          .from("data")
          .select("*")
          .eq("user_id", userId);
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to fetch data");
      }
    }
  );

  fastify.post(
    "/data",
    { preHandler: fastify.restrictTo(["admin", "user"]) },
    async (request, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const body = dataSchema.parse(request.body);
        const { data, error } = await supabaseService
          .getClient()
          .from("data")
          .insert({ ...body, user_id: userId })
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to insert data");
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/data/:id",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest<DataParams>, reply) => {
      try {
        const { id } = request.params;
        const { data, error } = await supabaseService
          .getClient()
          .from("data")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to delete data");
      }
    }
  );
};

export default dataRoutes;
