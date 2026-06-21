import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

export async function POST(request: Request) {
  // CSRF / Origin Validation
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const originUrl = new URL(origin);
    const hostUrl = new URL(originUrl.protocol + "//" + host);
    if (originUrl.host !== hostUrl.host) {
      return NextResponse.json({ error: "Permintaan tidak diotorisasi" }, { status: 403 });
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
