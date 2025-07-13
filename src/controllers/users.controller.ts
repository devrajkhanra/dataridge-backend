import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SupabaseService } from "../services/supabase.service";
import { JwtPayload } from "../types";

export async function usersController(
  fastify: FastifyInstance,
  supabaseService: SupabaseService
) {
  fastify.get(
    "/users",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("users")
          .select("*");
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to fetch users" });
      }
    }
  );

  fastify.post(
    "/users",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("users")
          .insert(request.body)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to add user" });
      }
    }
  );

  fastify.delete(
    "/users/:id",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("users")
          .delete()
          .eq("id", request.params.id);
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to delete user" });
      }
    }
  );
}
