import "server-only";
import type { SmsProvider } from "./types";

/** Calls the Twilio REST API directly over fetch — no SDK dependency needed. */
export class TwilioSmsProvider implements SmsProvider {
  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly fromNumber: string,
  ) {}

  async send(to: string, message: string): Promise<void> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
    const body = new URLSearchParams({ To: to, From: this.fromNumber, Body: message });
    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
      "base64",
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Twilio SMS send failed (${response.status}): ${errorBody}`);
    }
  }
}
