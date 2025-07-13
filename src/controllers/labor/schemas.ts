import { z } from "zod";
import { Labor } from "../../types";

export const laborSchema = z.object({
  address: z.string().default(""),
  user_id: z.string().uuid(),
  status: z.enum(["active", "inactive", "terminated"]).default("active"),
  pf_number: z.string().default(""),
  esi_number: z.string().default(""),
  joining_date: z.string().default(() => new Date().toISOString()),
  designation: z.string().default("General Laborer"),
}) satisfies z.ZodType<Omit<Labor, "id" | "created_at" | "updated_at">>;

export const designationSchema = z.object({
  designation: z.string().min(1, "Designation is required"),
});
