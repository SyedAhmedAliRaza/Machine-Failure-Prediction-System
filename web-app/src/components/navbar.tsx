"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavbarProps {
  user?: { name?: string | null; email?: string | null } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = user
    ? [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/predict", label: "Predict" },
      { href: "/history", label: "History" },
    ]
    : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-maroon to-maroon-light transition-shadow group-hover:shadow-[0_0_20px_rgba(128,0,32,0.4)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 text-white"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <path d="M12 9v4M12 15h.01" strokeLinecap="round" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-text-primary">Machine Failure  </span>
            <span className="text-maroon-light">Prediction System</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${pathname === link.href
                ? "bg-maroon/15 text-maroon-light"
                : "text-text-secondary hover:bg-surface hover:text-text-primary"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">
                {user.name}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:border-maroon/40 hover:text-text-primary"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-all hover:text-text-primary"
              >
                Login
              </Link>
              <Link href="/register" className="btn-maroon !py-2 !px-5 text-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-text-secondary hover:text-text-primary md:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 pb-4 md:hidden animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition-all ${pathname === link.href
                ? "bg-maroon/15 text-maroon-light"
                : "text-text-secondary hover:text-text-primary"
                }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <form action="/api/auth/signout" method="POST" className="mt-2">
              <button
                type="submit"
                className="w-full rounded-lg border border-border px-4 py-3 text-sm font-medium text-text-secondary"
              >
                Sign Out
              </button>
            </form>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <Link href="/login" className="rounded-lg px-4 py-3 text-sm font-medium text-text-secondary text-center">
                Login
              </Link>
              <Link href="/register" className="btn-maroon text-center text-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
