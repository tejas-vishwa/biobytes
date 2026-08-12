"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Settings, LogOut, ShieldAlert } from "lucide-react"
import { signOut } from "next-auth/react"

import { ThemeToggle } from "./ThemeToggle"
import { QurixLogo } from "./QurixLogo"

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "User Management", href: "/admin/users", icon: Users },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "System Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen shadow-sm sticky top-0 transition-colors">
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <QurixLogo className="h-7 w-auto" />
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">Admin</span>
        </div>
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
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
