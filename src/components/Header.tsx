import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";

export function Header() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-sm transition-colors duration-150"
      style={{
        borderColor: "var(--border)",
      }}
    >
      <nav className="container-wide flex items-center justify-between h-16 gap-2 sm:gap-4">
        {/* Logo / Wordmark — clean text-only publication branding */}
        <Link
          href="/"
          className="flex items-center no-underline shrink-0 pr-2"
          style={{ color: "var(--foreground)" }}
        >
          <span
            className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            AI Founders Talk
          </span>
        </Link>

        {/* Desktop Navigation Links (>= lg / 1024px) */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold">
          <Link href="/" className="no-underline nav-link">
            Home
          </Link>
          <Link href="/articles" className="no-underline nav-link">
            Articles
          </Link>
          <Link href="/interviews" className="no-underline nav-link">
            Founder Talks
          </Link>
          <Link href="/resources" className="no-underline nav-link">
            Resources
          </Link>
          <Link href="/trending" className="no-underline nav-link">
            Trending
          </Link>
          <Link href="/about" className="no-underline nav-link">
            About
          </Link>
        </div>

        {/* Right Controls: Desktop Standalone Search + Newsletter CTA + Mobile/Tablet Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:block">
            <SearchBar />
          </div>
          <Link
            href="/newsletter"
            className="btn-primary text-xs sm:text-sm py-1.5 px-3 sm:px-4 hidden sm:inline-flex font-semibold"
          >
            Subscribe
          </Link>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}