import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BIOMARKERS_100 } from "@/lib/biomarkers100"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const months = parseInt(searchParams.get("months") || "6")
  const accessCode = searchParams.get("accessCode")

  let targetPatientId = session.user.id

  if (session.user.role === "DOCTOR") {
    if (!accessCode) {
      return new Response("Doctor requires accessCode query parameter", { status: 400 })
    }
    const access = await prisma.doctorAccessCode.findUnique({
      where: { code: accessCode }
    })
    if (!access || access.isRevoked || access.expiresAt < new Date()) {
      return new Response("Invalid, expired, or revoked access code", { status: 403 })
    }
    targetPatientId = access.patientId
  } else if (session.user.role !== "PATIENT") {
    return new Response("Unauthorized", { status: 401 })
  }

  const dateLimit = new Date()
  if (months === 3) dateLimit.setDate(dateLimit.getDate() - 90)
  else if (months === 6) dateLimit.setDate(dateLimit.getDate() - 180)
  else dateLimit.setDate(dateLimit.getDate() - 365)

  // 1. Initialize all 100 tests with empty history arrays
  const trendsByCode: Record<string, any> = {}
  
  BIOMARKERS_100.forEach(b => {
    trendsByCode[b.code] = {
      name: b.name,
      code: b.code,
      category: b.category,
      unit: b.unit,
      refMin: b.refMin,
      refMax: b.refMax,
      history: []
    }
  })

  // 2. Fetch data from ExtractedMetric
  const metrics = await prisma.extractedMetric.findMany({
    where: {
      report: {
        patientId: targetPatientId,
        reportDate: { gte: dateLimit }
      }
    },
    include: {
      biomarker: true,
      report: {
        select: { reportDate: true, labName: true }
      }
    },
    orderBy: {
      report: { reportDate: 'asc' }
    }
  })

  metrics.forEach(m => {
    if (trendsByCode[m.biomarker.code]) {
      trendsByCode[m.biomarker.code].history.push({
        id: m.id,
        date: m.report.reportDate?.toISOString(),
        value: m.value,
        isAbnormal: m.isAbnormal,
        labName: m.report.labName || "Lab Report"
      })
    }
  })

  // 3. Fetch legacy data from UserHealthRecord
  const healthRecords = await prisma.userHealthRecord.findMany({
    where: { 
      patientId: targetPatientId, 
      report: { reportDate: { gte: dateLimit } }
    },
    include: { report: { select: { reportDate: true, labName: true } } },
    orderBy: { report: { reportDate: 'asc' } }
  })

  healthRecords.forEach(hr => {
    const dateStr = hr.report?.reportDate?.toISOString() || hr.createdAt.toISOString()
    const labName = hr.report?.labName || "Lab Report"
    const id = hr.id
    
    const pushLegacy = (code: string, value: number) => {
      if (trendsByCode[code]) {
        trendsByCode[code].history.push({ id, date: dateStr, value, isAbnormal: false, labName })
      }
    }

    if (hr.hemoglobin !== null) pushLegacy("HEMOGLOBIN", hr.hemoglobin)
    if (hr.fasting_blood_sugar !== null) pushLegacy("GLUCOSE_FASTING", hr.fasting_blood_sugar)
    if (hr.thyroid_tsh !== null) pushLegacy("TSH", hr.thyroid_tsh)
    if (hr.ldl_cholesterol !== null) pushLegacy("LDL", hr.ldl_cholesterol)
    if (hr.hdl_cholesterol !== null) pushLegacy("HDL", hr.hdl_cholesterol)
    if (hr.triglycerides !== null) pushLegacy("TRIGLYCERIDES", hr.triglycerides)
    if (hr.vitamin_d !== null) pushLegacy("VITAMIN_D", hr.vitamin_d)
    if (hr.vitamin_b12 !== null) pushLegacy("VITAMIN_B12", hr.vitamin_b12)
  })

  // 4. Clean and sort all histories
  const finalTrends = Object.values(trendsByCode).map((trend: any) => {
    // Deduplicate exact data points
    const uniqueData = new Map()
    trend.history.forEach((d: any) => {
      const key = `${d.date}_${d.value}`
      if (!uniqueData.has(key)) {
        uniqueData.set(key, d)
      }
    })
    trend.history = Array.from(uniqueData.values())
    // Sort chronologically
    trend.history.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Filter out data outside the requested timeframe
    trend.history = trend.history.filter((d: any) => new Date(d.date) >= dateLimit)

    return trend
  })

  return NextResponse.json(finalTrends)
}
