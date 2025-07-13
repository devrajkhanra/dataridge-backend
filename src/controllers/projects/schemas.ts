import { z } from "zod";
import { ProjectTableSchema } from "../../types";

export const projectSchema = z.object({
  company_id: z.string().min(1),
  project_id: z.string().min(1),
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
  columns: z
    .array(
      z.object({
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
      })
    )
    .min(1),
}) satisfies z.ZodType<
  Omit<ProjectTableSchema, "id" | "created_at" | "updated_at">
>;
