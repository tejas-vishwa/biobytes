import { prisma } from "./prisma"
import { hash } from "bcryptjs"

export async function createTablesIfNotExist() {
  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "name" TEXT,
      "role" TEXT NOT NULL DEFAULT 'PATIENT',
      "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "DoctorProfile" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "licenseNumber" TEXT NOT NULL,
      "specialization" TEXT,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Report" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "patientId" TEXT NOT NULL,
      "fileName" TEXT NOT NULL,
      "fileUrl" TEXT NOT NULL,
      "fileData" TEXT,
      "fileType" TEXT,
      "status" TEXT NOT NULL DEFAULT 'UPLOADED',
      "rawText" TEXT,
      "parsedJson" TEXT,
      "aiSummary" TEXT,
      "reportDate" DATETIME,
      "labName" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "BiomarkerDefinition" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "displayName" TEXT NOT NULL,
      "unit" TEXT NOT NULL,
      "refMin" REAL,
      "refMax" REAL,
      "category" TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS "ExtractedMetric" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "reportId" TEXT NOT NULL,
      "biomarkerId" TEXT NOT NULL,
      "value" REAL NOT NULL,
      "unit" TEXT NOT NULL,
      "refMin" REAL,
      "refMax" REAL,
      "isAbnormal" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE,
      FOREIGN KEY ("biomarkerId") REFERENCES "BiomarkerDefinition" ("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "DoctorAccessCode" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "patientId" TEXT NOT NULL,
      "code" TEXT NOT NULL UNIQUE,
      "expiresAt" DATETIME NOT NULL,
      "maxUses" INTEGER NOT NULL DEFAULT 5,
      "usedCount" INTEGER NOT NULL DEFAULT 0,
      "isRevoked" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "AccessCodeUsage" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "codeId" TEXT NOT NULL,
      "accessedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "ipAddress" TEXT,
      FOREIGN KEY ("codeId") REFERENCES "DoctorAccessCode" ("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "HealthAlert" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "patientId" TEXT NOT NULL,
      "metricId" TEXT,
      "severity" TEXT NOT NULL DEFAULT 'INFO',
      "message" TEXT NOT NULL,
      "isRead" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "LabPartner" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "logoUrl" TEXT,
      "bookingUrl" TEXT,
      "commissionPct" REAL NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS "LabBooking" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "patientId" TEXT NOT NULL,
      "labId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE CASCADE,
      FOREIGN KEY ("labId") REFERENCES "LabPartner" ("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Appointment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "patientId" TEXT NOT NULL,
      "doctorId" TEXT NOT NULL,
      "scheduledTime" DATETIME NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "accessCode" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE CASCADE,
      FOREIGN KEY ("doctorId") REFERENCES "User" ("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "UserHealthRecord" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "reportId" TEXT NOT NULL UNIQUE,
      "patientId" TEXT NOT NULL,
      "hemoglobin" REAL,
      "fasting_blood_sugar" REAL,
      "thyroid_tsh" REAL,
      "ldl_cholesterol" REAL,
      "hdl_cholesterol" REAL,
      "triglycerides" REAL,
      "vitamin_d" REAL,
      "vitamin_b12" REAL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE,
      FOREIGN KEY ("patientId") REFERENCES "User" ("id") ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "ActivityLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "action" TEXT NOT NULL,
      "details" TEXT,
      "userId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL
    );`
  ]

  for (const statement of ddlStatements) {
    try {
      await prisma.$executeRawUnsafe(statement)
    } catch (err) {
      console.warn("Table DDL execution note:", err)
    }
  }
}

export async function seedDatabase() {
  try {
    // 0. Ensure tables exist in Turso
    await createTablesIfNotExist()

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

      const hdl = biomarkers.find(b => b.code === 'HDL')
      const ldl = biomarkers.find(b => b.code === 'LDL')
      const chol = biomarkers.find(b => b.code === 'CHOLESTEROL_TOTAL')
      const hba1c = biomarkers.find(b => b.code === 'HBA1C')

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

    return { success: true, message: "Database successfully created and seeded with demo accounts!" }
  } catch (error: any) {
    console.error("Database seeding error:", error)
    return { success: false, error: error?.message || "Failed to seed database" }
  }
}
