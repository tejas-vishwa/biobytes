import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingUsers = await prisma.user.findMany({
      where: { paymentStatus: "PENDING_APPROVAL" },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    })

    const activeUsers = await prisma.user.findMany({
      where: { subscriptionTier: "QURIX_PLUS", paymentStatus: "ACTIVE" },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json({ success: true, users: pendingUsers, activeUsers })
  } catch (error: any) {
    console.error("Admin subscriptions fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch pending subscriptions." }, { status: 500 })
  }
}
