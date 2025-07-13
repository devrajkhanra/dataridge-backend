import { FastifyRequest, FastifyReply } from "fastify";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return reply.status(401).send({ error: "Missing token" });
    }
    const { data, error } = await request.server.supabase.auth.getUser(token);
    if (error) throw error;
    request.user = {
      sub: data.user?.id,
      roles: data.user?.app_metadata?.roles || [],
    };
  } catch (err) {
    request.server.log.error(err);
    return reply.status(401).send({ error: "Invalid token" });
  }
}
