import { z } from "zod";
import { phoneSchema } from "./phone.schema";
import { OTP_LENGTH } from "@/config/constants";

export const otpRequestSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  code: z
    .string()
    .length(OTP_LENGTH, `Code must be ${OTP_LENGTH} digits`)
    .regex(/^\d+$/, "Code must be numeric"),
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
