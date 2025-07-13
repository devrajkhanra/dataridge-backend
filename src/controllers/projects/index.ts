import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { projectSchema } from "./schemas";
import { NotificationType, ProjectTableSchema } from "../../types";

interface ProjectRoutesOptions {
  supabaseService: SupabaseService;
}

const projectsRoutes: FastifyPluginAsync<ProjectRoutesOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  fastify.get(
    "/projects",
    { preHandler: fastify.restrictTo(["admin", "user"]) },
    async (request, reply) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("projects")
          .select("*");
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to fetch projects");
      }
    }
  );

  fastify.post(
    "/projects",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const body: Omit<ProjectTableSchema, "id"> = projectSchema.parse(
          request.body
        );
        const projectSchema: ProjectTableSchema = {
          id: crypto.randomUUID(),
          ...body,
          status: "active",
        };

        const { data, error } = await supabaseService
          .getClient()
          .from("project_table_schemas")
          .insert(projectSchema)
          .select();
        if (error) throw error;

        await fastify.supabase.from("notifications").insert({
          action: "project_added" as NotificationType,
          user_id: userId,
          company_id: body.company_id,
          project_id: body.project_id,
          message: `Project schema ${body.table_name} added`,
          sent_to: { user_ids: [userId] },
        });

        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to add project");
      }
    }
  );
};

export default projectsRoutes;
