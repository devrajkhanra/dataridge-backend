import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import pino from "pino";

const loggingPlugin: FastifyPluginAsync = async (fastify) => {
  const logger = pino({
    level: "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  });

  fastify.decorate("log", logger);
};

export default fp(loggingPlugin, { name: "logging" });

declare module "fastify" {
  interface FastifyInstance {
    logger: import("pino").Logger;
  }
}
