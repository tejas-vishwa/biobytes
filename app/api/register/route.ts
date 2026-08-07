import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, password, role, botCheck, mathAnswer, num1, num2 } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Bot Verification: Honeypot Check
    if (botCheck) {
      return NextResponse.json({ error: "Bot activity detected. Registration blocked." }, { status: 403 })
    }

    // Bot Verification: Math Challenge Check
    if (typeof mathAnswer !== "number" || typeof num1 !== "number" || typeof num2 !== "number" || mathAnswer !== num1 + num2) {
      return NextResponse.json({ error: "Security challenge failed. Incorrect math answer." }, { status: 403 })
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase()
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
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

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong during registration" }, { status: 500 })
  }
}
