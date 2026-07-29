import type { Metadata } from "next";
import { Geist, Geist_Mono, Kirang_Haerang } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kirang = Kirang_Haerang({
  variable: "--font-kirang",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeMems",
  description: "Shared trips. Better memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${kirang.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
