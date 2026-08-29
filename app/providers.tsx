"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/ThemeProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="qurix-theme">
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  )
}
