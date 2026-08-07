import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const report = await prisma.report.findUnique({
      where: { id }
    })

    if (!report) {
      return new NextResponse("Report not found", { status: 404 })
    }

    if (!report.fileData) {
      return new NextResponse("No PDF binary content stored in database for this legacy report", { status: 404 })
    }

    // Convert Base64 data stored in Turso back to binary Buffer
    const buffer = Buffer.from(report.fileData, "base64")
    const mimeType = report.fileType || "application/pdf"

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(report.fileName)}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: any) {
    console.error("Error serving report PDF from Turso:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
