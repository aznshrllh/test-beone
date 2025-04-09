"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  loyaltyPoint: number;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.status === 401) {
          toast.error("Authentication required", {
            description: "Please login to view your profile",
            action: {
              label: "Login",
              onClick: () =>
                router.push(
                  `/login?returnUrl=${encodeURIComponent("/profile")}`
                ),
            },
          });
          setError(true);
          return;
        }

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        } else {
          toast.error("Failed to load profile", {
            description: data.message || "Please try again later",
          });
          setError(true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Error", {
          description: "An unexpected error occurred",
        });
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const generateAvatarUrl = (firstName: string) => {
    return `https://image.pollinations.ai/prompt/${firstName}?width=768&height=768&nologo=true`;
  };

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center pt-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold">Unable to load profile</h2>
              <p className="text-muted-foreground">
                Please login to view your profile information.
              </p>
              <Button onClick={() => router.push("/login")}>Go to Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {loading ? (
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ) : user ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={generateAvatarUrl(user.firstName)}
                  alt={`${user.firstName}'s avatar`}
                  fill
                  className="object-cover rounded-full border-4 border-primary/10"
                />
              </div>
              <h2 className="text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</h2>
              <Badge
                variant={user.role === "admin" ? "default" : "outline"}
                className="mt-1"
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>

              <div className="mt-6 w-full">
                <Card className="bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-1">
                        Loyalty Points
                      </p>
                      <p className="text-3xl font-bold">
                        {user.loyaltyPoint.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => router.push("/profile/edit")}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Username
                </h3>
                <p>{user.username}</p>
              </div>
              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Email Address
                </h3>
                <p>{user.email}</p>
              </div>
              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Phone Number
                </h3>
                <p>{user.phoneNumber}</p>
              </div>
              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Account ID
                </h3>
                <p className="text-muted-foreground text-sm font-mono">
                  {user._id}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => router.push("/orders")}>
                Order History
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/profile/change-password")}
              >
                Change Password
              </Button>
              {user.role === "admin" && (
                <Button variant="outline" onClick={() => router.push("/admin")}>
                  Admin Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p>No profile information found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
