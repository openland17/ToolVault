import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ToolVault — Your Tools. Your Warranties. Sorted.",
  description:
    "Digitally manage your tool warranties. Register tools, scan receipts, track warranty expiry, and generate warranty claims with AI assistance.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0A0B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0A0A0B] text-zinc-100`}>
        <main className="min-h-screen pb-20">{children}</main>
        <BottomNav />
        <Toaster />
      </body>
    </html>
  );
}
