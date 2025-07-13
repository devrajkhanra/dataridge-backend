import { z } from "zod";
import { Labor } from "../../types";

export const laborSchema = z.object({
  company_id: z.string().uuid(),
  user_id: z.string().uuid(),
  project_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  employee_id: z.string().min(1),
  pf_number: z.string().optional(),
  esi_number: z.string().optional(),
  designation: z.string().default("General Laborer"),
  contact_number: z.string().optional(),
  emergency_contact: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().nullable().optional(),
  joining_date: z.string(),
  training_records: z.any().optional(),
  status: z.enum(["active", "inactive", "terminated"]).default("active"),
}) satisfies z.ZodType<Omit<Labor, "id" | "created_at" | "updated_at">>;

export const designationSchema = z.object({
  designation: z.string().min(1, "Designation is required"),
});
