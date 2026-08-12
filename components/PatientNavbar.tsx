"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LineChart, LogOut, UploadCloud, Calendar, Menu, X, ChevronRight, User } from "lucide-react"
import { QurixLogo } from "@/components/QurixLogo"
import { ThemeToggle } from "@/components/ThemeToggle"

interface PatientNavbarProps {
  userName?: string | null
}

export function PatientNavbar({ userName }: PatientNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard, desc: "Health overview & metrics" },
    { name: "Upload", href: "/patient/upload", icon: UploadCloud, desc: "Lab reports & prescriptions" },
    { name: "Trends", href: "/patient/trends", icon: LineChart, desc: "100-test longitudinal charts" },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar, desc: "Doctor bookings & queues" },
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
                className={`text-sm font-medium transition-colors hover:text-teal-500 flex items-center ${
                  isActive ? "text-teal-500 font-semibold" : "text-muted-foreground"
                }`}
              >
                <Icon className="mr-2 h-4 w-4" /> {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Right Controls */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {userName && (
            <span className="text-sm font-medium text-foreground">
              Hello, {userName}
            </span>
          )}
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

      {/* Premium Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[9999] bg-slate-950/98 text-slate-100 border-t border-slate-800/80 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top-2 overflow-y-auto">
          <div className="space-y-6">
            {/* Header User Badge */}
            {userName && (
              <div className="pb-4 border-b border-slate-800/80 flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-teal-400 uppercase font-bold tracking-wider">Signed in as</p>
                  <p className="text-lg font-black text-white">{userName}</p>
                </div>
              </div>
            )}

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
                        ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-white shadow-lg"
                        : "bg-slate-900/90 border-slate-800/80 text-slate-200 hover:bg-slate-800/90 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`p-2.5 rounded-xl ${isActive ? "bg-teal-500 text-slate-950" : "bg-slate-800 text-teal-400"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-white">{item.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${isActive ? "text-teal-400" : "text-slate-500"}`} />
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
