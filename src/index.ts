import "dotenv/config";
import fastify from "fastify";
import jwtPlugin from "./plugins/jwt";
import loggingPlugin from "./plugins/logging";
import supabasePlugin from "./plugins/supabase";
import errorMiddleware from "./middleware/error";
import companyRoutes from "./controllers/company/index";
import dataRoutes from "./controllers/data/index";
import laborRoutes from "./controllers/labor/index";
import projectsRoutes from "./controllers/projects/index";
import rolesRoutes from "./controllers/roles/index";
import schemaRoutes from "./controllers/schema/index";
import templateRoutes from "./controllers/template/index";
import usersRoutes from "./controllers/users/index";
import { SupabaseService } from "./services/supabase.service";
import { DesignationsService } from "./services/designations.service";

const app = fastify({ logger: true });

// Register plugins
app.register(jwtPlugin);
app.register(loggingPlugin);
app.register(supabasePlugin);

// Register error middleware
app.setErrorHandler(errorMiddleware);

// Initialize services
const supabaseService = new SupabaseService();
const designationsService = new DesignationsService();

// Register routes
app.register(companyRoutes, { supabaseService });
app.register(dataRoutes, { supabaseService });
app.register(laborRoutes, { supabaseService, designationsService });
app.register(projectsRoutes, { supabaseService });
app.register(rolesRoutes, { supabaseService });
app.register(schemaRoutes, { supabaseService });
app.register(templateRoutes, { supabaseService });
app.register(usersRoutes, { supabaseService });

// Start server
app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info("Server running on port 3000");
});
