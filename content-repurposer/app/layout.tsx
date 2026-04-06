// app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { PremiumBadge } from "@/components/billing/premium-badge";
import Link from "next/link";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://architect.ai"),
  title: {
    default: "Resume Architect AI | 2026 ATS Optimization",
    template: "%s | Resume Architect AI",
  },
  description: "Transform your resume using AI-powered ATS optimization. Audit flaws, inject keywords, and land 5x more callbacks.",
  keywords: ["resume", "ATS optimization", "career", "job search", "AI"],
  authors: [{ name: "Resume Architect AI" }],
  creator: "Resume Architect AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://architect.ai",
    title: "Resume Architect AI | 2026 ATS Optimization",
    description: "Transform your resume using AI-powered ATS optimization.",
    siteName: "Resume Architect AI",
    images: [
      {
        url: "https://architect.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "Resume Architect AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Architect AI | 2026 ATS Optimization",
    description: "Transform your resume using AI-powered ATS optimization.",
    images: ["https://architect.ai/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html 
        lang="en" 
        className="scroll-smooth"
        suppressHydrationWarning
      >
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body 
          className={`${manrope.variable} ${jetbrains.variable} font-sans antialiased bg-slate-50 text-slate-900 text-base leading-relaxed`}
        >
          <div className="flex flex-col min-h-screen pb-24">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
            >
              Skip to main content
            </a>
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
              <div className="max-w-7xl mx-auto px-4 h-18 md:h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href="/" className="flex items-center gap-4 text-slate-900">
                    <span className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-base font-bold">
                      RA
                    </span>
                    <div className="leading-tight">
                      <div className="text-base font-semibold">Resume Architect</div>
                      <div className="text-sm text-slate-500">Career OS</div>
                    </div>
                  </Link>
                  <SignedIn>
                    <PremiumBadge />
                  </SignedIn>
                </div>
                <nav className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-base text-slate-600">
                  <Link href="/dashboard" className="rounded-full px-4 py-2 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20">
                    Dashboard
                  </Link>
                  <Link href="/resume-lab" className="rounded-full px-4 py-2 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20">
                    Resume Lab
                  </Link>
                  <Link href="/jobs" className="rounded-full px-4 py-2 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20">
                    Jobs
                  </Link>
                  <Link href="/pricing" className="rounded-full px-4 py-2 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20">
                    Pricing
                  </Link>
                </nav>
                <div className="flex items-center gap-3">
                  <SignedOut>
                    <Link
                      href="/auth/login"
                      className="rounded-md border border-slate-200 px-4 py-2 text-base font-semibold text-slate-700 hover:text-slate-900"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="rounded-md bg-slate-900 px-4 py-2 text-base font-semibold text-white hover:bg-slate-800"
                    >
                      Get started
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/pricing"
                      className="rounded-md border border-slate-200 px-4 py-2 text-base font-semibold text-slate-700 hover:text-slate-900"
                    >
                      Manage plan
                    </Link>
                    <SignOutButton redirectUrl="/">
                      <button className="rounded-md bg-slate-900 px-4 py-2 text-base font-semibold text-white hover:bg-slate-800">
                        Logout
                      </button>
                    </SignOutButton>
                  </SignedIn>
                </div>
              </div>
            </header>
            <main id="main-content" className="flex-1 pt-4">
              {children}
            </main>
            <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                      Resume Architect
                    </div>
                    <p className="text-sm text-slate-600">
                      AI-powered resume optimization for modern careers.
                    </p>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Product</div>
                    <Link href="/dashboard" className="block hover:text-slate-900">Dashboard</Link>
                    <Link href="/resume-lab" className="block hover:text-slate-900">Resume Lab</Link>
                    <Link href="/jobs" className="block hover:text-slate-900">Jobs</Link>
                    <Link href="/pricing" className="block hover:text-slate-900">Pricing</Link>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Company</div>
                    <Link href="/about" className="block hover:text-slate-900">About</Link>
                    <Link href="/careers" className="block hover:text-slate-900">Careers</Link>
                    <Link href="/contact" className="block hover:text-slate-900">Contact</Link>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Legal</div>
                    <Link href="/privacy" className="block hover:text-slate-900">Privacy</Link>
                    <Link href="/terms" className="block hover:text-slate-900">Terms</Link>
                    <Link href="/security" className="block hover:text-slate-900">Security</Link>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm uppercase tracking-[0.25em] text-slate-400 md:flex-row md:items-center md:justify-between">
                  <span>© {new Date().getFullYear()} Resume Architect. All rights reserved.</span>
                  <div className="flex items-center gap-4">
                    <Link href="/privacy" className="hover:text-slate-700">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-slate-700">Terms of Service</Link>
                    <Link href="/status" className="hover:text-slate-700">Status</Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
