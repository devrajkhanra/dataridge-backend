import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { companySchema, companyUserSchema } from "./schemas";
import { CompanyUserSchema } from "../../types";

interface CompanyRoutesOptions {
  supabaseService: SupabaseService;
}

const companyRoutes: FastifyPluginAsync<CompanyRoutesOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  fastify.get(
    "/companies",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("companies")
          .select("*");
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to fetch companies");
      }
    }
  );

  fastify.post(
    "/companies",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const userId = request.user?.sub;
        if (!userId) throw new Error("Invalid JWT payload");

        const body = companySchema.parse(request.body);
        const { data, error } = await supabaseService
          .getClient()
          .from("companies")
          .insert({ ...body, user_id: userId })
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to create company");
      }
    }
  );

  fastify.post(
    "/company-schema",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const schemas = companyUserSchema.array().parse(request.body);
        const formattedSchemas: CompanyUserSchema[] = schemas.map(
          (item: CompanyUserSchema) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            company_id: item.company_id || "default",
            status: item.status || "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        );

        const { data, error } = await supabaseService
          .getClient()
          .from("company_schemas")
          .insert(formattedSchemas)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to update schema");
      }
    }
  );
};

export default companyRoutes;
