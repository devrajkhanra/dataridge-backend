import Fastify from "fastify";
import cookie from "@fastify/cookie";
import authRoutes from "./features/auth/routes/auth.routes";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

const fastify = Fastify({
  logger: true,
});

// Register cookie plugin
fastify.register(cookie, {
  secret: process.env.COOKIE_SECRET || "supersecret", // for signed cookies
  parseOptions: {}, // options for parsing cookies
});

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

// Register auth routes
fastify.register(authRoutes, { prefix: "/auth" });

// Register Swagger and Swagger UI
fastify.register(swagger, {
  openapi: {
    info: {
      title: "Dataridge Backend API",
      description: "API documentation for Dataridge backend",
      version: "1.0.0",
    },
  },
});

fastify.register(swaggerUI, {
  routePrefix: "/docs",
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server listening on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
