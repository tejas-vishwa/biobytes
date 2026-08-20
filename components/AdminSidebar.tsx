"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Settings, LogOut, ShieldAlert, CreditCard, Menu, X } from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

import { ThemeToggle } from "./ThemeToggle"
import { QurixLogo } from "./QurixLogo"

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const SidebarContent = () => (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full shadow-sm transition-colors">
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <QurixLogo className="h-7 w-auto" />
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">Admin</span>
        </div>
        {/* Mobile Close Button (only visible inside drawer) */}
        <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Command Center</p>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-semibold" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-indigo-500" : "text-muted-foreground"}`} />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-border flex flex-col space-y-2">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center px-4 z-40 justify-between">
        <div className="flex items-center gap-2">
          <QurixLogo className="h-6 w-auto" />
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-foreground">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative z-50 h-full w-64 bg-card shadow-xl animate-in slide-in-from-left">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0">
        <SidebarContent />
      </div>
    </>
  )
}
