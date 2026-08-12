"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, Menu, X, KeyRound, ChevronRight, Stethoscope } from "lucide-react"
import { QurixLogo } from "@/components/QurixLogo"
import { ThemeToggle } from "@/components/ThemeToggle"

export function DoctorNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard, desc: "Overview & metrics" },
    { name: "Patient Access Code", href: "/doctor/access", icon: KeyRound, desc: "Enter 6-digit PIN" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4">
        <Link href="/" className="flex items-center group transition-transform hover:scale-105">
          <QurixLogo className="h-7 md:h-8 w-auto" showTagline={true} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 ml-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-500 flex items-center ${
                  isActive ? "text-emerald-500 font-semibold" : "text-muted-foreground"
                }`}
              >
                <Icon className="mr-2 h-4 w-4" /> {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/api/auth/signout"
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center border-l border-border pl-3"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Link>
        </div>

        {/* Mobile Right Controls & Sleek Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="h-12 w-12 rounded-xl flex items-center justify-center border-2 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-foreground transition-all duration-200 active:scale-95 shadow-sm focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7 text-emerald-400 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="h-7 w-7 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Premium Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[9999] bg-slate-950/98 text-slate-100 border-t border-slate-800/80 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-2 overflow-y-auto">
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="pb-4 border-b border-slate-800/80">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Stethoscope className="h-3.5 w-3.5" /> Doctor Workstation
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-2">Clinical Portal</h2>
            </div>

            {/* Navigation Cards */}
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-white shadow-lg"
                        : "bg-slate-900/90 border-slate-800/80 text-slate-200 hover:bg-slate-800/90 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`p-2.5 rounded-xl ${isActive ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-emerald-400"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-white">{item.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Sign Out Button */}
          <div className="pt-6 border-t border-slate-800/80 mt-6">
            <Link
              href="/api/auth/signout"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/25 transition-all text-base shadow-sm"
            >
              <LogOut className="mr-2 h-5 w-5" /> Sign out
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
