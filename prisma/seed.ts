import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

async function main() {
  console.log('Starting seed...')

  // Clean up existing data
  await prisma.appointment.deleteMany()
  await prisma.healthAlert.deleteMany()
  await prisma.extractedMetric.deleteMany()
  await prisma.report.deleteMany()
  await prisma.accessCodeUsage.deleteMany()
  await prisma.doctorAccessCode.deleteMany()
  await prisma.labBooking.deleteMany()
  await prisma.labPartner.deleteMany()
  await prisma.biomarkerDefinition.deleteMany()
  await prisma.doctorProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding Biomarkers...')
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
  ]
  const biomarkers = []
  for (const b of biomarkersData) {
    biomarkers.push(await prisma.biomarkerDefinition.create({ data: b }))
  }

  console.log('Seeding Users...')
  const patientHash = await hash('demo1234', 10)
  const patient = await prisma.user.create({
    data: {
      email: 'priya@demo.com',
      passwordHash: patientHash,
      name: 'Priya Sharma',
      role: 'PATIENT',
    }
  })

  const sankalpHash = await hash('demo1234', 10)
  const sankalp = await prisma.user.create({
    data: {
      email: 'sankalp@demo.com',
      passwordHash: sankalpHash,
      name: 'Sankalp Verma',
      role: 'PATIENT',
    }
  })

  const utkarshHash = await hash('demo1234', 10)
  const utkarsh = await prisma.user.create({
    data: {
      email: 'utkarsh@demo.com',
      passwordHash: utkarshHash,
      name: 'Utkarsh Singh',
      role: 'PATIENT',
    }
  })

  const tejasHash = await hash('demo1234', 10)
  const tejas = await prisma.user.create({
    data: {
      email: 'tejas@demo.com',
      passwordHash: tejasHash,
      name: 'Tejas Vishwakarma',
      role: 'PATIENT',
    }
  })

  const adminHash = await hash('admin1234', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@qurix.health',
      passwordHash: adminHash,
      name: 'QURIX Admin',
      role: 'ADMIN',
    }
  })

  await prisma.user.create({
    data: {
      email: 'admin@biobytes.in',
      passwordHash: adminHash,
      name: 'Admin User',
      role: 'ADMIN',
    }
  })

  const doctorHash = await hash('demo1234', 10)
  const doctor = await prisma.user.create({
    data: {
      email: 'doctor@demo.com',
      passwordHash: doctorHash,
      name: 'Dr. Rahul Verma',
      role: 'DOCTOR',
    }
  })

  await prisma.doctorProfile.create({
    data: {
      userId: doctor.id,
      licenseNumber: 'MCI-98765',
      specialization: 'General Physician',
    }
  })

  console.log('Seeding Lab Partners...')
  const labs = await Promise.all([
    prisma.labPartner.create({ data: { name: 'Dr. Lal PathLabs', commissionPct: 15.0, bookingUrl: 'https://www.lalpathlabs.com' } }),
    prisma.labPartner.create({ data: { name: 'SRL Diagnostics', commissionPct: 12.0, bookingUrl: 'https://www.srlworld.com' } }),
    prisma.labPartner.create({ data: { name: 'Thyrocare', commissionPct: 18.0, bookingUrl: 'https://www.thyrocare.com' } }),
  ])

  console.log('Seeding Reports & Metrics...')
  const now = new Date()
  const threeMonthsAgo = new Date(now)
  threeMonthsAgo.setMonth(now.getMonth() - 3)
  
  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(now.getMonth() - 6)

  // Older report (6 months ago) - Good health
  const report1 = await prisma.report.create({
    data: {
      patientId: patient.id,
      fileName: 'health_check_jan.pdf',
      fileUrl: '/uploads/health_check_jan.pdf',
      status: 'PARSED',
      reportDate: sixMonthsAgo,
      labName: 'SRL Diagnostics',
    }
  })

  // Recent report (now) - High cholesterol
  const report2 = await prisma.report.create({
    data: {
      patientId: patient.id,
      fileName: 'health_check_july.pdf',
      fileUrl: '/uploads/health_check_july.pdf',
      status: 'PARSED',
      reportDate: now,
      labName: 'Dr. Lal PathLabs',
    }
  })

  // Add metrics for report 1
  const hdl = biomarkers.find(b => b.code === 'HDL')!
  const ldl = biomarkers.find(b => b.code === 'LDL')!
  const chol = biomarkers.find(b => b.code === 'CHOLESTEROL_TOTAL')!
  const hba1c = biomarkers.find(b => b.code === 'HBA1C')!

  await prisma.extractedMetric.createMany({
    data: [
      { reportId: report1.id, biomarkerId: hdl.id, value: 55, unit: hdl.unit, refMin: hdl.refMin, refMax: hdl.refMax, isAbnormal: false },
      { reportId: report1.id, biomarkerId: ldl.id, value: 95, unit: ldl.unit, refMin: ldl.refMin, refMax: ldl.refMax, isAbnormal: false },
      { reportId: report1.id, biomarkerId: chol.id, value: 180, unit: chol.unit, refMin: chol.refMin, refMax: chol.refMax, isAbnormal: false },
      { reportId: report1.id, biomarkerId: hba1c.id, value: 5.2, unit: hba1c.unit, refMin: hba1c.refMin, refMax: hba1c.refMax, isAbnormal: false },
    ]
  })

  // Add metrics for report 2 (Abnormal)
  await prisma.extractedMetric.createMany({
    data: [
      { reportId: report2.id, biomarkerId: hdl.id, value: 45, unit: hdl.unit, refMin: hdl.refMin, refMax: hdl.refMax, isAbnormal: false },
      { reportId: report2.id, biomarkerId: ldl.id, value: 140, unit: ldl.unit, refMin: ldl.refMin, refMax: ldl.refMax, isAbnormal: true }, // High LDL
      { reportId: report2.id, biomarkerId: chol.id, value: 220, unit: chol.unit, refMin: chol.refMin, refMax: chol.refMax, isAbnormal: true }, // High Total
      { reportId: report2.id, biomarkerId: hba1c.id, value: 5.8, unit: hba1c.unit, refMin: hba1c.refMin, refMax: hba1c.refMax, isAbnormal: true }, // High HbA1c
    ]
  })

  // === SANKALP VERMA DATA ===
  const twelveMonthsAgo = new Date(now)
  twelveMonthsAgo.setMonth(now.getMonth() - 12)

  const sankalpReport1 = await prisma.report.create({
    data: {
      patientId: sankalp.id,
      fileName: 'sankalp_2025_jan.pdf',
      fileUrl: '/uploads/sankalp_2025_jan.pdf',
      status: 'PARSED',
      aiSummary: 'Patient exhibits healthy baseline metrics across lipid and glycemic profiles. No immediate interventions required.',
      reportDate: twelveMonthsAgo,
      labName: 'Thyrocare',
    }
  })

  const sankalpReport2 = await prisma.report.create({
    data: {
      patientId: sankalp.id,
      fileName: 'sankalp_2025_july.pdf',
      fileUrl: '/uploads/sankalp_2025_july.pdf',
      status: 'PARSED',
      aiSummary: 'Slight elevation in LDL Cholesterol observed. Fasting blood sugar remains stable. Advised dietary modifications.',
      reportDate: sixMonthsAgo,
      labName: 'Thyrocare',
    }
  })

  const sankalpReport3 = await prisma.report.create({
    data: {
      patientId: sankalp.id,
      fileName: 'sankalp_2026_jan.pdf',
      fileUrl: '/uploads/sankalp_2026_jan.pdf',
      status: 'PARSED',
      aiSummary: 'Significant improvement in lipid profile following dietary changes. LDL has decreased to normal levels. Vitamin D is slightly deficient, supplementation recommended.',
      reportDate: now,
      labName: 'SRL Diagnostics',
    }
  })

  const vitD = await prisma.biomarkerDefinition.create({ data: { code: 'VITAMIN_D', displayName: 'Vitamin D', unit: 'ng/mL', refMin: 20, refMax: 50, category: 'Vitamins' } })
  const vitB12 = await prisma.biomarkerDefinition.create({ data: { code: 'VITAMIN_B12', displayName: 'Vitamin B12', unit: 'pg/mL', refMin: 200, refMax: 900, category: 'Vitamins' } })
  const trig = biomarkers.find(b => b.code === 'TRIGLYCERIDES')!

  // Sankalp Report 1 (12 months ago)
  await prisma.userHealthRecord.create({
    data: {
      patientId: sankalp.id,
      reportId: sankalpReport1.id,
      hemoglobin: 14.5,
      fasting_blood_sugar: 85,
      thyroid_tsh: 2.1,
      ldl_cholesterol: 90,
      hdl_cholesterol: 60,
      triglycerides: 110,
      vitamin_d: 35,
      vitamin_b12: 450,
      createdAt: twelveMonthsAgo,
    }
  })

  // Sankalp Report 2 (6 months ago)
  await prisma.userHealthRecord.create({
    data: {
      patientId: sankalp.id,
      reportId: sankalpReport2.id,
      hemoglobin: 14.2,
      fasting_blood_sugar: 88,
      thyroid_tsh: 2.3,
      ldl_cholesterol: 135,
      hdl_cholesterol: 55,
      triglycerides: 140,
      vitamin_d: 28,
      vitamin_b12: 400,
      createdAt: sixMonthsAgo,
    }
  })

  // Sankalp Report 3 (Now)
  await prisma.userHealthRecord.create({
    data: {
      patientId: sankalp.id,
      reportId: sankalpReport3.id,
      hemoglobin: 14.8,
      fasting_blood_sugar: 82,
      thyroid_tsh: 1.9,
      ldl_cholesterol: 95,
      hdl_cholesterol: 65,
      triglycerides: 90,
      vitamin_d: 18,
      vitamin_b12: 350,
      createdAt: now,
    }
  })

  // === UTKARSH SINGH DATA ===
  const utkarshReport1 = await prisma.report.create({
    data: {
      patientId: utkarsh.id,
      fileName: 'utkarsh_blood_test.pdf',
      fileUrl: '/uploads/utkarsh_blood_test.pdf',
      status: 'PARSED',
      aiSummary: 'Hemoglobin levels are within the healthy normal range. No other tests were provided in this report.',
      reportDate: now,
      labName: 'SRL Diagnostics',
    }
  })

  // Utkarsh Report - Only Hemoglobin
  await prisma.userHealthRecord.create({
    data: {
      patientId: utkarsh.id,
      reportId: utkarshReport1.id,
      hemoglobin: 15.2,
      createdAt: now,
    }
  })

  console.log('Seeding Alerts...')
  await prisma.healthAlert.create({
    data: {
      patientId: patient.id,
      severity: 'WARNING',
      message: 'Your recent blood reports show abnormalities in LDL Cholesterol (140 mg/dL). Please connect with a doctor.',
    }
  })

  console.log('Seeding Access Codes...')
  const expiry = new Date(now)
  expiry.setDate(now.getDate() + 7) // Valid for 7 days
  
  await prisma.doctorAccessCode.create({
    data: {
      patientId: patient.id,
      code: '123456',
      expiresAt: expiry,
      maxUses: 10,
    }
  })

  console.log('Seeding Appointments...')
  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      scheduledTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      status: 'PENDING',
      accessCode: '123456',
    }
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
