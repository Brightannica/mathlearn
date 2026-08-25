"use client";

import { supabase } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  image?: string;
  grade?: string;
  role?: string;
  xp?: number;
  level?: number;
  streak?: number;
  longestStreak?: number;
  theme?: string;
};

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
    },
  });

  if (error) throw error;
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

export async function signUpWithPassword(email: string, password: string, metadata?: Record<string, string>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });

  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email || "",
    name: user.user_metadata?.name || user.user_metadata?.full_name,
    image: user.user_metadata?.picture || user.user_metadata?.avatar_url,
    grade: user.user_metadata?.grade,
    role: user.user_metadata?.role,
    xp: user.user_metadata?.xp,
    level: user.user_metadata?.level,
    streak: user.user_metadata?.streak,
    longestStreak: user.user_metadata?.longest_streak,
    theme: user.user_metadata?.theme,
  };
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
  });

  if (error) throw error;
}
