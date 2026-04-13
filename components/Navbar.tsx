"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Menu, Music, X } from "lucide-react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Donate", href: "#donate" },
    { name: "Lịch phát hành", href: "#releases" },
    { name: "Fan Ideas", href: "/fan-ideas" },
    { name: "Hợp tác", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-foreground font-display font-bold text-2xl">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <Music className="w-4 h-4" />
          </div>
          RF
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            )
          )}
          <a href="#donate" className={buttonVariants({ className: "rounded-full px-6" })}>
            Ủng hộ ngay
          </a>
        </nav>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-primary/10 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-foreground py-2 border-b border-muted/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className="text-base font-medium text-foreground py-2 border-b border-muted/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            )
          )}
          <a
            href="#donate"
            className={buttonVariants({ className: "w-full rounded-xl mt-2" })}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Ủng hộ ngay
          </a>
        </div>
      )}
    </header>
  );
}
