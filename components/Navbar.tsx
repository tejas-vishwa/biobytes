"use client"
import { useState } from "react"
import Link from "next/link"
import { Activity, Menu, X } from "lucide-react"
import { Button } from "./ui/button"

import { ThemeToggle } from "./ThemeToggle"

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 glass-panel">
      <div className="container flex h-16 max-w-7xl mx-auto items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 group">
          <Activity className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
          <span className="font-bold text-xl tracking-tight text-foreground">BioBytes e-health tracker</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/patients" className="transition-colors text-muted-foreground hover:text-primary hover:scale-105">Patients</Link>
          <Link href="/doctors" className="transition-colors text-muted-foreground hover:text-primary hover:scale-105">Doctors</Link>
          <Link href="/labs" className="transition-colors text-muted-foreground hover:text-primary hover:scale-105">Labs</Link>
        </nav>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Link href="/login" className="hidden md:block">
            <Button variant="ghost" className="hidden md:inline-flex">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button className="shadow-lg shadow-primary/20">Get Started</Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Off-Canvas Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t animate-in slide-in-from-top-2 p-6 flex flex-col space-y-6 shadow-2xl">
          <nav className="flex flex-col space-y-6 text-lg font-medium">
            <Link href="/patients" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors">Patients</Link>
            <Link href="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors">Doctors</Link>
            <Link href="/labs" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors">Labs</Link>
          </nav>
          <div className="border-t pt-6 flex flex-col space-y-4">
            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
