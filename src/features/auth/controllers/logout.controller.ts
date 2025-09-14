import { FastifyRequest, FastifyReply } from "fastify";

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  // Clear the refresh token cookie
  reply.clearCookie("refreshToken", { path: "/token/refresh" });
  return reply.send({ message: "Logged out successfully." });
}
