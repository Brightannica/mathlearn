import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import NextAuth from "next-auth";
import { env } from "./env";

const DEMO_USER = {
  id: "demo-user-001",
  email: env.NEXT_PUBLIC_DEMO_EMAIL || "demo@mathlearn.app",
  name: "Demo User",
  image: null,
  grade: "9",
  role: "STUDENT",
  xp: 3180,
  level: 7,
  streak: 7,
  longestStreak: 12,
  theme: "system",
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    ...(process.env.NODE_ENV !== "production"
      ? [
          CredentialsProvider({
            name: "Demo",
            credentials: {
              email: { label: "Email", type: "email", placeholder: "demo@mathlearn.app" },
              password: { label: "Password", type: "password", placeholder: "••••••••" },
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) {
                return null;
              }

              const demoEmail = env.NEXT_PUBLIC_DEMO_EMAIL || "demo@mathlearn.app";
              const demoPassword = env.NEXT_PUBLIC_DEMO_PASSWORD || "";

              if (credentials.email === demoEmail && credentials.password === demoPassword) {
                try {
                  const existingUser = await prisma.user.findUnique({
                    where: { email: demoEmail },
                  });

                  if (existingUser) {
                    return {
                      id: existingUser.id,
                      email: existingUser.email,
                      name: existingUser.name || "Demo User",
                      image: existingUser.image || null,
                    };
                  }

                  const user = await prisma.user.create({
                    data: {
                      email: demoEmail,
                      name: "Demo User",
                      role: "STUDENT",
                      xp: 3180,
                      level: 7,
                      streak: 7,
                      longestStreak: 12,
                    },
                  });

                  return {
                    id: user.id,
                    email: user.email,
                    name: user.name || "Demo User",
                    image: user.image || null,
                  };
                } catch {
                  return {
                    id: DEMO_USER.id,
                    email: DEMO_USER.email,
                    name: DEMO_USER.name,
                    image: DEMO_USER.image,
                  };
                }
              }

              return null;
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (existingUser) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              },
            });
          }
        } catch {
          // Database not available, continue with sign-in
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              grade: true,
              role: true,
              xp: true,
              level: true,
              streak: true,
              longestStreak: true,
              theme: true,
            },
          });
          if (dbUser) {
            session.user.grade = dbUser.grade;
            session.user.role = dbUser.role;
            session.user.xp = dbUser.xp;
            session.user.level = dbUser.level;
            session.user.streak = dbUser.streak;
            session.user.longestStreak = dbUser.longestStreak;
            session.user.theme = dbUser.theme;
          } else if (token.id === DEMO_USER.id) {
            session.user.grade = DEMO_USER.grade;
            session.user.role = DEMO_USER.role;
            session.user.xp = DEMO_USER.xp;
            session.user.level = DEMO_USER.level;
            session.user.streak = DEMO_USER.streak;
            session.user.longestStreak = DEMO_USER.longestStreak;
            session.user.theme = DEMO_USER.theme;
          }
        } catch {
          if (token.id === DEMO_USER.id) {
            session.user.grade = DEMO_USER.grade;
            session.user.role = DEMO_USER.role;
            session.user.xp = DEMO_USER.xp;
            session.user.level = DEMO_USER.level;
            session.user.streak = DEMO_USER.streak;
            session.user.longestStreak = DEMO_USER.longestStreak;
            session.user.theme = DEMO_USER.theme;
          }
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const auth = NextAuth(authOptions);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      grade?: string | null;
      role?: string;
      xp?: number;
      level?: number;
      streak?: number;
      longestStreak?: number;
      theme?: string;
    };
  }

  interface User {
    grade?: string | null;
    role?: string;
    xp?: number;
    level?: number;
    streak?: number;
    longestStreak?: number;
    theme?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
  }
}
