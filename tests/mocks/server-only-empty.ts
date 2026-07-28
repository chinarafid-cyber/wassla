// `server-only` throws when resolved via its default export condition,
// which is what Vite/Vitest use (it only resolves to a no-op under
// Next.js's own "react-server" build condition). Unit tests alias the
// real package to this empty stub instead of enabling that condition
// globally, which would also change how React/Next itself resolves.
export {};
