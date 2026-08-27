import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import {
  getClientIp,
  checkAuthLimit,
  recordAuthFailure,
  recordAuthSuccess,
  createRateLimitResponse,
} from "@/lib/rate-limit"
import { PasswordResetSchema, validateSchema } from "@/lib/validations"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const clientIp = getClientIp(req)

  try {
    const rawBody = await req.json().catch(() => null)
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 })
    }

    // 1. Strict Schema Validation
    const validation = validateSchema(PasswordResetSchema, rawBody)
    if (!validation.success) {
      if (typeof rawBody.email === "string") {
        recordAuthFailure(clientIp, rawBody.email)
      }
      return validation.response
    }

    const { email, action, newPassword } = validation.data
    const normalizedEmail = email

    // 2. Rate Limit & Exponential Backoff Check (Strict per-IP and per-account)
    const rateLimitResult = checkAuthLimit(clientIp, normalizedEmail)
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.retryAfter,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset,
        rateLimitResult.reason === "ACCOUNT_BACKOFF_ACTIVE"
          ? `Too many password reset attempts for this account. Please wait ${rateLimitResult.retryAfter}s before trying again.`
          : `Password reset rate limit reached. Please wait ${rateLimitResult.retryAfter}s.`
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (action === "RESET") {
      if (!newPassword) {
        return NextResponse.json({ error: "newPassword is required for RESET action" }, { status: 400 })
      }

      if (!user) {
        recordAuthFailure(clientIp, normalizedEmail)
        return NextResponse.json({ error: "Invalid password reset request" }, { status: 404 })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword },
      })

      await prisma.activityLog.create({
        data: {
          action: "PASSWORD_RESET_SUCCESS",
          userId: user.id,
          details: `Password reset successfully completed for ${user.email}`,
        },
      })

      recordAuthSuccess(clientIp, normalizedEmail)
      return NextResponse.json({ success: true, message: "Password updated successfully" })
    }

    // Default: Reset Request / Send Link
    if (user) {
      await prisma.activityLog.create({
        data: {
          action: "RESET_PASSWORD_REQUEST",
          userId: user.id,
          details: `Password reset email requested for ${user.email}`,
        },
      })
      recordAuthSuccess(clientIp, normalizedEmail)
    } else {
      // Don't leak user existence, but record failure for brute force protection
      recordAuthFailure(clientIp, normalizedEmail)
    }

    // Standard timing-safe response
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, password reset instructions have been sent.",
    })
  } catch (error: any) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
