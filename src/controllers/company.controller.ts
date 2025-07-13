import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { SupabaseService } from "../services/supabase.service";
import { CompanyUserSchema, JwtPayload } from "../types";

export async function companyController(
  fastify: FastifyInstance,
  supabaseService: SupabaseService
) {
  fastify.get(
    "/companies",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("companies")
          .select("*");
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to fetch companies" });
      }
    }
  );

  fastify.post(
    "/companies",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const { data, error } = await supabaseService
          .getClient()
          .from("companies")
          .insert(request.body)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to create company" });
      }
    }
  );

  fastify.post(
    "/company-schema",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const schemas: CompanyUserSchema[] = (request.body as any).map(
          (item: any) => ({
            id: item.id || crypto.randomUUID(),
            company_id: item.company_id || "default",
            status: item.status || "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            table_name: item.table_name,
            column_name: item.column_name,
            data_type: item.data_type,
            is_required: item.is_required,
            constraints: item.constraints,
          })
        );

        const { data, error } = await supabaseService
          .getClient()
          .from("company_schemas")
          .insert(schemas)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        const error = err as Error;
        fastify.log.error(error.message);
        return reply.status(500).send({ error: "Failed to update schema" });
      }
    }
  );
}
