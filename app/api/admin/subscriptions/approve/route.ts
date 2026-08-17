import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        paymentStatus: "ACTIVE",
        subscriptionTier: "QURIX_PLUS"
      }
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error: any) {
    console.error("Approve subscription error:", error)
    return NextResponse.json({ error: "Failed to approve subscription." }, { status: 500 })
  }
}
