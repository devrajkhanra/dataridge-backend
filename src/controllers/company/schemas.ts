import { z } from "zod";
import { CompanyUserSchema } from "../../types";

export const companySchema = z.object({
  name: z.string().min(1),
  logo_url: z.string().optional(),
  contact_email: z.string().email(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
});

export const companyUserSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => crypto.randomUUID()),
  company_id: z.string().default("default"),
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
  status: z.enum(["active", "pending_removal"]).default("active"),
  created_at: z.string().default(() => new Date().toISOString()),
  updated_at: z.string().default(() => new Date().toISOString()),
}) satisfies z.ZodType<CompanyUserSchema>;
