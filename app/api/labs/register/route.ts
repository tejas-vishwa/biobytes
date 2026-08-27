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
import { LabRegisterSchema, validateSchema } from "@/lib/validations"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const clientIp = getClientIp(req)

  try {
    const formData = await req.formData().catch(() => null)
    if (!formData) {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    const rawData = {
      name: formData.get("name"),
      yearEstablished: formData.get("yearEstablished"),
      contactPerson: formData.get("contactPerson"),
      registrationNo: formData.get("registrationNo"),
      email: formData.get("email"),
      password: formData.get("password"),
      operationalScope: formData.get("operationalScope") || "",
    }

    const certificationFile = formData.get("certificationFile") as File | null

    // 1. Strict Schema Validation
    const validation = validateSchema(LabRegisterSchema, rawData)
    if (!validation.success) {
      if (typeof rawData.email === "string") {
        recordAuthFailure(clientIp, rawData.email)
      }
      return validation.response
    }

    const { name, yearEstablished, contactPerson, registrationNo, email, password, operationalScope } = validation.data
    const normalizedEmail = email

    // 2. Check rate limit and exponential backoff
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

    // 3. Check if email already exists
    const existingLab = await prisma.labPartner.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingLab) {
      recordAuthFailure(clientIp, normalizedEmail)
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 })
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    let certificationUrl = null
    if (certificationFile && certificationFile.name) {
      certificationUrl = `uploaded-${Date.now()}-${certificationFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
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
        isActive: false, // Keep false until approved
      },
    })

    recordAuthSuccess(clientIp, normalizedEmail)

    return NextResponse.json({ success: true, labId: lab.id })
  } catch (error: any) {
    console.error("Lab registration error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
