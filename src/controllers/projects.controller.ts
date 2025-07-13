import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SupabaseService } from "../services/supabase.service";
import { ProjectTableSchema, JwtPayload, NotificationType } from "../types";

export async function projectsController(
  fastify: FastifyInstance,
  supabaseService: SupabaseService
) {
  fastify.get(
    "/projects",
    { preHandler: fastify.restrictTo(["admin", "user"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("projects")
          .select("*");
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to fetch projects" });
      }
    }
  );

  fastify.post(
    "/projects",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const projectSchema: ProjectTableSchema = {
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
          .from("project_schemas")
          .insert(projectSchema)
          .select();
        if (error) throw error;

        await fastify.supabase.from("notifications").insert({
          type: "project_added" as NotificationType,
          user_id: userId,
          payload: projectSchema,
        });

        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to add project" });
      }
    }
  );
}
