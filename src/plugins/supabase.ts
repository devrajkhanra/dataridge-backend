import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { createClient } from "@supabase/supabase-js";
import { SupabaseService } from "../services/supabase.service";
import env from "../config/env";
import { authMiddleware } from "../middleware/auth";
import { restrictTo } from "../middleware/restrictTo";

const supabasePlugin: FastifyPluginAsync = async (fastify) => {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
  fastify.decorate("supabase", supabase);
  fastify.decorate("supabaseService", new SupabaseService());
  fastify.decorate("restrictTo", restrictTo);
  fastify.addHook("preHandler", authMiddleware);
};

export default fp(supabasePlugin, { name: "supabase" });
