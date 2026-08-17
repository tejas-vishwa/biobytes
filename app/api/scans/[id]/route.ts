import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const scan = await prisma.medicalScan.findUnique({
      where: { id }
    })

    if (!scan) {
      return NextResponse.json({ error: "Scan record not found" }, { status: 404 })
    }

    if (session.user.role !== "ADMIN" && scan.patientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.medicalScan.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, id })
  } catch (error: any) {
    console.error("Error deleting scan:", error)
    return NextResponse.json({ error: error.message || "Failed to delete scan" }, { status: 500 })
  }
}
