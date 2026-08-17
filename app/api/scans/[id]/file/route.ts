import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const scan = await prisma.medicalScan.findUnique({
      where: { id }
    })

    if (!scan || !scan.fileData) {
      return new Response("File not found", { status: 404 })
    }

    const buffer = Buffer.from(scan.fileData, "base64")
    const contentType = scan.fileType || "image/png"

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${scan.fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    })
  } catch (error) {
    return new Response("Error retrieving file", { status: 500 })
  }
}
