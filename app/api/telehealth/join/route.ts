import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { appointmentId } = await req.json()
    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const isDoctor = appointment.doctorId === session.user.id
    const isPatient = appointment.patientId === session.user.id
    if (!isDoctor && !isPatient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Only set IN_PROGRESS if not already completed, and record callStartedAt
    if (appointment.status === "ACCEPTED" || appointment.status === "PENDING") {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: "IN_PROGRESS",
          callStartedAt: appointment.callStartedAt || new Date()
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error joining telehealth call:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    )
  }
}
