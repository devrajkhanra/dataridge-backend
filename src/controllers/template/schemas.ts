import { z } from "zod";

export const templateSchema = z.object({
  company_id: z.string().uuid(),
  template_name: z.string().min(1),
  table_name: z.string().min(1),
  columns: z.any(),
});
