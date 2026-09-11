"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SearchBar } from "./SearchBar";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Hamburger / Close Morph Button */}
      <button
        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer text-slate-800 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-900 relative z-50"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-drawer"
        id="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-5 h-4 relative flex flex-col justify-between items-center pointer-events-none">
          {/* Top Line -> Top Diagonal */}
          <span
            className={`w-5 h-0.5 bg-slate-800 rounded-full transition-all duration-200 ease-in-out transform origin-center ${              isOpen ? "translate-y-[7px] rotate-45" : "translate-y-0 rotate-0"            }`}
          />
          {/* Middle Line -> Scale to 0 & Fade Out */}
          <span
            className={`w-5 h-0.5 bg-slate-800 rounded-full transition-all duration-200 ease-in-out ${              isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"            }`}
          />
          {/* Bottom Line -> Bottom Diagonal */}
          <span
            className={`w-5 h-0.5 bg-slate-800 rounded-full transition-all duration-200 ease-in-out transform origin-center ${              isOpen ? "-translate-y-[7px] -rotate-45" : "translate-y-0 rotate-0"            }`}
          />
        </div>
      </button>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 top-16 bg-slate-900/30 backdrop-blur-2xs z-30 lg:hidden transition-opacity duration-200 ease-in-out ${          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-Down Mobile/Tablet Drawer Menu */}
      <div
        id="mobile-menu-drawer"
        className={`fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] border-b lg:hidden shadow-xl bg-white/98 backdrop-blur-md z-40 overflow-y-auto transition-all duration-200 ease-in-out transform ${          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"        }`}
        style={{ borderColor: "var(--border)" }}
        aria-hidden={!isOpen}
      >
        <div className="container-wide py-4 flex flex-col gap-2.5">
          {/* Mobile / Tablet Full-Width Search Bar */}
          <div className="w-full pb-3 border-b border-slate-100">
            <SearchBar
              isAlwaysExpanded={true}
              autoFocus={true}
              fullWidth={true}
              onNavigate={() => setIsOpen(false)}
              placeholder="Search articles, founder talks, guides..."
            />
          </div>

          {/* Navigation Links */}
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1 font-sans">
            <MobileLink href="/" onClick={() => setIsOpen(false)}>
              Home
            </MobileLink>
            <MobileLink href="/articles" onClick={() => setIsOpen(false)}>
              Articles
            </MobileLink>
            <MobileLink href="/interviews" onClick={() => setIsOpen(false)}>
              Founder Talks
            </MobileLink>
            <MobileLink href="/resources" onClick={() => setIsOpen(false)}>
              Resources
            </MobileLink>
            <MobileLink href="/trending" onClick={() => setIsOpen(false)}>
              Trending
            </MobileLink>
            <MobileLink href="/about" onClick={() => setIsOpen(false)}>
              About
            </MobileLink>
            <MobileLink href="/newsletter" onClick={() => setIsOpen(false)}>
              Newsletter
            </MobileLink>
          </nav>
        </div>
      </div>
    </>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-sm sm:text-base font-semibold no-underline py-2.5 px-3 rounded-lg text-slate-800 hover:text-slate-900 hover:bg-slate-50 transition-colors focus:outline-hidden focus:bg-slate-100"
    >
      {children}
    </Link>
  );
}
