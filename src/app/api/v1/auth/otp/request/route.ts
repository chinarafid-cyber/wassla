import { NextResponse } from "next/server";
import { otpRequestSchema } from "@/features/auth/schemas/otp.schema";
import { requestOtp } from "@/features/auth/services/otp.service";
import { getRequestDevice } from "@/lib/device";
import { verifyCsrfToken } from "@/lib/csrf";

export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = otpRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid phone number" },
      { status: 400 },
    );
  }

  const { ipAddress } = getRequestDevice(request);
  const result = await requestOtp(parsed.data.phone, ipAddress);

  switch (result.status) {
    case "sent":
      return NextResponse.json({ status: "sent", expiresInSeconds: result.expiresInSeconds });
    case "cooldown":
      return NextResponse.json(
        {
          error: "Please wait before requesting another code",
          retryAfterSeconds: result.retryAfterSeconds,
        },
        { status: 429 },
      );
    case "rate_limited":
      return NextResponse.json(
        { error: "Too many requests — try again later" },
        { status: 429 },
      );
    case "send_failed":
      return NextResponse.json(
        { error: "Failed to send verification code — try again shortly" },
        { status: 502 },
      );
  }
}
