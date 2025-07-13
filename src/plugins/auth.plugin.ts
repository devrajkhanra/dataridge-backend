import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../services/supabase.service";

const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.decorate(
    "supabase",
    createClient("your-supabase-url", "your-supabase-key")
  );
  fastify.decorate("supabaseService", new SupabaseService());

  fastify.addHook("preHandler", async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return reply.status(401).send({ error: "Missing token" });
      }
      const { data, error } = await fastify.supabase.auth.getUser(token);
      if (error) throw error;
      request.user = {
        sub: data.user?.id,
        roles: data.user?.app_metadata?.roles || [],
      };
    } catch (err) {
      const error = err as Error;
      fastify.log.error(error.message);
      return reply.status(401).send({ error: "Invalid token" });
    }
  });
};

export default fp(authPlugin, { name: "auth" });
