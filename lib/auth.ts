import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { seedDatabase } from "@/lib/seed-db"

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "qurix-production-secret-2026"
}

if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const emailLower = credentials.email.toLowerCase()

        try {
          // Check if table exists or user exists
          let user = await prisma.user.findUnique({
            where: { email: emailLower }
          }).catch(async () => {
            // If table doesn't exist in Turso, seed the database automatically!
            await seedDatabase()
            return await prisma.user.findUnique({ where: { email: emailLower } })
          })

          // If demo user is missing, attempt auto-seeding
          if (!user && (emailLower.includes("demo") || emailLower.includes("biobytes") || emailLower.includes("qurix"))) {
            await seedDatabase()
            user = await prisma.user.findUnique({ where: { email: emailLower } })
          }

          if (!user) {
            await prisma.activityLog.create({
              data: { action: "LOGIN_FAILED", details: `Failed login attempt for ${credentials.email}` }
            }).catch(() => {})
            return null
          }

          if (user.accountStatus === "SUSPENDED") {
            throw new Error("Your account has been suspended.")
          }

          const isPasswordValid = await compare(credentials.password, user.passwordHash)

          if (!isPasswordValid) {
            await prisma.activityLog.create({
              data: { action: "LOGIN_FAILED", details: `Invalid password for ${user.email}`, userId: user.id }
            }).catch(() => {})
            return null
          }

          await prisma.activityLog.create({
            data: { action: "LOGIN_SUCCESS", details: `User logged in: ${user.email}`, userId: user.id }
          }).catch(() => {})

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            subscriptionTier: user.subscriptionTier,
            paymentStatus: user.paymentStatus
          }
        } catch (error: any) {
          if (error.message === "Your account has been suspended.") {
            throw error
          }
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.subscriptionTier = token.subscriptionTier as string
        session.user.paymentStatus = token.paymentStatus as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.subscriptionTier = (user as any).subscriptionTier
        token.paymentStatus = (user as any).paymentStatus
      }
      return token
    }
  }
}
