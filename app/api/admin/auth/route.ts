import { type NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  getAdminSessionToken,
  isValidAdminSessionToken,
  validateAdminCredentials,
} from "@/lib/admin-auth";

type AuthPayload = {
  login?: string;
  password?: string;
};

function json(payload: unknown, status = 200): NextResponse {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return json({ authenticated: isValidAdminSessionToken(token) });
}

export async function POST(request: NextRequest) {
  let payload: AuthPayload;
  try {
    payload = (await request.json()) as AuthPayload;
  } catch {
    return json({ error: "Invalid payload" }, 400);
  }

  const login = payload.login ?? "";
  const password = payload.password ?? "";

  if (!validateAdminCredentials(login, password)) {
    return json({ error: "Invalid login or password" }, 401);
  }

  const response = json({ authenticated: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: getAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = json({ authenticated: false });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
