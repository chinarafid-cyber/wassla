export const OTP_LENGTH = 6;
export const OTP_EXPIRY_SECONDS = 120;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

/** Max OTP requests a single phone number may make within the window below. */
export const OTP_REQUEST_LIMIT_PER_PHONE = 5;
export const OTP_REQUEST_WINDOW_SECONDS = 60 * 60;

/** Max OTP requests a single IP may make within the window below. */
export const OTP_REQUEST_LIMIT_PER_IP = 20;
export const OTP_REQUEST_IP_WINDOW_SECONDS = 60 * 60;

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

/** How long a verified-phone ticket is valid for before /register or /login must be called. */
export const VERIFICATION_TICKET_TTL_SECONDS = 5 * 60;
