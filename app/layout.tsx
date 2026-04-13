import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "RF | Donate Hub",
  description: "Support RF, follow the release schedule, and collaborate on new projects.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased selection:bg-primary/30" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
