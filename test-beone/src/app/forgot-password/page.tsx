"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate processing
    setTimeout(() => {
      setIsSubmitting(false);
      toast.info("This feature is still in development");
    }, 1000);
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Forgot Password
            </CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="mb-6 border-amber-500/50 text-amber-600 bg-amber-50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Development Notice</AlertTitle>
              <AlertDescription>
                The password reset feature is currently under development and
                will be available soon.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
