import { FastifyRequest, FastifyReply, FastifyError } from "fastify";
import { ZodError } from "zod";

export default function errorMiddleware(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.server.log.error(error);

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "Validation failed",
      details: error.errors,
    });
  }

  return reply.status(error.statusCode || 500).send({
    error: error.message || "Internal server error",
  });
}
