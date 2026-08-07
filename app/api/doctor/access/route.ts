import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const { code } = await req.json()

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 })
  }

  const accessCode = await prisma.doctorAccessCode.findUnique({
    where: { code }
  })

  if (!accessCode) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 })
  }

  if (accessCode.isRevoked || accessCode.expiresAt < new Date() || accessCode.usedCount >= accessCode.maxUses) {
    return NextResponse.json({ error: "Code expired or max uses reached" }, { status: 403 })
  }

  // Log usage
  await prisma.accessCodeUsage.create({
    data: {
      codeId: accessCode.id,
      ipAddress: "127.0.0.1" // Mock IP
    }
  })

  await prisma.doctorAccessCode.update({
    where: { id: accessCode.id },
    data: { usedCount: { increment: 1 } }
  })

  // Return the code itself as the sessionId for the URL
  return NextResponse.json({ sessionId: accessCode.code })
}
