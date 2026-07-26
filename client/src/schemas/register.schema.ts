// schemas/register.schema.ts

import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine(
    (data) => data.email?.trim() || data.phone?.trim(),
    {
      message: "Please enter an email or phone number.",
      path: ["email"],
    }
  );

export type RegisterFormData = z.infer<typeof registerSchema>;