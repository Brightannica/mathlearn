import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mathitout.app"),
  title: {
    default: "mathitout — figure it out, properly",
    template: "%s | mathitout",
  },
  description: "A no-BS math practice app. Solve real problems, track what you actually struggle with, and get better. No gamification theater.",
  keywords: ["math", "education", "k12", "learning", "algebra", "geometry", "calculus", "statistics", "practice", "problem solving"],
  authors: [{ name: "mathitout" }],
  creator: "mathitout",
  publisher: "mathitout",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mathitout.app",
    siteName: "mathitout",
    title: "mathitout — figure it out, properly",
    description: "A no-BS math practice app. Solve real problems, track what you actually struggle with, and get better.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "mathitout — math practice that works",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mathitout — figure it out, properly",
    description: "A no-BS math practice app. Solve real problems, track what you actually struggle with, and get better.",
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
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mathitout-theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "mathitout",
              "description": "A practice-first math app. Pick a topic, get a problem, write your working, get it checked.",
              "url": "https://mathitout.app",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
