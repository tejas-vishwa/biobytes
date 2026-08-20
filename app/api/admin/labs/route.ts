import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const pendingLabs = await prisma.labPartner.findMany({
      where: {
        accountStatus: "pending"
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ pendingLabs })
  } catch (error: any) {
    console.error("Error fetching pending labs:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
