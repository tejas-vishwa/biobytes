"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/ThemeProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="biobytes-theme">
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  )
}
