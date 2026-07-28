import { NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/schemas/profile.schema";
import { loginUser } from "@/features/auth/services/auth.service";
import { toUserDTO } from "@/features/auth/types/auth.types";
import { getRequestDevice } from "@/lib/device";
import { verifyCsrfToken } from "@/lib/csrf";

export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const device = getRequestDevice(request);
  const result = await loginUser(parsed.data, device);

  switch (result.status) {
    case "logged_in":
      return NextResponse.json({ status: "logged_in", user: toUserDTO(result.user) });
    case "invalid_ticket":
      return NextResponse.json(
        { error: "Verification expired — verify your phone again" },
        { status: 401 },
      );
    case "not_registered":
      return NextResponse.json(
        { error: "No account found for this phone number" },
        { status: 404 },
      );
    case "account_suspended":
      return NextResponse.json({ error: "This account has been suspended" }, { status: 403 });
  }
}
