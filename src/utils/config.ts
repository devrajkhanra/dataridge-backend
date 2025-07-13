import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  SENDGRID_API_KEY: z.string().min(1),
  PORT: z.string().default("3000").transform(Number),
});

const config = envSchema.parse(process.env);

export { config };
