import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { FileService } from "../utils/file.utils";
import { SupabaseService } from "../services/supabase.service";
import { Labor, JwtPayload } from "../types";

export async function laborController(
  fastify: FastifyInstance,
  fileService: FileService,
  supabaseService: SupabaseService
) {
  fastify.get(
    "/labor",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const designations = await fileService.readDesignations();
        const { data, error } = await supabaseService
          .getClient()
          .from("labor")
          .select("*");
        if (error) throw error;
        return reply.send({ data, designations });
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to fetch labor data" });
      }
    }
  );

  fastify.post(
    "/labor",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const laborData: Omit<Labor, "id" | "created_at" | "updated_at"> = {
          address: request.body.address || "",
          user_id: userId,
          status: request.body.status || "active",
          pf_number: request.body.pf_number || "",
          esi_number: request.body.esi_number || "",
          joining_date: request.body.joining_date || new Date().toISOString(),
        };

        const designations = await fileService.readDesignations();
        await fileService.saveDesignation(laborData.pf_number);
        const { data, error } = await supabaseService
          .getClient()
          .from("labor")
          .insert(laborData)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to add labor" });
      }
    }
  );
}
