import { prisma } from "./prisma"
import { hash } from "bcryptjs"

export async function seedDatabase() {
  try {
    // Check if user table exists and has demo user
    const existingPatient = await prisma.user.findFirst({
      where: { email: "priya@demo.com" }
    })

    if (existingPatient) {
      return { success: true, message: "Database is already seeded with demo accounts." }
    }

    console.log("Seeding database...")

    // 1. Seed Biomarkers
    const biomarkersData = [
      { code: 'HEMOGLOBIN', displayName: 'Hemoglobin', unit: 'g/dL', refMin: 12.0, refMax: 15.5, category: 'CBC' },
      { code: 'RBC', displayName: 'Red Blood Cells', unit: 'mill/µL', refMin: 4.1, refMax: 5.1, category: 'CBC' },
      { code: 'WBC', displayName: 'White Blood Cells', unit: 'thou/µL', refMin: 4.5, refMax: 11.0, category: 'CBC' },
      { code: 'PLATELETS', displayName: 'Platelets', unit: 'thou/µL', refMin: 150, refMax: 450, category: 'CBC' },
      { code: 'GLUCOSE_FASTING', displayName: 'Fasting Glucose', unit: 'mg/dL', refMin: 70, refMax: 99, category: 'Diabetes' },
      { code: 'HBA1C', displayName: 'HbA1c', unit: '%', refMin: 4.0, refMax: 5.6, category: 'Diabetes' },
      { code: 'CHOLESTEROL_TOTAL', displayName: 'Total Cholesterol', unit: 'mg/dL', refMin: 125, refMax: 200, category: 'Lipid' },
      { code: 'LDL', displayName: 'LDL Cholesterol', unit: 'mg/dL', refMin: 0, refMax: 99, category: 'Lipid' },
      { code: 'HDL', displayName: 'HDL Cholesterol', unit: 'mg/dL', refMin: 40, refMax: 60, category: 'Lipid' },
      { code: 'TRIGLYCERIDES', displayName: 'Triglycerides', unit: 'mg/dL', refMin: 0, refMax: 149, category: 'Lipid' },
      { code: 'VITAMIN_D', displayName: 'Vitamin D', unit: 'ng/mL', refMin: 20, refMax: 50, category: 'Vitamins' },
      { code: 'VITAMIN_B12', displayName: 'Vitamin B12', unit: 'pg/mL', refMin: 200, refMax: 900, category: 'Vitamins' },
    ]

    for (const b of biomarkersData) {
      const existing = await prisma.biomarkerDefinition.findFirst({ where: { code: b.code } })
      if (!existing) {
        await prisma.biomarkerDefinition.create({ data: b })
      }
    }

    const biomarkers = await prisma.biomarkerDefinition.findMany()

    // 2. Seed Users
    const demoPasswordHash = await hash("demo1234", 10)
    const adminPasswordHash = await hash("admin1234", 10)
    const superAdminPasswordHash = await hash("BB@1234@QURIX", 10)

    const priya = await prisma.user.upsert({
      where: { email: "priya@demo.com" },
      update: {},
      create: { email: "priya@demo.com", passwordHash: demoPasswordHash, name: "Priya Sharma", role: "PATIENT" }
    })

    const sankalp = await prisma.user.upsert({
      where: { email: "sankalp@demo.com" },
      update: {},
      create: { email: "sankalp@demo.com", passwordHash: demoPasswordHash, name: "Sankalp Verma", role: "PATIENT" }
    })

    const utkarsh = await prisma.user.upsert({
      where: { email: "utkarsh@demo.com" },
      update: {},
      create: { email: "utkarsh@demo.com", passwordHash: demoPasswordHash, name: "Utkarsh Singh", role: "PATIENT" }
    })

    await prisma.user.upsert({
      where: { email: "tejas@demo.com" },
      update: {},
      create: { email: "tejas@demo.com", passwordHash: demoPasswordHash, name: "Tejas Vishwakarma", role: "PATIENT" }
    })

    await prisma.user.upsert({
      where: { email: "admin@biobytes.in" },
      update: {},
      create: { email: "admin@biobytes.in", passwordHash: adminPasswordHash, name: "Admin User", role: "ADMIN" }
    })

    await prisma.user.upsert({
      where: { email: "admin@teambiobytes.com" },
      update: {},
      create: { email: "admin@teambiobytes.com", passwordHash: superAdminPasswordHash, name: "Super Admin", role: "ADMIN" }
    })

    const doctor = await prisma.user.upsert({
      where: { email: "doctor@demo.com" },
      update: {},
      create: { email: "doctor@demo.com", passwordHash: demoPasswordHash, name: "Dr. Rahul Verma", role: "DOCTOR" }
    })

    // Doctor profile
    const docProfile = await prisma.doctorProfile.findUnique({ where: { userId: doctor.id } })
    if (!docProfile) {
      await prisma.doctorProfile.create({
        data: { userId: doctor.id, licenseNumber: "MCI-98765", specialization: "General Physician" }
      })
    }

    // 3. Seed Lab Partners
    const labData = [
      { name: 'Dr. Lal PathLabs', commissionPct: 15.0, bookingUrl: 'https://www.lalpathlabs.com' },
      { name: 'SRL Diagnostics', commissionPct: 12.0, bookingUrl: 'https://www.srlworld.com' },
      { name: 'Thyrocare', commissionPct: 18.0, bookingUrl: 'https://www.thyrocare.com' },
    ]

    for (const l of labData) {
      const existingLab = await prisma.labPartner.findFirst({ where: { name: l.name } })
      if (!existingLab) {
        await prisma.labPartner.create({ data: l })
      }
    }

    // 4. Seed Reports & Metrics for Priya
    const now = new Date()
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(now.getMonth() - 6)

    const existingPriyaReport = await prisma.report.findFirst({ where: { patientId: priya.id } })
    if (!existingPriyaReport) {
      const report1 = await prisma.report.create({
        data: {
          patientId: priya.id,
          fileName: 'health_check_july.pdf',
          fileUrl: '/uploads/health_check_july.pdf',
          status: 'PARSED',
          reportDate: now,
          labName: 'Dr. Lal PathLabs',
        }
      })

      const hdl = biomarkers.find(b => b.code === 'HDL')!
      const ldl = biomarkers.find(b => b.code === 'LDL')!
      const chol = biomarkers.find(b => b.code === 'CHOLESTEROL_TOTAL')!
      const hba1c = biomarkers.find(b => b.code === 'HBA1C')!

      if (hdl && ldl && chol && hba1c) {
        await prisma.extractedMetric.createMany({
          data: [
            { reportId: report1.id, biomarkerId: hdl.id, value: 45, unit: hdl.unit, refMin: hdl.refMin, refMax: hdl.refMax, isAbnormal: false },
            { reportId: report1.id, biomarkerId: ldl.id, value: 140, unit: ldl.unit, refMin: ldl.refMin, refMax: ldl.refMax, isAbnormal: true },
            { reportId: report1.id, biomarkerId: chol.id, value: 220, unit: chol.unit, refMin: chol.refMin, refMax: chol.refMax, isAbnormal: true },
            { reportId: report1.id, biomarkerId: hba1c.id, value: 5.8, unit: hba1c.unit, refMin: hba1c.refMin, refMax: hba1c.refMax, isAbnormal: true },
          ]
        })
      }

      await prisma.healthAlert.create({
        data: {
          patientId: priya.id,
          severity: 'WARNING',
          message: 'Your recent blood reports show abnormalities in LDL Cholesterol (140 mg/dL). Please connect with a doctor.',
        }
      })
    }

    // 5. Seed Doctor Access Code
    const existingCode = await prisma.doctorAccessCode.findFirst({ where: { patientId: priya.id } })
    if (!existingCode) {
      const expiry = new Date(now)
      expiry.setDate(now.getDate() + 7)
      await prisma.doctorAccessCode.create({
        data: {
          patientId: priya.id,
          code: '123456',
          expiresAt: expiry,
          maxUses: 10,
        }
      })
    }

    return { success: true, message: "Database successfully seeded with demo accounts!" }
  } catch (error: any) {
    console.error("Database seeding error:", error)
    return { success: false, error: error?.message || "Failed to seed database" }
  }
}
