import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { seedDatabase } from "@/lib/seed-db"
import {
  getClientIp,
  checkAuthLimit,
  recordAuthFailure,
  recordAuthSuccess,
  createRateLimitResponse,
} from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const clientIp = getClientIp(req)

  try {
    const { name, email, password, role, botCheck, mathAnswer, num1, num2 } = await req.json()
    const normalizedEmail = email ? email.toLowerCase().trim() : undefined

    // 1. Check Rate Limiting & Account Backoff
    const rateLimitResult = checkAuthLimit(clientIp, normalizedEmail)
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.retryAfter,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset,
        rateLimitResult.reason === "ACCOUNT_BACKOFF_ACTIVE"
          ? `Too many registration attempts for this email. Please wait ${rateLimitResult.retryAfter}s before trying again.`
          : `Registration rate limit reached. Please wait ${rateLimitResult.retryAfter}s.`
      )
    }

    if (!name || !email || !password) {
      if (normalizedEmail) recordAuthFailure(clientIp, normalizedEmail)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Bot Verification: Honeypot Check
    if (botCheck) {
      recordAuthFailure(clientIp, normalizedEmail)
      return NextResponse.json({ error: "Bot activity detected. Registration blocked." }, { status: 403 })
    }

    // Bot Verification: Math Challenge Check
    if (typeof mathAnswer !== "number" || typeof num1 !== "number" || typeof num2 !== "number" || mathAnswer !== num1 + num2) {
      recordAuthFailure(clientIp, normalizedEmail)
      return NextResponse.json({ error: "Security challenge failed. Incorrect math answer." }, { status: 403 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    }).catch(async () => {
      await seedDatabase()
      return await prisma.user.findUnique({ where: { email: normalizedEmail } })
    })

    if (existingUser) {
      recordAuthFailure(clientIp, normalizedEmail)
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: role || "PATIENT",
      },
    })

    // Reset failed attempts on success
    recordAuthSuccess(clientIp, normalizedEmail)

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong during registration" }, { status: 500 })
  }
}
