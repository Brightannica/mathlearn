"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

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
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = (formData.get("fullName") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

    if (!validate(fullName, email, password, confirmPassword)) return;

    setIsLoading(true);
    try {
      await signIn("credentials", {
        email,
        password,
        name: fullName,
        redirect: false,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin?registered=true");
      }, 1500);
    } catch {
      setFormError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const isRegistered = searchParams.get("registered") === "true";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-3 shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to MathLearn</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Create your account and start learning</p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-base">Sign Up</CardTitle>
            <CardDescription className="text-center text-xs">Fill in the details below to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2.5 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300">{formError}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2.5 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 dark:text-green-300">Account created! Redirecting you to sign in...</p>
              </div>
            )}

            {isRegistered && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-2.5 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700 dark:text-green-300">Registration successful! Please sign in with your new account.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  disabled={isLoading || success}
                  className={fieldErrors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">{fieldErrors.fullName}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading || success}
                  className={fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={isLoading || success}
                  className={fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {fieldErrors.password && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  disabled={isLoading || success}
                  className={fieldErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-red-600 dark:text-red-400">{fieldErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-sm mt-3"
                disabled={isLoading || success}
              >
                {isLoading || success ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {success ? "Account created!" : "Creating account..."}
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="rounded-lg border p-2.5">
                <CheckCircle2 className="h-4 w-4 mx-auto text-green-500 mb-1" />
                <p className="text-[11px] text-muted-foreground">COPPA Compliant</p>
              </div>
              <div className="rounded-lg border p-2.5">
                <Sparkles className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-[11px] text-muted-foreground">Interactive Learning</p>
              </div>
            </div>

            <p className="text-[11px] text-center text-muted-foreground">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>

            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <a href="/auth/signin" className="text-primary underline underline-offset-2 hover:text-primary/80">
                Sign in
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="mt-5 text-center">
          <p className="text-xs text-muted-foreground">
            Start learning math today with structured courses and practice
          </p>
        </div>
      </div>
    </div>
  );
}

