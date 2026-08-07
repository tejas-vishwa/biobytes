import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed-db"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await seedDatabase()
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: result.message,
      demoAccounts: {
        patient: "priya@demo.com / demo1234",
        doctor: "doctor@demo.com / demo1234",
        admin: "admin@biobytes.in / admin1234",
        superAdmin: "admin@teambiobytes.com / BB@1234@QURIX"
      }
    })
  } else {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  }
}
