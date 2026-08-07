import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PATIENT") {
    return new Response("Unauthorized", { status: 401 })
  }

  const data = await req.json()
  const { doctorId, date, time, preUploadData } = data

  if (!doctorId || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const scheduledTime = new Date(`${date}T${time}`)

  try {
    // Enforce max 10 patients per hourly slot per doctor per day
    const existingApptsCount = await prisma.appointment.count({
      where: {
        doctorId,
        scheduledTime,
        status: { not: "REJECTED" } // Ignore cancelled/rejected appointments
      }
    })

    if (existingApptsCount >= 10) {
      return NextResponse.json({ error: "This time slot is fully booked (10/10 patients). Please choose another." }, { status: 409 })
    }
    let accessCode = null
    
    if (preUploadData) {
      // Revoke old codes and generate a new one
      await prisma.doctorAccessCode.updateMany({
        where: { patientId: session.user.id, isRevoked: false },
        data: { isRevoked: true }
      })
      
      const chars = '0123456789'
      let result = ''
      for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
      accessCode = result

      const expiresAt = new Date(scheduledTime)
      expiresAt.setHours(expiresAt.getHours() + 48) // valid until 48h after appointment

      await prisma.doctorAccessCode.create({
        data: {
          patientId: session.user.id,
          code: accessCode,
          expiresAt,
          maxUses: 10
        }
      })
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.user.id,
        doctorId,
        scheduledTime,
        accessCode
      }
    })

    return NextResponse.json({ success: true, appointment })
  } catch (error: any) {
    console.error("Booking API Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (session.user.role === "PATIENT") {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: session.user.id },
      include: { doctor: true },
      orderBy: { scheduledTime: "asc" }
    })
    return NextResponse.json(appointments)
  }

  if (session.user.role === "DOCTOR") {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: session.user.id },
      include: { patient: true },
      orderBy: { scheduledTime: "asc" }
    })
    return NextResponse.json(appointments)
  }

  return NextResponse.json([])
}
