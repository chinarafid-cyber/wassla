import { NextResponse } from "next/server";
import { otpVerifySchema } from "@/features/auth/schemas/otp.schema";
import { verifyOtp } from "@/features/auth/services/otp.service";
import { getRequestDevice } from "@/lib/device";
import { verifyCsrfToken } from "@/lib/csrf";

export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid phone number or code" },
      { status: 400 },
    );
  }

  const { ipAddress } = getRequestDevice(request);
  const result = await verifyOtp(parsed.data.phone, parsed.data.code, ipAddress);

  switch (result.status) {
    case "verified":
      return NextResponse.json({
        status: "verified",
        ticket: result.ticket,
        isNewUser: result.isNewUser,
      });
    case "invalid_code":
      return NextResponse.json(
        { error: "Incorrect code", attemptsRemaining: result.attemptsRemaining },
        { status: 400 },
      );
    case "too_many_attempts":
      return NextResponse.json(
        { error: "Too many attempts — request a new code" },
        { status: 429 },
      );
    case "not_found":
      return NextResponse.json(
        { error: "Code expired or not found — request a new one" },
        { status: 400 },
      );
  }
}
