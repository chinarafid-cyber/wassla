import "server-only";
import type { SmsProvider } from "./types";

/**
 * Dev-only fallback: logs instead of sending. `env.ts` refuses to start with
 * SMS_PROVIDER=console when NODE_ENV=production, so this can never be the
 * live provider by accident.
 */
export class ConsoleSmsProvider implements SmsProvider {
  async send(to: string, message: string): Promise<void> {
    console.log(`[sms:console] to=${to} message="${message}"`);
  }
}
