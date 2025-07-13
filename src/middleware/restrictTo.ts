import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { JwtPayload } from "../types";

export function restrictTo(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const userRoles = (request.user as JwtPayload)?.roles || [];
      if (!roles.some((role) => userRoles.includes(role))) {
        return reply.status(403).send({ error: "Forbidden" });
      }
    } catch (err) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  };
}
