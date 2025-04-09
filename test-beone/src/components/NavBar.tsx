"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LogoutButton from "./logoutButton";
import { User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface AuthState {
  isLoggedIn: boolean;
  userName: string;
  userEmail?: string;
  role?: string;
}

export default function NavBar() {
  const [auth, setAuth] = useState<AuthState>({
    isLoggedIn: false,
    userName: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [authDebug, setAuthDebug] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Mark component as mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract cookie checking logic
  const checkCookies = useCallback(() => {
    try {
      if (typeof document === "undefined")
        return { hasAuth: false, cookieValue: "", allCookies: {} };

      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      return {
        hasAuth: !!cookies.authorization,
        cookieValue: cookies.authorization || "",
        allCookies: cookies,
      };
    } catch (error) {
      console.error("Cookie check error:", error);
      return { hasAuth: false, cookieValue: "", allCookies: {} };
    }
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    if (!isMounted) return;

    setIsLoading(true);
    try {
      // Check cookies first
      const { hasAuth } = checkCookies();

      // If no auth cookie, don't even try to fetch the profile
      if (!hasAuth) {
        setAuth({
          isLoggedIn: false,
          userName: "",
        });
        setAuthDebug("No auth cookie");
        setIsLoading(false);
        return;
      }

      // If we have an auth cookie, try to fetch the profile
      const response = await fetch("/api/user/profile", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setAuth({
          isLoggedIn: true,
          userName:
            data.user?.name || data.user?.email?.split("@")[0] || "User",
          userEmail: data.user?.email,
          role: data.user?.role,
        });

        if (process.env.NODE_ENV === "development") {
          setAuthDebug(`Logged in as: ${data.user?.email || "Unknown"}`);
        }
      } else {
        // Clear any stale cookies if the server rejects the authentication
        if (response.status === 401 && typeof document !== "undefined") {
          document.cookie =
            "authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }

        setAuth({
          isLoggedIn: false,
          userName: "",
        });

        if (process.env.NODE_ENV === "development") {
          setAuthDebug("Not authenticated");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuth({
        isLoggedIn: false,
        userName: "",
      });

      if (process.env.NODE_ENV === "development") {
        setAuthDebug(`Error: ${error}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkCookies, isMounted]);

  // Custom event handler for logout
  useEffect(() => {
    if (!isMounted) return;

    // Define the event handler for logout
    const handleLogout = () => {
      console.log("Logout event detected");
      setAuth({
        isLoggedIn: false,
        userName: "",
      });
      // Manually clear the cookie
      if (typeof document !== "undefined") {
        document.cookie =
          "authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    };

    // Add event listener
    window.addEventListener("app:logout", handleLogout);

    // Cleanup
    return () => {
      window.removeEventListener("app:logout", handleLogout);
    };
  }, [isMounted]);

  // Fetch authentication on mount and when path changes
  useEffect(() => {
    if (isMounted) {
      checkAuth();
    }
  }, [checkAuth, pathname, isMounted]);

  // For development debugging
  const debugAuth = async () => {
    try {
      const { hasAuth, cookieValue, allCookies } = checkCookies();
      console.log("All cookies:", allCookies);

      toast.info(
        hasAuth
          ? `Auth cookie: ${decodeURIComponent(cookieValue).substring(
              0,
              25
            )}...`
          : "No auth cookie found"
      );

      await checkAuth();
    } catch (error) {
      toast.error(`Debug error: ${error}`);
    }
  };

  // Render only client-side content after mounting
  if (!isMounted) {
    return (
      <nav className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            BeOne Shop
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex space-x-6">
              <Link href="/products" className="hover:underline font-medium">
                Products
              </Link>
            </div>
            <div className="h-10 flex items-center animate-pulse">
              <div className="h-2.5 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        {/* Logo/Brand */}
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          BeOne Shop
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex space-x-6">
            <Link href="/products" className="hover:underline font-medium">
              Products
            </Link>

            {auth.isLoggedIn && (
              <>
                <Link href="/cart" className="hover:underline font-medium">
                  Cart
                </Link>
                <Link href="/profile" className="hover:underline font-medium">
                  Profile
                </Link>

                {auth.role === "admin" && (
                  <>
                    <Link
                      href="/admin/manage-products"
                      className="hover:underline font-medium"
                    >
                      Manage Products
                    </Link>
                    <Link
                      href="/admin/manage-users"
                      className="hover:underline font-medium"
                    >
                      Manage Users
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Authentication UI */}
          {isLoading ? (
            <div className="h-10 flex items-center animate-pulse">
              <div className="h-2.5 bg-gray-300 rounded w-24"></div>
            </div>
          ) : auth.isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{auth.userName}</span>
              </div>
              <LogoutButton
                variant="destructive"
                size="sm"
                showText={true}
                onLogoutSuccess={() => checkAuth()}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/login")}
                className="font-medium"
              >
                Login
              </Button>

              {process.env.NODE_ENV === "development" && (
                <div className="hidden md:flex gap-2 items-center ml-4">
                  <span className="text-xs opacity-70">{authDebug}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={debugAuth}
                    className="h-7 px-2 text-xs"
                  >
                    Debug
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden container mx-auto pb-2 px-4 flex justify-center">
        <div className="flex space-x-8">
          <Link href="/products" className="text-sm font-medium">
            Products
          </Link>

          {auth.isLoggedIn && (
            <>
              <Link href="/cart" className="text-sm font-medium">
                Cart
              </Link>
              <Link href="/profile" className="text-sm font-medium">
                Profile
              </Link>
            </>
          )}

          {auth.isLoggedIn && auth.role === "admin" && (
            <>
              <Link
                href="/admin/manage-products"
                className="text-sm font-medium"
              >
                Manage
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
