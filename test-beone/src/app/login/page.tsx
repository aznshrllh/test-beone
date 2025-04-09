"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandleLogin } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = { email, password };
      const result = await HandleLogin(form);

      if (result.success) {
        toast.success("Login berhasil", {
          description: "Redirecting to dashboard...",
        });

        // Redirect to dashboard after successful login
        router.push("/cart");
      } else {
        toast.error("Login gagal", {
          description: result.message || "Email atau password tidak valid",
        });
      }
    } catch (error) {
      toast.error("Login gagal", {
        description: "Terjadi kesalahan saat memproses permintaan",
      });
      console.error("Login error", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo dan branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BeOne App</h1>
          <p className="text-gray-600">Selamat datang kembali!</p>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold">Login</CardTitle>
            <CardDescription>
              Masuk ke akun Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-6 pt-4 pb-6">
              <Button
                className="w-full bg-gray-900 hover:bg-black text-white py-2 h-11 font-medium transition-colors"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses
                  </>
                ) : (
                  "Login"
                )}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Belum memiliki akun?{" "}
                <Link
                  href="/register"
                  className="text-gray-800 hover:text-black hover:underline transition-colors font-medium"
                >
                  Daftar
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
