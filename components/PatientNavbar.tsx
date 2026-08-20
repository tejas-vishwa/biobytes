"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LineChart, LogOut, UploadCloud, Calendar, Menu, X, ChevronRight, User, Pill, Activity } from "lucide-react"
import { QurixLogo } from "@/components/QurixLogo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Sparkles } from "lucide-react"

interface PatientNavbarProps {
  userName?: string | null
  subscriptionTier?: string | null
}

export function PatientNavbar({ userName, subscriptionTier }: PatientNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard, desc: "Health overview & metrics" },
    { name: "Upload", href: "/patient/upload", icon: UploadCloud, desc: "Unified Hub: Reports, Prescriptions & Scans" },
    { name: "Prescriptions", href: "/patient/prescriptions", icon: Pill, desc: "Medicines & OCR symptoms" },
    { name: "Advance Medical Scan", href: "/patient/scan-analysis", icon: Activity, desc: "X-Ray & CT/MRI Advance Medical Scan analysis" },
    { name: "Trends", href: "/patient/trends", icon: LineChart, desc: "100-test longitudinal charts" },
    { name: "Appointments", href: "/patient/appointments", icon: Calendar, desc: "Doctor bookings & queues" },
    { name: "Profile", href: "/patient/profile", icon: User, desc: "Manage personal information" },
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
            <div className={`flex items-center p-1.5 rounded-full pl-4 pr-1.5 transition-all duration-500 ${
              subscriptionTier === "QURIX_PLUS" 
                ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]" 
                : ""
            }`}>
              <span className={`text-sm font-medium mr-3 ${
                subscriptionTier === "QURIX_PLUS"
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-bold"
                  : "text-foreground"
              }`}>
                Hello, {userName}
              </span>
              {subscriptionTier === "QURIX_PLUS" && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-2.5 py-1.5 rounded-full shadow-md animate-gradient-x">
                  <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" /> QURIX Plus
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center border-l border-border pl-3"
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </button>
        </div>

        {/* Mobile Right Controls & Sleek Theme-Blended Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="h-10 w-10 rounded-full flex items-center justify-center border border-input bg-background hover:bg-accent text-foreground transition-all duration-200 active:scale-95 shadow-sm focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-primary transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Menu Drawer Overlay (Seamless Theme Blending) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 w-full h-full min-h-screen z-[99999] bg-background text-foreground p-6 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
          <div className="space-y-6">
            {/* Top Bar inside Full Screen Overlay */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <QurixLogo className="h-8 w-auto" showTagline={true} />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="h-10 w-10 rounded-full flex items-center justify-center border border-input bg-background hover:bg-accent text-foreground active:scale-95 transition-all focus:outline-none shadow-sm"
                >
                  <X className="h-5 w-5 text-primary rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* Header User Badge */}
            {userName && (
              <div className="flex items-center space-x-3.5 p-4 rounded-2xl bg-card border border-border/80 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-primary uppercase font-bold tracking-wider">Signed in as</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-extrabold text-foreground">{userName}</p>
                    {subscriptionTier === "QURIX_PLUS" && (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                        <Sparkles className="h-3 w-3" /> Plus
                      </span>
                    )}
                  </div>
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
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 shadow-sm ${
                      isActive
                        ? "bg-primary/15 border-primary/40 text-primary font-semibold"
                        : "bg-card border-border/70 text-card-foreground hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`p-2.5 rounded-xl ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-base text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Sign Out Button */}
          <div className="pt-6 border-t border-border/60 mt-6">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                signOut({ callbackUrl: '/login' });
              }}
              className="flex w-full items-center justify-center p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-bold hover:bg-destructive/20 transition-all text-base shadow-sm"
            >
              <LogOut className="mr-2 h-5 w-5" /> Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
