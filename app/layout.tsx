import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BackgroundFX from "@/components/BackgroundFX";

export const metadata: Metadata = {
  title: "AI Engineer Roadmap Tracker",
  description: "Track your 30-day AI Engineer roadmap progress, daily.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg bg-grid relative overflow-x-hidden">
        <BackgroundFX />
        <div className="relative z-10">
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 pt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
