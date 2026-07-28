import { z } from "zod";

export const registerSchema = z.object({
  verificationTicket: z.string().min(1, "Missing verification ticket"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
});

export const loginSchema = z.object({
  verificationTicket: z.string().min(1, "Missing verification ticket"),
});

/**
 * The complete-profile form only collects these two fields — the ticket is
 * carried in component state (from sessionStorage), never a visible input.
 * Validating it through this schema would fail every submit since no field
 * is bound to it.
 */
export const completeProfileFormSchema = registerSchema.omit({ verificationTicket: true });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CompleteProfileFormInput = z.infer<typeof completeProfileFormSchema>;
