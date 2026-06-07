import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const SESSION_HOURS = 12;

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "change-me-in-production"
  );
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function verifyAdminPassword(password: string) {
  const expected = getAdminPassword();
  if (!expected) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function signSession(expiresAt: number) {
  const sig = createHmac("sha256", getSessionSecret())
    .update(String(expiresAt))
    .digest("hex");
  return `${expiresAt}.${sig}`;
}

function verifySessionToken(token: string) {
  const [expiresRaw, sig] = token.split(".");
  const expiresAt = Number(expiresRaw);
  if (!expiresRaw || !sig || Number.isNaN(expiresAt)) return false;
  if (Date.now() > expiresAt) return false;

  const expected = createHmac("sha256", getSessionSecret())
    .update(String(expiresAt))
    .digest("hex");

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminSessionToken() {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  return signSession(expiresAt);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export function adminSessionCookieOptions(token: string) {
  const expiresAt = Number(token.split(".")[0]);
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: new Date(expiresAt),
  };
}

export function clearAdminSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
