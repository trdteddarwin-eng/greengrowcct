import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";
import TrackingProvider from "@/components/TrackingProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "GreenGrow CCT — Cold Call Trainer",
  description: "AI-powered cold call practice tool for sales reps",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-gray-950 text-gray-50 font-[family-name:var(--font-inter)]">
        <AuthProvider>
          <TrackingProvider>
            <Header />
            <main className="pt-[3.5rem] lg:pt-0 lg:pl-60 min-h-screen">
              <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl">
                {children}
              </div>
            </main>
          </TrackingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
