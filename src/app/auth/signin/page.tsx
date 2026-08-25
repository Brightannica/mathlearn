"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Unable to start Google sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email: "demo@mathlearn.app",
        password: "demopass",
        callbackUrl: "/dashboard",
        redirect: true,
      });
      if (result?.error) {
        setError("Demo login failed. Please try again.");
        setIsLoading(false);
      }
    } catch {
      setError("Demo login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-3 shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to MathLearn</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Sign in to start your math journey</p>
        </div>

        <Card className="border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-base">Sign In</CardTitle>
            <CardDescription className="text-center text-xs">Choose a sign-in method below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2.5 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full h-10 text-sm"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              className="w-full h-10 text-sm"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Continue as Demo User
                </>
              )}
            </Button>

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
              By signing in, you agree to our Terms of Service and Privacy Policy.
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
