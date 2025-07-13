import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SupabaseService } from "../services/supabase.service";
import { JwtPayload, NotificationType } from "../types";

export async function templateController(
  fastify: FastifyInstance,
  supabaseService: SupabaseService
) {
  fastify.get(
    "/templates",
    { preHandler: fastify.restrictTo(["admin", "user"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const { data, error } = await supabaseService
          .getClient()
          .from("templates")
          .select("*")
          .eq("user_id", userId);
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to fetch templates" });
      }
    }
  );

  fastify.post(
    "/templates",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const { data, error } = await supabaseService
          .getClient()
          .from("templates")
          .insert(request.body)
          .select();
        if (error) throw error;

        await fastify.supabase.from("notifications").insert({
          type: "template_added" as NotificationType,
          user_id: userId,
          payload: request.body,
        });

        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to add template" });
      }
    }
  );
}
