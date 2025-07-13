import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import { SupabaseService } from "../../services/supabase.service";
import { userSchema } from "./schemas";

interface UsersRoutesOptions {
  supabaseService: SupabaseService;
}

interface UserParams {
  Params: { id: string };
}

const usersRoutes: FastifyPluginAsync<UsersRoutesOptions> = async (
  fastify: FastifyInstance,
  { supabaseService }
) => {
  fastify.get(
    "/users",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const { data, error } = await supabaseService
          .getClient()
          .from("users")
          .select("*");
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to fetch users");
      }
    }
  );

  fastify.post(
    "/users",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request, reply) => {
      try {
        const body = userSchema.parse(request.body);
        const { data, error } = await supabaseService
          .getClient()
          .from("users")
          .insert(body)
          .select();
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to add user");
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/users/:id",
    { preHandler: fastify.restrictTo(["admin"]) },
    async (request: FastifyRequest<UserParams>, reply) => {
      try {
        const { id } = request.params;
        const { data, error } = await supabaseService
          .getClient()
          .from("users")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return reply.send(data);
      } catch (err) {
        throw new Error("Failed to delete user");
      }
    }
  );
};

export default usersRoutes;
