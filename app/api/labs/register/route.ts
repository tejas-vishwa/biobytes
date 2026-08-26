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

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const clientIp = getClientIp(req)

  try {
    const formData = await req.formData()
    
    const name = formData.get("name") as string
    const yearEstablished = parseInt(formData.get("yearEstablished") as string, 10)
    const contactPerson = formData.get("contactPerson") as string
    const registrationNo = formData.get("registrationNo") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const operationalScope = formData.get("operationalScope") as string
    const certificationFile = formData.get("certificationFile") as File | null

    const normalizedEmail = email ? email.toLowerCase().trim() : undefined

    // Check rate limit and exponential backoff
    const rateLimitResult = checkAuthLimit(clientIp, normalizedEmail)
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.retryAfter,
        rateLimitResult.limit,
        rateLimitResult.remaining,
        rateLimitResult.reset,
        rateLimitResult.reason === "ACCOUNT_BACKOFF_ACTIVE"
          ? `Too many onboarding attempts for this email. Please wait ${rateLimitResult.retryAfter}s before trying again.`
          : `Rate limit reached. Please wait ${rateLimitResult.retryAfter}s.`
      )
    }

    if (!name || !email || !password || !contactPerson) {
      if (normalizedEmail) recordAuthFailure(clientIp, normalizedEmail)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    const existingLab = await prisma.labPartner.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingLab) {
      if (normalizedEmail) recordAuthFailure(clientIp, normalizedEmail)
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    let certificationUrl = null
    if (certificationFile) {
      certificationUrl = `uploaded-${Date.now()}-${certificationFile.name}`
    }

    const lab = await prisma.labPartner.create({
      data: {
        name,
        yearEstablished,
        contactPerson,
        registrationNo,
        email: normalizedEmail,
        passwordHash,
        operationalScope,
        certificationUrl,
        accountStatus: "pending",
        isActive: false // Keep false until approved
      }
    })

    if (normalizedEmail) recordAuthSuccess(clientIp, normalizedEmail)

    return NextResponse.json({ success: true, labId: lab.id })

  } catch (error: any) {
    console.error("Lab registration error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
