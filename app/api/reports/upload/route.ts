import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString("base64")
    const fileName = `${Date.now()}-${file.name}`

    // 1. Create Report record in Turso Database (file stored as Base64)
    const report = await prisma.report.create({
      data: {
        patientId: session.user.id,
        fileName: file.name,
        fileUrl: `/api/reports/placeholder/file`, // temp placeholder
        fileData: base64Data,
        fileType: file.type || "application/pdf",
        status: "PARSED",
        reportDate: new Date(),
        labName: "Lab Partner",
      }
    })

    // Update fileUrl to serve directly from Turso database endpoint
    await prisma.report.update({
      where: { id: report.id },
      data: { fileUrl: `/api/reports/${report.id}/file` }
    })

    // 2. Mock AI Extraction — pick biomarkers and generate values
    const biomarkers = await prisma.biomarkerDefinition.findMany()

    let extracted: any[] = []

    if (biomarkers.length > 0) {
      // Pick up to 4 biomarkers and generate values near reference range
      const selectedBiomarkers = biomarkers.slice(0, 4)
      extracted = selectedBiomarkers.map(b => {
        const min = b.refMin || 10
        const max = b.refMax || 100
        const val = parseFloat((min + Math.random() * (max - min) * 1.3).toFixed(1))
        const isAbnormal = val < min || val > max
        return {
          reportId: report.id,
          biomarkerId: b.id,
          value: val,
          unit: b.unit,
          refMin: b.refMin,
          refMax: b.refMax,
          isAbnormal,
        }
      })
    }

    if (extracted.length > 0) {
      await prisma.extractedMetric.createMany({ data: extracted })
    }

    // 3. Create health record
    const hbMarker = extracted.find(e => {
      const bm = biomarkers.find(b => b.id === e.biomarkerId)
      return bm?.code === 'HEMOGLOBIN'
    })
    const ldlMarker = extracted.find(e => {
      const bm = biomarkers.find(b => b.id === e.biomarkerId)
      return bm?.code === 'LDL'
    })
    const hdlMarker = extracted.find(e => {
      const bm = biomarkers.find(b => b.id === e.biomarkerId)
      return bm?.code === 'HDL'
    })
    const glucoseMarker = extracted.find(e => {
      const bm = biomarkers.find(b => b.id === e.biomarkerId)
      return bm?.code === 'GLUCOSE_FASTING'
    })
    const trigMarker = extracted.find(e => {
      const bm = biomarkers.find(b => b.id === e.biomarkerId)
      return bm?.code === 'TRIGLYCERIDES'
    })

    await prisma.userHealthRecord.create({
      data: {
        patientId: session.user.id,
        reportId: report.id,
        hemoglobin: hbMarker?.value ?? null,
        ldl_cholesterol: ldlMarker?.value ?? null,
        hdl_cholesterol: hdlMarker?.value ?? null,
        fasting_blood_sugar: glucoseMarker?.value ?? null,
        triglycerides: trigMarker?.value ?? null,
      }
    })

    // 4. Alert if abnormal
    const abnormalMetrics = extracted.filter(e => e.isAbnormal)
    if (abnormalMetrics.length > 0) {
      const ab = abnormalMetrics[0]
      const bm = biomarkers.find(b => b.id === ab.biomarkerId)
      await prisma.healthAlert.create({
        data: {
          patientId: session.user.id,
          severity: "WARNING",
          message: `Your latest report shows abnormal levels of ${bm?.displayName || "a biomarker"}. Value: ${ab.value} ${bm?.unit || ""}.`
        }
      })
    }

    return NextResponse.json({ success: true, reportId: report.id })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 })
  }
}
