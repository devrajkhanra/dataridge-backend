import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

const securityPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(helmet);
  fastify.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
};

export default fp(securityPlugin, { name: "security" });
