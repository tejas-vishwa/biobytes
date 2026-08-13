import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "QURIX | Intelligent Health Tracker",
  description: "Digitize your lab reports, visualize health trends, and share securely with your doctor.",
  icons: {
    icon: "/qurix-logo.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased flex flex-col font-sans">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
