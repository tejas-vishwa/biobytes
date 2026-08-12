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
            className="h-10 w-10 rounded-full flex items-center justify-center border border-border/60 bg-muted/40 hover:bg-muted text-foreground transition-all duration-200 active:scale-95 focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-teal-400 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Premium Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[9999] bg-slate-950/98 text-slate-100 border-t border-slate-800/80 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-2 overflow-y-auto">
          <div className="space-y-6">
            <div className="pb-4 border-b border-slate-800/80">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30">
                QURIX Navigation
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-2">Main Menu</h2>
            </div>

            <nav className="flex flex-col space-y-3">
              {publicLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-slate-200 hover:bg-slate-800/90 hover:border-slate-700 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-teal-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-white">{link.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{link.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500" />
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="border-t border-slate-800/80 pt-6 mt-6 flex flex-col space-y-3">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full h-12 text-base font-bold justify-center rounded-2xl border-slate-700 text-slate-100 hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full h-12 text-base font-bold justify-center bg-emerald-600 hover:bg-emerald-700 shadow-lg rounded-2xl text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
