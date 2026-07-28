import "server-only";
import { env } from "@/lib/env";
import { ConsoleSmsProvider } from "./console-provider";
import { TwilioSmsProvider } from "./twilio-provider";
import type { SmsProvider } from "./types";

function createSmsProvider(): SmsProvider {
  if (env.SMS_PROVIDER === "twilio") {
    // env.ts already guarantees these are set together with SMS_PROVIDER=twilio.
    return new TwilioSmsProvider(
      env.TWILIO_ACCOUNT_SID!,
      env.TWILIO_AUTH_TOKEN!,
      env.TWILIO_FROM_NUMBER!,
    );
  }
  return new ConsoleSmsProvider();
}

export const smsProvider: SmsProvider = createSmsProvider();
export type { SmsProvider };
