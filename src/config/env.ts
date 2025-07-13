import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_KEY: z.string().min(1, "SUPABASE_KEY is required"),
});

const env = envSchema.parse(process.env);

export default env;
