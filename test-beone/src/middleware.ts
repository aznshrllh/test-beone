import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenJose } from "./helpers/jwt";
import errorHandler from "./helpers/errorHandler";
import { AppError } from "./types";

export async function middleware(request: NextRequest) {
  try {
    // Pub routes
    const publicPaths = [
      "/api/public/:path*",
      "/api/bridge/login",
      "/api/bridge/register",
    ];

    // Cek apakah rute saat ini adalah rute publik
    const isPublicPath = publicPaths.some((path) => {
      const pathPattern = new RegExp(
        `^${path.replace(/\*/g, ".*").replace(/:\w+/g, "[^/]+")}$`
      );
      return pathPattern.test(request.nextUrl.pathname);
    });

    // Jika rute publik, izinkan akses tanpa autentikasi
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Untuk rute terproteksi, periksa token autentikasi
    const cookieStore = await cookies();
    const authorization = cookieStore.get("authorization")?.value;

    if (!authorization) {
      // Jika tidak ada token dan rute memerlukan autentikasi
      if (request.nextUrl.pathname.startsWith("/api/")) {
        // Return 401 untuk API calls
        return new Response(
          JSON.stringify({ message: "Unauthorized: Authentication required" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    //Validasi token
    const token = authorization?.split(" ")[1];

    if (!token) {
      return new Response(
        JSON.stringify({ message: "Unauthorized: Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const decoded = await verifyTokenJose<{
      email: string;
      role: string;
      _id: string;
    }>(token);

    if (!decoded) {
      return new Response(
        JSON.stringify({ message: "Unauthorized: Invalid token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Tambahkan header user untuk akses di API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded._id);
    requestHeaders.set("x-user-email", decoded.email);
    requestHeaders.set("x-user-role", decoded.role);

    // Lanjutkan dengan request yang sudah diverifikasi
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware error:", error);
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return errorHandler(error as AppError);
    }

    // Jika bukan API request, redirect ke halaman login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    // User routes (protected)
    "/api/user/:path*",

    // Auth routes (mixed - login/register are public, user info is protected)
    "/api/auth/:path*",

    // Public routes (no protection needed but still processed by middleware)
    "/api/public/:path*",
  ],
};
