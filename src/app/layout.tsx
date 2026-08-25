import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mathlearn.app"),
  title: {
    default: "MathLearn - Structured Math Courses for K-12",
    template: "%s | MathLearn",
  },
  description: "Learn math with structured courses, interactive lessons, practice problems, and visualizations. Aligned to Common Core standards for grades K-12.",
  keywords: ["math", "education", "k12", "learning", "algebra", "geometry", "calculus", "statistics", "online learning", "khan academy"],
  authors: [{ name: "MathLearn" }],
  creator: "MathLearn",
  publisher: "MathLearn",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mathlearn.app",
    siteName: "MathLearn",
    title: "MathLearn - Structured Math Courses for K-12",
    description: "Learn math with structured courses, interactive lessons, practice problems, and visualizations.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "MathLearn - Structured Math Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MathLearn - Structured Math Courses for K-12",
    description: "Learn math with structured courses, interactive lessons, practice problems, and visualizations.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1020" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://www.google.com" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
