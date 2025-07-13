import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { schemaSchema } from "./schemas";
import { NotificationType } from "../../types";

interface SchemaRoutesOptions {
  supabaseService: SupabaseService;
}

const schemaRoutes: FastifyPluginAsync<SchemaRoutesOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  fastify.post(
    "/schema",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const body = schemaSchema.parse(request.body);
        const schema = {
          id: crypto.randomUUID(),
          ...body,
          status: "active",
        };

        const { data, error } = await supabaseService
          .getClient()
          .from("project_table_schemas")
          .insert(schema)
          .select();
        if (error) throw error;

        await fastify.supabase.from("notifications").insert({
          action: "table_created" as NotificationType,
          user_id: userId,
          company_id: body.company_id,
          project_id: body.project_id,
          message: `Schema ${body.table_name} created`,
          sent_to: { user_ids: [userId] },
        });

        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to create schema");
      }
    }
  );
};

export default schemaRoutes;
