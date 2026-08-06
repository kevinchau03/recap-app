import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Kirang_Haerang } from "next/font/google";
import PwaRuntime from "@/components/PwaRuntime";
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
  applicationName: "4 Da Mems",
  title: {
    default: "4 Da Mems",
    template: "%s | 4 Da Mems",
  },
  description: "Shared trips. Better memories.",
  appleWebApp: {
    capable: true,
    title: "4 Da Mems",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
      <body className="min-h-full flex flex-col">
        {children}
        <PwaRuntime />
      </body>
    </html>
  );
}
