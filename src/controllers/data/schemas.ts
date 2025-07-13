import { z } from "zod";

export const dataSchema = z.object({
  content: z.any(), // Flexible schema for dynamic data
});
