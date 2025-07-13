import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { JwtPayload } from "../types";

async function restrictToPlugin(fastify: FastifyInstance) {
  fastify.decorate("restrictTo", (roles: string[]) => {
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
  });
}

export default fp(restrictToPlugin, { name: "restrictTo" });

declare module "fastify" {
  interface FastifyInstance {
    restrictTo: (
      roles: string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
