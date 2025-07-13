import fastify from "fastify";
import jwt from "@fastify/jwt";
import authPlugin from "./plugins/auth.plugin";
import loggingPlugin from "./plugins/logging.plugin";
import restrictToPlugin from "./plugins/restrictTo";
import { companyController } from "./controllers/company.controller";
import { dataController } from "./controllers/data.controller";
import { laborController } from "./controllers/labor.controller";
import { projectsController } from "./controllers/projects.controller";
import { rolesController } from "./controllers/roles.controller";
import { schemaController } from "./controllers/schema.controller";
import { templateController } from "./controllers/template.controller";
import { usersController } from "./controllers/users.controller";
import { SupabaseService } from "./services/supabase.service";
import { FileService } from "./utils/file.utils";

const app = fastify({ logger: true });
app.register(jwt, { secret: "your-secret" });
app.register(restrictToPlugin);
app.register(authPlugin);
app.register(loggingPlugin);

const supabaseService = new SupabaseService();
const fileService = new FileService(app);

app.register(async (fastify) => companyController(fastify, supabaseService));
app.register(async (fastify) => dataController(fastify, supabaseService));
app.register(async (fastify) =>
  laborController(fastify, fileService, supabaseService)
);
app.register(async (fastify) => projectsController(fastify, supabaseService));
app.register(async (fastify) => rolesController(fastify, supabaseService));
app.register(async (fastify) => schemaController(fastify, supabaseService));
app.register(async (fastify) => templateController(fastify, supabaseService));
app.register(async (fastify) => usersController(fastify, supabaseService));

app.listen({ port: 3000 }, (err) => {
  if (err) console.error(err);
  console.log("Server running on port 3000");
});
