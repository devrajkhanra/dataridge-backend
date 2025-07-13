import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SupabaseService } from "../services/supabase.service";
import { ProjectTableSchema, JwtPayload } from "../types";

export async function schemaController(
  fastify: FastifyInstance,
  supabaseService: SupabaseService
) {
  fastify.post(
    "/schema",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const schema: ProjectTableSchema = {
          id: crypto.randomUUID(),
          company_id: request.body.company_id,
          project_id: request.body.project_id,
          table_name: request.body.table_name,
          column_name: request.body.columns[0].column_name,
          data_type: request.body.columns[0].data_type,
          is_required: request.body.columns[0].is_required,
          constraints: request.body.columns[0].constraints,
          columns: request.body.columns,
        };

        const { data, error } = await supabaseService
          .getClient()
          .from("schemas")
          .insert(schema)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to create schema" });
      }
    }
  );
}
