import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const prescription = await prisma.prescription.findUnique({
      where: { id }
    })

    if (!prescription) {
      return new NextResponse("Prescription not found", { status: 404 })
    }

    if (!prescription.fileData) {
      return new NextResponse("No file binary stored", { status: 404 })
    }

    const buffer = Buffer.from(prescription.fileData, "base64")
    const mimeType = prescription.fileType || "application/pdf"

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(prescription.fileName)}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error: any) {
    console.error("Error serving prescription binary:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
