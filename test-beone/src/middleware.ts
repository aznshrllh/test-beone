import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenJose } from "./helpers/jwt";
import errorHandler from "./helpers/errorHandler";
import { AppError } from "./types";

export async function middleware(request: NextRequest) {
  try {
    // Pub routes yang tidak memerlukan autentikasi
    const publicPaths = [
      "/api/public/:path*",
      "/api/bridge/login",
      "/api/bridge/register",
    ];

    // Rute yang memerlukan role admin
    const adminOnlyPaths = [
      "/api/products",
      "/api/products/:path*",
      "/api/users",
      "/api/users/:path*",
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

    // Validasi token
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

    // Verifikasi akses admin jika diperlukan
    const isAdminOnlyPath = adminOnlyPaths.some((path) => {
      const pathPattern = new RegExp(
        `^${path.replace(/\*/g, ".*").replace(/:\w+/g, "[^/]+")}$`
      );
      return pathPattern.test(request.nextUrl.pathname);
    });

    // Jika rute memerlukan admin dan user bukan admin, tolak akses
    if (isAdminOnlyPath && decoded.role !== "admin") {
      return new Response(
        JSON.stringify({
          message: "Forbidden: Admin access required",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
    // Admin routes (hanya untuk admin)
    "/api/products",
    "/api/products/:path*",
    "/api/users",
    "/api/users/:path*",

    // User routes (untuk semua user terautentikasi)
    "/api/user/:path*",
    "/api/user/cart",
    "/api/user/transaction",
    "/api/user/products",

    // Auth routes (mixed - login/register are public, user info is protected)
    "/api/bridge/:path*",

    // Public routes (no protection needed but still processed by middleware)
    "/api/public/:path*",
  ],
};
