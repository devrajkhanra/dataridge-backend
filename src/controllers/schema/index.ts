import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { schemaSchema } from "./schemas";

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
        };

        const { data, error } = await supabaseService
          .getClient()
          .from("schemas")
          .insert(schema)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to create schema");
      }
    }
  );
};

export default schemaRoutes;
