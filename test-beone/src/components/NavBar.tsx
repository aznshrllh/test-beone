"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LogoutButton from "./logoutButton";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // Extract cookie checking logic
  const checkCookies = useCallback(() => {
    try {
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
    setIsLoading(true);
    try {
      // Check cookies first
      const { hasAuth } = checkCookies();

      if (process.env.NODE_ENV === "development") {
        console.log("Auth cookie present:", hasAuth);
      }

      // Always try to fetch the profile, let the server handle auth
      const response = await fetch("/api/user/profile", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
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
  }, [checkCookies]);

  // Fetch authentication on mount and when storage changes
  useEffect(() => {
    checkAuth();

    // Cross-tab logout synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "logout") {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [checkAuth]);

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
            <Link href="/cart" className="hover:underline font-medium">
              Cart
            </Link>
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
              <LogoutButton variant="destructive" size="sm" showText={true} />
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
          <Link href="/cart" className="text-sm font-medium">
            Cart
          </Link>
        </div>
      </div>
    </nav>
  );
}
