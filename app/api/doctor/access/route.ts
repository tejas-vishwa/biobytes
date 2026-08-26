import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
    const { code } = await req.json()

    // 1. Check Rate Limiting on IP and attempt backoff on pin verification
    const accountIdentifier = code ? `doctor-access:${code}` : undefined
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

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const accessCode = await prisma.doctorAccessCode.findUnique({
      where: { code }
    })

    if (!accessCode) {
      recordAuthFailure(clientIp, accountIdentifier)
      return NextResponse.json({ error: "Invalid code" }, { status: 404 })
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
        ipAddress: clientIp
      }
    })

    await prisma.doctorAccessCode.update({
      where: { id: accessCode.id },
      data: { usedCount: { increment: 1 } }
    })

    // Return the code itself as the sessionId for the URL
    return NextResponse.json({ sessionId: accessCode.code })
  } catch (error: any) {
    console.error("Doctor access code error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
