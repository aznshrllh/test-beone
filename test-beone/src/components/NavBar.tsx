"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import LogoutButton from "./logoutButton";
import { User, ShoppingCart, Package, Users } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

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
  const [, setAuthDebug] = useState("");
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

  // Simplified empty state rendering during SSR
  if (!isMounted) {
    return (
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <div className="font-bold text-xl">BeOne Shop</div>
          <div className="flex items-center gap-6">
            <div className="h-10 w-32"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">
        {/* Logo/Brand */}
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          BeOne Shop
        </Link>

        {/* Main Navigation */}
        <div className="flex items-center gap-6">
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/products" legacyBehavior passHref>
                    <NavigationMenuLink className="text-white bg-transparent hover:bg-primary-foreground/10">
                      Products
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {auth.isLoggedIn && (
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-white bg-transparent hover:bg-primary-foreground/10">
                        Account
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[250px] gap-3 p-4">
                          <MenuItem
                            href="/cart"
                            title="Shopping Cart"
                            description="View your cart and checkout"
                            icon={<ShoppingCart className="h-4 w-4" />}
                          />
                          <MenuItem
                            href="/profile"
                            title="My Profile"
                            description="Manage your account details"
                            icon={<User className="h-4 w-4" />}
                          />
                          <MenuItem
                            href="/orders"
                            title="Order History"
                            description="View your past orders"
                            icon={<Package className="h-4 w-4" />}
                          />
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    {auth.role === "admin" && (
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="text-white bg-transparent hover:bg-primary-foreground/10">
                          Admin
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[250px] gap-3 p-4 ">
                            <MenuItem
                              href="/admin/manage-products"
                              title="Manage Products"
                              description="Add, edit or remove products"
                              icon={<Package className="h-4 w-4" />}
                            />
                            <MenuItem
                              href="/admin/manage-users"
                              title="Manage Users"
                              description="View and manage user accounts"
                              icon={<Users className="h-4 w-4" />}
                            />
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    )}
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
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
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden container mx-auto pb-2 px-4 flex justify-center">
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
            <Link href="/admin/dashboard" className="text-sm font-medium">
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// Simplified menu item component
// Simplified menu item component
function MenuItem({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors bg-secondary/10 hover:bg-secondary hover:text-secondary-foreground focus:bg-secondary focus:text-secondary-foreground"
      >
        <div className="text-sm font-medium leading-none mb-1">{title}</div>
        <div className="flex items-center gap-2 line-clamp-2 text-sm leading-snug text-muted-foreground">
          {icon}
          {description}
        </div>
      </Link>
    </li>
  );
}
