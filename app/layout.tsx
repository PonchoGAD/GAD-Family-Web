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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0b0f17] text-white">
        {children}
        <Analytics /> {/* подключение аналитики Vercel */}
      </body>
    </html>
  );
}
