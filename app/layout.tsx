import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BioBytes e-health tracker",
  description: "Digitize your lab reports, visualize health trends, and share securely with your doctor.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
