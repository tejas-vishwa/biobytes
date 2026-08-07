import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "DOCTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const resolvedParams = await params

  const data = await req.json()
  const { status } = data

  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 })
  }

  const appointment = await prisma.appointment.update({
    where: { id: resolvedParams.id, doctorId: session.user.id },
    data: { status }
  })

  return NextResponse.json({ success: true, appointment })
}
