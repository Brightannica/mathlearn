"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, Terminal, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  const validate = (fullName: string, email: string, password: string, confirmPassword: string) => {
    const errors: typeof fieldErrors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("fullName") as string) || "";
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";
    const confirmPassword = (formData.get("confirmPassword") as string) || "";

    const errors = validate(fullName, email, password, confirmPassword);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error || "Unable to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(async () => {
        await signIn("credentials", { email, password, callbackUrl: "/dashboard", redirect: true });
      }, 800);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to create account. Please try again.");
      setIsLoading(false);
    }
  };

  const isRegistered = searchParams.get("registered") === "true";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col">
      <div className="border-b border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4f000] animate-pulse" />
            all systems operational
          </span>
          <span>free forever · k–12</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-8 h-8 bg-[#c4f000] flex items-center justify-center">
              <span className="text-black font-bold">m</span>
            </div>
            <span className="font-semibold text-lg">mathitout</span>
          </Link>

          <div className="border border-zinc-800 bg-[#0d0d0d]">
            <div className="px-6 py-5 border-b border-zinc-800">
              <div className="text-xs text-zinc-600 mb-1">// new account</div>
              <h1 className="text-2xl font-bold tracking-tight">sign up</h1>
              <p className="text-sm text-zinc-500 mt-1">free. no card. no email confirmation theater.</p>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 p-3 border border-red-900/50 bg-red-950/20 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-red-300">{formError}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 p-3 border border-[#c4f000]/30 bg-[#c4f000]/5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#c4f000] shrink-0 mt-0.5" />
                  <span className="text-zinc-200">Account created. signing you in...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs text-zinc-400">name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="jane doe"
                    autoComplete="name"
                    disabled={isLoading || success}
                    className={`bg-[#0a0a0a] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 ${fieldErrors.fullName ? "border-red-500" : ""}`}
                  />
                  {fieldErrors.fullName && <p className="text-xs text-red-400">{fieldErrors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs text-zinc-400">email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading || success}
                    className={`bg-[#0a0a0a] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 ${fieldErrors.email ? "border-red-500" : ""}`}
                  />
                  {fieldErrors.email && <p className="text-xs text-red-400">{fieldErrors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs text-zinc-400">password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="min 8 chars"
                    autoComplete="new-password"
                    disabled={isLoading || success}
                    className={`bg-[#0a0a0a] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 ${fieldErrors.password ? "border-red-500" : ""}`}
                  />
                  {fieldErrors.password && <p className="text-xs text-red-400">{fieldErrors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs text-zinc-400">confirm</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="same as above"
                    autoComplete="new-password"
                    disabled={isLoading || success}
                    className={`bg-[#0a0a0a] border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-[#c4f000] focus-visible:ring-[#c4f000]/20 ${fieldErrors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  {fieldErrors.confirmPassword && <p className="text-xs text-red-400">{fieldErrors.confirmPassword}</p>}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full h-11 bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold mt-2"
                >
                  {isLoading || success ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      {success ? "signed in" : "creating..."}
                    </span>
                  ) : (
                    <>create account <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>

              <div className="flex items-center gap-2 justify-center text-xs text-zinc-600 pt-2">
                <Terminal className="h-3 w-3" />
                <span>COPPA compliant · safe for students</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-zinc-500">
            already have an account?{" "}
            <Link href="/auth/signin" className="text-[#c4f000] hover:underline">
              sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
