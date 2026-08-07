import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  // Do NOT use PrismaAdapter with JWT strategy + Credentials provider
  // PrismaAdapter requires database sessions which conflict with JWT
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

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase()
            }
          })

          if (!user) {
            await prisma.activityLog.create({
              data: { action: "LOGIN_FAILED", details: `Failed login attempt for ${credentials.email}` }
            }).catch(() => {}) // Don't fail login if activity log fails
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
            role: user.role
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
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    }
  }
}
