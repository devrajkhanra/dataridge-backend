import { z } from "zod";
import { CompanyUserSchema } from "../../types";

export const companySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const companyUserSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => crypto.randomUUID()),
  company_id: z.string().default("default"),
  status: z.string().default("active"),
  created_at: z.string().default(() => new Date().toISOString()),
  updated_at: z.string().default(() => new Date().toISOString()),
  table_name: z.string().min(1),
  column_name: z.string().min(1),
  data_type: z.enum([
    "TEXT",
    "INTEGER",
    "NUMERIC",
    "BOOLEAN",
    "TIMESTAMP",
    "DATE",
    "JSONB",
    "TEXT[]",
    "UUID",
  ]),
  is_required: z.boolean(),
  constraints: z.array(z.string()).optional(),
}) satisfies z.ZodType<CompanyUserSchema>;
