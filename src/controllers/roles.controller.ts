import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SupabaseService } from "../services/supabase.service";
import { JwtPayload } from "../types";

export async function rolesController(
  fastify: FastifyInstance,
  supabaseService: SupabaseService
) {
  fastify.get(
    "/roles",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("roles")
          .select("*");
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to fetch roles" });
      }
    }
  );

  fastify.post(
    "/roles",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const { data, error } = await supabaseService
          .getClient()
          .from("roles")
          .insert(request.body)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to add role" });
      }
    }
  );

  fastify.delete(
    "/roles/:id",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const { data, error } = await supabaseService
          .getClient()
          .from("roles")
          .delete()
          .eq("id", request.params.id);
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to delete role" });
      }
    }
  );
}
