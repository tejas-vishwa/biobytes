"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronRight, Home as HomeIcon, Users, Stethoscope, TestTube } from "lucide-react"
import { Button } from "./ui/button"
import { QurixLogo } from "./QurixLogo"
import { ThemeToggle } from "./ThemeToggle"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const publicLinks = [
    { name: "Home", href: "/", icon: HomeIcon, desc: "Overview & features" },
    { name: "For Patients", href: "/patients", icon: Users, desc: "Track lab trends" },
    { name: "For Doctors", href: "/doctors", icon: Stethoscope, desc: "Longitudinal data access" },
    { name: "For Labs", href: "/labs", icon: TestTube, desc: "Diagnostic partner sync" },
  ]

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
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="h-12 w-12 rounded-xl flex items-center justify-center border-2 border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-foreground transition-all duration-200 active:scale-95 shadow-sm focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7 text-teal-400 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="h-7 w-7 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 w-full h-full min-h-screen z-[99999] bg-slate-950 text-slate-100 p-6 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
          <div className="space-y-6">
            {/* Top Bar inside Full Screen Overlay */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <QurixLogo className="h-8 w-auto" showTagline={true} />
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-12 w-12 rounded-xl flex items-center justify-center border-2 border-teal-500/40 bg-teal-500/10 text-teal-400 active:scale-95 transition-all focus:outline-none"
                >
                  <X className="h-7 w-7 rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            <nav className="flex flex-col space-y-3">
              {publicLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-slate-200 hover:bg-slate-800/90 hover:border-slate-700 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-xl bg-slate-800 text-teal-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">{link.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{link.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-slate-500" />
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="border-t border-slate-800/80 pt-6 mt-6 flex flex-col space-y-3">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full h-14 text-lg font-bold justify-center rounded-2xl border-slate-700 text-slate-100 hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full h-14 text-lg font-bold justify-center bg-emerald-600 hover:bg-emerald-700 shadow-lg rounded-2xl text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
