import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SupabaseService } from "../services/supabase.service";
import { JwtPayload } from "../types";

export async function dataController(
  fastify: FastifyInstance,
  supabaseService: SupabaseService
) {
  fastify.get(
    "/data",
    { preHandler: fastify.restrictTo(["admin", "user"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to fetch data" });
      }
    }
  );

  fastify.post(
    "/data",
    { preHandler: fastify.restrictTo(["admin", "user"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const { data, error } = await supabaseService
          .getClient()
          .from("data")
          .insert({ ...request.body, user_id: userId })
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to insert data" });
      }
    }
  );

  fastify.delete(
    "/data/:id",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("data")
          .delete()
          .eq("id", request.params.id);
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to delete data" });
      }
    }
  );
}
