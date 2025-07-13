import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  roles: z.array(z.string()).optional(),
});
