"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, Terminal, ArrowRight } from "lucide-react";

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
      await signIn("credentials", {
        email: "demo@mathitout.app",
        password: "demopass",
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch {
      setError("Demo login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-zinc-800/60 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4f000] animate-pulse" />
            all systems operational
          </span>
          <span>no card · no catch</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-8 h-8 bg-[#c4f000] flex items-center justify-center">
              <span className="text-black font-bold">m</span>
            </div>
            <span className="font-semibold text-lg">mathitout</span>
          </Link>

          {/* Card */}
          <div className="border border-zinc-800 bg-[#0d0d0d]">
            <div className="px-6 py-5 border-b border-zinc-800">
              <div className="text-xs text-zinc-600 mb-1">// auth</div>
              <h1 className="text-2xl font-bold tracking-tight">sign in</h1>
              <p className="text-sm text-zinc-500 mt-1">pick a method. takes 5 seconds.</p>
            </div>

            <div className="p-6 space-y-3">
              {error && (
                <div className="flex items-start gap-2 p-3 border border-red-900/50 bg-red-950/20 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="w-full h-11 border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900 hover:border-zinc-600"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                continue with google
              </Button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600">or</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <Button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full h-11 bg-[#c4f000] text-black hover:bg-[#b3d800] font-semibold"
              >
                continue as demo user
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-xs text-zinc-600 text-center pt-2">
                demo user: <code className="text-zinc-500">demo@mathitout.app</code> / <code className="text-zinc-500">demopass</code>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-zinc-500">
            don't have an account?{" "}
            <Link href="/auth/signup" className="text-[#c4f000] hover:underline">
              sign up
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-2 justify-center text-xs text-zinc-700">
            <Terminal className="h-3 w-3" />
            <span>by signing in you agree to our terms &amp; privacy policy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
