import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get all reminders for a user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const prescriptionId = searchParams.get('prescriptionId')

  try {
    const whereClause: any = { patientId: session.user.id }
    if (prescriptionId) {
      whereClause.prescriptionId = prescriptionId
    }

    const reminders = await prisma.medicineReminder.findMany({
      where: whereClause,
      orderBy: { reminderTime: 'asc' }
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Create a new reminder
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { prescriptionId, medicineName, reminderTime } = data

    if (!medicineName || !reminderTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newReminder = await prisma.medicineReminder.create({
      data: {
        patientId: session.user.id,
        prescriptionId: prescriptionId || null,
        medicineName,
        reminderTime,
        isActive: true,
      }
    })

    return NextResponse.json(newReminder)
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Delete a reminder
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: "Reminder ID required" }, { status: 400 })
  }

  try {
    // Check ownership
    const reminder = await prisma.medicineReminder.findUnique({ where: { id } })
    if (!reminder || reminder.patientId !== session.user.id) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 })
    }

    await prisma.medicineReminder.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
