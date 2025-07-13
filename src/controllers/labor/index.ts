import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { DesignationsService } from "../../services/designations.service";
import { laborSchema, designationSchema } from "./schemas";
import { NotificationType } from "../../types";

interface LaborRoutesOptions {
  supabaseService: SupabaseService;
  designationsService: DesignationsService;
}

interface DesignationBody {
  Body: { designation: string };
}

const laborRoutes: FastifyPluginAsync<LaborRoutesOptions> = async (
  fastify: FastifyInstance,
  { supabaseService, designationsService }
) => {
  fastify.get(
    "/labor",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const designations = await designationsService.readDesignations();
        const { data, error } = await supabaseService
          .getClient()
          .from("labor_details")
          .select("*");
        if (error) throw error;
        return reply.send({ data, designations });
      } catch (err) {
        throw new Error("Failed to fetch labor data");
      }
    }
  );

  fastify.post(
    "/labor",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const body = laborSchema.parse(request.body);
        await designationsService.saveDesignation(body.designation);
        const { data, error } = await supabaseService
          .getClient()
          .from("labor_details")
          .insert({ ...body, user_id: userId })
          .select();
        if (error) throw error;

        await fastify.supabase.from("notifications").insert({
          action: "labor_added" as NotificationType,
          user_id: userId,
          company_id: body.company_id,
          project_id: body.project_id,
          message: `Labor ${body.first_name} ${body.last_name} added`,
          sent_to: { user_ids: [userId] },
        });

        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to add labor");
      }
    }
  );

  fastify.get(
    "/labor/designations",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const designations = await designationsService.readDesignations();
        return reply.send(designations);
      } catch (err) {
        throw new Error("Failed to fetch designations");
      }
    }
  );

  fastify.post<{ Body: { designation: string } }>(
    "/labor/designations",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest<DesignationBody>, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const { designation } = designationSchema.parse(request.body);
        await designationsService.saveDesignation(designation);
        return reply.send({ message: "Designation added" });
      } catch (err) {
        throw new Error("Failed to add designation");
      }
    }
  );
};

export default laborRoutes;
