"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 mb-4">
            <AlertCircle className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground mt-2">
            Something went wrong during sign-in. This usually means Google OAuth isn&apos;t configured yet.
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">You have two options:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Set up Google OAuth credentials in your <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.env</code> file</li>
                <li>Use demo mode to explore the app without signing in</li>
              </ol>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Demo credentials:</strong><br />
                Email: demo@mathitout.app<br />
                Password: demopass
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button asChild>
                <Link href="/auth/signin">Try Again</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Continue as Demo User</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Check the setup guide in the repository.
          </p>
        </div>
      </div>
    </div>
  );
}
