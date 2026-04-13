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
  description: "Ủng hộ RF, theo dõi lịch phát hành và kết nối hợp tác.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${nunito.variable} ${fredoka.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased selection:bg-primary/30" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
