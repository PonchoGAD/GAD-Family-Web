/******** app/layout.tsx ********/
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"; // важно: /react

export const metadata: Metadata = {
  title: "GAD Family — Safer Families. Smarter Money.",
  description: "GAD Family is a family safety & activity app with GAD Coin rewards.",
  icons: { icon: "/favicon.ico", apple: "/assets/logo-180.png" },
  manifest: "/manifest.json",
};


import './globals.css'
import NavBar from '../app/components/NavBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0b0f17] text-white">
        <NavBar />
        {children}
        <Analytics /> {/* подключение аналитики Vercel */}
      </body>
    </html>
  );
}