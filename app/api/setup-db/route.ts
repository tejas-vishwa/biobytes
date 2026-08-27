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
        admin: "admin@qurix.health / BB@quirx.in",
        superAdmin: "admin@teamqurix.com / BB@1234@QURIX"
      }
    })
  } else {
    console.error("Database setup failed:", result.error)
    return NextResponse.json({ success: false, error: "Database setup failed. Please check server logs." }, { status: 500 })
  }
}
