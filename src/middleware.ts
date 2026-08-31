import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "brm_session";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

async function roleFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE)?.value;
  const key = secret();
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = await roleFromRequest(req);

  const needsAuth =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/operator") ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/operator") ||
    pathname.startsWith("/api/client");

  if (!needsAuth) return NextResponse.next();

  if (!role) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      return NextResponse.rewrite(new URL("/403", req.url), { status: 403 });
    }
  }
  if (pathname.startsWith("/operator") || pathname.startsWith("/api/operator")) {
    if (role !== "operator" && role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      return NextResponse.rewrite(new URL("/403", req.url), { status: 403 });
    }
  }
  if (pathname.startsWith("/client") || pathname.startsWith("/api/client")) {
    if (role !== "client" && role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      return NextResponse.rewrite(new URL("/403", req.url), { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/operator",
    "/operator/:path*",
    "/client",
    "/client/:path*",
    "/api/admin/:path*",
    "/api/operator/:path*",
    "/api/client/:path*",
  ],
};
