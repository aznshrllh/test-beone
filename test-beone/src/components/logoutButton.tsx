"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandleLogout } from "@/actions";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
  onLogoutSuccess?: () => void;
}

export default function LogoutButton({
  variant = "ghost",
  size = "default",
  showText = true,
  onLogoutSuccess,
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const result = await HandleLogout();

      if (result.success) {
        // Close the dialog
        setOpen(false);

        // Dispatch a custom event that can be caught by other components
        window.dispatchEvent(new Event("app:logout"));

        // Clear the auth cookie from document.cookie
        document.cookie =
          "authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Call the onLogoutSuccess callback if provided
        if (onLogoutSuccess) {
          onLogoutSuccess();
        }

        // Finally redirect to login page
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size}>
          <LogOut className={`h-4 w-4 ${showText ? "mr-2" : ""}`} />
          {showText && "Logout"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be logged out of your account. You can log back in anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log out"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
