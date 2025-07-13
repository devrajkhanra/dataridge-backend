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
          column_name: body.columns[0].column_name,
          data_type: body.columns[0].data_type,
          is_required: body.columns[0].is_required,
          constraints: body.columns[0].constraints,
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
        throw new Error("Failed to add project");
      }
    }
  );
};

export default projectsRoutes;
