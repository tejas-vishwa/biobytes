"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "./ui/button"
import { QurixLogo } from "./QurixLogo"
import { ThemeToggle } from "./ThemeToggle"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 glass-panel">
      <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4">
        <Link href="/" className="flex items-center group transition-transform hover:scale-105">
          <QurixLogo className="h-7 md:h-9 w-auto" showTagline={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/patients" className="transition-colors text-muted-foreground hover:text-primary hover:scale-105">Patients</Link>
          <Link href="/doctors" className="transition-colors text-muted-foreground hover:text-primary hover:scale-105">Doctors</Link>
          <Link href="/labs" className="transition-colors text-muted-foreground hover:text-primary hover:scale-105">Labs</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button className="shadow-lg shadow-primary/20 bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Header Controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </Button>
        </div>
      </div>

      {/* Mobile Off-Canvas Drawer Overlay with 100% Opaque Solid Background */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[999] bg-white dark:bg-slate-950 border-t border-border p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-top-2 overflow-y-auto">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3.5 rounded-xl text-base font-semibold text-foreground bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:bg-muted transition-colors"
            >
              Home
            </Link>
            <Link
              href="/patients"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3.5 rounded-xl text-base font-semibold text-foreground bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:bg-muted transition-colors"
            >
              For Patients
            </Link>
            <Link
              href="/doctors"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3.5 rounded-xl text-base font-semibold text-foreground bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:bg-muted transition-colors"
            >
              For Doctors
            </Link>
            <Link
              href="/labs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-3.5 rounded-xl text-base font-semibold text-foreground bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:bg-muted transition-colors"
            >
              For Labs
            </Link>
          </nav>

          <div className="border-t border-border/60 pt-6 mt-6 flex flex-col space-y-3">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full h-12 text-base justify-center rounded-xl">
                Sign In
              </Button>
            </Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full h-12 text-base justify-center bg-emerald-600 hover:bg-emerald-700 shadow-lg rounded-xl">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
