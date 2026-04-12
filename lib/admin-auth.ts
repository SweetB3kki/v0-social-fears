import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

const ADMIN_LOGIN = process.env.ADMIN_LOGIN ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "local-admin-session-secret";

function buildSessionToken(): string {
  return createHash("sha256")
    .update(`${ADMIN_LOGIN}:${ADMIN_PASSWORD}:${ADMIN_SESSION_SECRET}`)
    .digest("hex");
}

export function validateAdminCredentials(login: string, password: string): boolean {
  return login === ADMIN_LOGIN && password === ADMIN_PASSWORD;
}

export function getAdminSessionToken(): string {
  return buildSessionToken();
}

export function isValidAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = buildSessionToken();
  const left = Buffer.from(token);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

export function isAdminAuthenticated(cookieStore: CookieStoreLike): boolean {
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSessionToken(token);
}
