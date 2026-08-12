"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LineChart, LogOut, UploadCloud, Calendar, Menu, X } from "lucide-react"
import { QurixLogo } from "@/components/QurixLogo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"

interface PatientNavbarProps {
  userName?: string | null
}

export function PatientNavbar({ userName }: PatientNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
    { name: "Upload", href: "/patient/upload", icon: UploadCloud },
    { name: "Trends", href: "/patient/trends", icon: LineChart },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar },
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
                className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
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

        {/* Mobile Right Controls & Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Overlay with 100% Opaque Solid Background */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-[999] bg-white dark:bg-slate-950 border-t border-border p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-top-2 overflow-y-auto">
          <nav className="flex flex-col space-y-3">
            {userName && (
              <div className="pb-4 mb-2 border-b border-border/60">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Signed in as</p>
                <p className="text-xl font-extrabold text-foreground mt-0.5">{userName}</p>
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center p-3.5 rounded-xl text-base font-semibold transition-all border ${
                    isActive
                      ? "bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-400 shadow-sm"
                      : "bg-slate-100/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-teal-500" : "text-muted-foreground"}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border/60 pt-6 mt-6">
            <Link
              href="/api/auth/signout"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center p-3.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 font-bold hover:bg-red-500/20 transition-colors border border-red-500/20"
            >
              <LogOut className="mr-2 h-5 w-5" /> Sign out
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
