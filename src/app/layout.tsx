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
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "MathLearn",
              "description": "Learn math with structured courses, interactive lessons, practice problems, and visualizations.",
              "url": "https://mathlearn.app",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
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
