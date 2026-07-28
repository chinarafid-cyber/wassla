import "server-only";
import { UAParser } from "ua-parser-js";

export interface RequestDevice {
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
}

export function getRequestDevice(request: Request): RequestDevice {
  const userAgent = request.headers.get("user-agent");

  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  let deviceName: string | null = null;
  if (userAgent) {
    const { browser, os } = new UAParser(userAgent).getResult();
    deviceName = [browser.name, os.name].filter(Boolean).join(" on ") || null;
  }

  return { ipAddress, userAgent, deviceName };
}
