import { NextResponse } from "next/server";
import { registerSchema } from "@/features/auth/schemas/profile.schema";
import { registerUser } from "@/features/auth/services/auth.service";
import { toUserDTO } from "@/features/auth/types/auth.types";
import { getRequestDevice } from "@/lib/device";
import { verifyCsrfToken } from "@/lib/csrf";

export async function POST(request: Request) {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const device = getRequestDevice(request);
  const result = await registerUser(parsed.data, device);

  switch (result.status) {
    case "registered":
      return NextResponse.json({ status: "registered", user: toUserDTO(result.user) });
    case "invalid_ticket":
      return NextResponse.json(
        { error: "Verification expired — verify your phone again" },
        { status: 401 },
      );
    case "already_registered":
      return NextResponse.json(
        { error: "This phone number is already registered — please log in" },
        { status: 409 },
      );
  }
}
