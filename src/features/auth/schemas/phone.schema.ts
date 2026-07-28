import { z } from "zod";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(isValidPhoneNumber, {
    message: "Enter a valid phone number in international format, e.g. +9665XXXXXXXX",
  })
  .transform((value) => parsePhoneNumber(value).number);
