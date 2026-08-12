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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
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
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-4">
            {userName && (
              <div className="pb-3 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Signed in as</p>
                <p className="text-lg font-bold text-foreground">{userName}</p>
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
                  className={`flex items-center p-3 rounded-lg text-base font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 text-primary" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border pt-6">
            <Link
              href="/api/auth/signout"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center p-3 rounded-lg bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="mr-2 h-5 w-5" /> Sign out
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
