import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { templateSchema } from "./schemas";
import { NotificationType } from "../../types";

interface TemplateRoutesOptions {
  supabaseService: SupabaseService;
}

const templateRoutes: FastifyPluginAsync<TemplateRoutesOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  fastify.get(
    "/templates",
    { preHandler: fastify.restrictTo(["admin", "user"]) },
    async (request, reply) => {
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
        throw new Error("Failed to fetch templates");
      }
    }
  );

  fastify.post(
    "/templates",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const body = templateSchema.parse(request.body);
        const { data, error } = await supabaseService
          .getClient()
          .from("templates")
          .insert({ ...body, user_id: userId })
          .select();
        if (error) throw error;

        await fastify.supabase.from("notifications").insert({
          type: "template_added" as NotificationType,
          user_id: userId,
          payload: body,
        });

        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to add template");
      }
    }
  );
};

export default templateRoutes;
