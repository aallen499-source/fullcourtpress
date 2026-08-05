import { Anton, JetBrains_Mono, Inter } from "next/font/google";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const anton = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-fcp",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// metadataBase makes the relative og image resolve to an absolute URL, which
// every scraper requires — a relative path silently yields no preview image.
export const metadata = {
  metadataBase: new URL("https://recruitgrid.app"),
  title: "RecruitGrid",
  description:
    "A recruiting workspace for high school athletes. Verified camps across six sports, college programs at every division, coach outreach, film, and follow-ups in one place.",
  openGraph: {
    title: "RecruitGrid",
    description:
      "Verified camps, college programs at every division, coach outreach and film — one place to run your recruiting.",
    url: "https://recruitgrid.app",
    siteName: "RecruitGrid",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "RecruitGrid" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RecruitGrid",
    description:
      "Verified camps, college programs at every division, coach outreach and film — one place to run your recruiting.",
    images: ["/og.png"],
  },
  // iOS does not read the web manifest for Add to Home Screen; it takes the
  // name and status bar treatment from these. app/manifest.js covers Android.
  appleWebApp: {
    capable: true,
    title: "RecruitGrid",
    statusBarStyle: "black-translucent",
  },
};

// themeColor lives on the viewport export in Next 14+, not on metadata —
// putting it on metadata builds fine but silently emits nothing.
export const viewport = {
  themeColor: "#17181A",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${jetbrainsMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="site-footer">
          <Link href="/about">About</Link>
          <span aria-hidden="true">·</span>
          <Link href="/privacy">Privacy Policy</Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms">Terms of Service</Link>
          <span aria-hidden="true">·</span>
          <a href="mailto:info@recruitgrid.app">info@recruitgrid.app</a>
        </footer>
        {/* Cookieless page-view counting. Deliberately not Google Analytics:
            this site collects names, GPAs and film from minors, and a
            cookie-based profiler would mean rewriting the privacy policy and
            probably adding a consent banner. This stores nothing that
            identifies a person. */}
        <Analytics />
      </body>
    </html>
  );
}
