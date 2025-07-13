import { FastifyPluginAsync } from "fastify";
import jwt from "@fastify/jwt";
import env from "../config/env";

const jwtPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.register(jwt, { secret: env.JWT_SECRET });
};

export default jwtPlugin;
