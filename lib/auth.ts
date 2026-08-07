import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
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

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase()
          }
        })

        if (!user) {
          await prisma.activityLog.create({
            data: { action: "LOGIN_FAILED", details: `Failed login attempt for ${credentials.email}` }
          })
          return null
        }

        if (user.accountStatus === "SUSPENDED") {
          await prisma.activityLog.create({
            data: { action: "LOGIN_BLOCKED", details: `Suspended user attempted login: ${user.email}`, userId: user.id }
          })
          throw new Error("Your account has been suspended.")
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          await prisma.activityLog.create({
            data: { action: "LOGIN_FAILED", details: `Invalid password for ${user.email}`, userId: user.id }
          })
          return null
        }

        await prisma.activityLog.create({
          data: { action: "LOGIN_SUCCESS", details: `User logged in: ${user.email}`, userId: user.id }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
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
        token.role = user.role
      }
      return token
    }
  }
}
