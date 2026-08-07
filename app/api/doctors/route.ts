import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR" },
    select: {
      id: true,
      name: true,
      email: true,
      doctorProfile: true
    }
  })
  
  return NextResponse.json(doctors)
}
