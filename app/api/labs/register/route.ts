import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
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

    if (!name || !email || !password || !contactPerson) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    const existingLab = await prisma.labPartner.findUnique({
      where: { email }
    })

    if (existingLab) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    let certificationUrl = null
    if (certificationFile) {
      // In a real production app, upload this file to S3/Cloud Storage.
      // For now, we will just store the file name to indicate an upload was provided.
      certificationUrl = `uploaded-${Date.now()}-${certificationFile.name}`
    }

    const lab = await prisma.labPartner.create({
      data: {
        name,
        yearEstablished,
        contactPerson,
        registrationNo,
        email,
        passwordHash,
        operationalScope,
        certificationUrl,
        accountStatus: "pending",
        isActive: false // Keep false until approved
      }
    })

    return NextResponse.json({ success: true, labId: lab.id })

  } catch (error: any) {
    console.error("Lab registration error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
