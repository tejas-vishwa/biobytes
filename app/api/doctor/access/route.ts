import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getClientIp,
  checkAuthLimit,
  recordAuthFailure,
  recordAuthSuccess,
  createRateLimitResponse,
} from "@/lib/rate-limit"
import { DoctorAccessCodeVerifySchema, validateSchema } from "@/lib/validations"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const clientIp = getClientIp(req)

  try {
    const rawBody = await req.json().catch(() => null)
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 })
    }

    // 1. Strict Schema Validation (exact 6 characters, alphanumeric)
    const validation = validateSchema(DoctorAccessCodeVerifySchema, rawBody)
    if (!validation.success) {
      if (typeof rawBody.code === "string") {
        recordAuthFailure(clientIp, `doctor-access:${rawBody.code.slice(0, 10)}`)
      }
      return validation.response
    }

    const { code } = validation.data

    // 2. Check Rate Limiting on IP and attempt backoff on pin verification
    const accountIdentifier = `doctor-access:${code}`
    const rateLimitResult = checkAuthLimit(clientIp, accountIdentifier)
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.retryAfter,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset,
        `Too many access code attempts. Please wait ${rateLimitResult.retryAfter}s before trying again.`
      )
    }

    const accessCode = await prisma.doctorAccessCode.findUnique({
      where: { code },
    })

    if (!accessCode) {
      recordAuthFailure(clientIp, accountIdentifier)
      return NextResponse.json({ error: "Invalid access code" }, { status: 404 })
    }

    if (accessCode.isRevoked || accessCode.expiresAt < new Date() || accessCode.usedCount >= accessCode.maxUses) {
      recordAuthFailure(clientIp, accountIdentifier)
      return NextResponse.json({ error: "Code expired or max uses reached" }, { status: 403 })
    }

    // Success: clear failed attempts
    recordAuthSuccess(clientIp, accountIdentifier)

    // Log usage
    await prisma.accessCodeUsage.create({
      data: {
        codeId: accessCode.id,
        ipAddress: clientIp,
      },
    })

    await prisma.doctorAccessCode.update({
      where: { id: accessCode.id },
      data: { usedCount: { increment: 1 } },
    })

    // Return the code itself as the sessionId for the URL
    return NextResponse.json({ sessionId: accessCode.code })
  } catch (error: any) {
    console.error("Doctor access code error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
