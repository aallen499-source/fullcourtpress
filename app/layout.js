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

export const metadata = {
  title: "RecruitGrid",
  description: "Recruiting tools for student-athletes.",
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
