import type { Metadata } from "next";
import { Sora, Geist } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/components/ToastContainer";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora-loaded",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlowGuard AI Command Center",
  description: "Real-time stadium crowd management powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${sora.variable} ${geist.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="antialiased">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
