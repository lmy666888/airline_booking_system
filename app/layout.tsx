import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dairy Flat Airways | Online bookings",
  description:
    "Book luxury point-to-point flights from Dairy Flat Airport (NZNE) with Dairy Flat Airways.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NZ" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg"
        >
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content" className="flex-1">
          {children}
        </div>
        <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-slate-500">
          <p>Dairy Flat Airways · NZNE hub · 159.352 coursework demo</p>
        </footer>
      </body>
    </html>
  );
}
