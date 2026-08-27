const { PrismaClient } = require('@prisma/client')
const { PrismaLibSQL } = require('@prisma/adapter-libsql')
const { createClient } = require('@libsql/client')

function getValidTursoUrl() {
  const raw = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || process.env.TURSO_URL
  if (raw && raw !== 'undefined' && raw.trim() !== '') {
    return raw.trim()
  }
  return 'file:./dev.db'
}

function getValidTursoToken() {
  const raw = process.env.TURSO_AUTH_TOKEN
  if (raw && raw !== 'undefined' && raw.trim() !== '') {
    return raw.trim()
  }
  return undefined
}

const tursoUrl = getValidTursoUrl()
const tursoToken = getValidTursoToken()

const libsql = createClient({
  url: tursoUrl,
  authToken: tursoToken,
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })


async function main() {
  const patient = await prisma.user.findFirst({ where: { email: 'utkarsh@demo.com' } }) || await prisma.user.findFirst({ where: { role: 'PATIENT' } });
  if (!patient) return console.log("No patient found");

  const dates = [
    new Date('2026-02-14T10:00:00Z'),
    new Date('2026-03-15T10:00:00Z'),
    new Date('2026-04-15T10:00:00Z'),
    new Date('2026-05-15T10:00:00Z'),
    new Date('2026-06-15T10:00:00Z'),
    new Date('2026-07-15T10:00:00Z'),
    new Date('2026-08-01T10:00:00Z'),
    new Date('2026-08-09T10:00:00Z'),
    new Date('2026-08-15T10:00:00Z')
  ];

  // Create reports for these dates
  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const report = await prisma.report.create({
      data: {
        patientId: patient.id,
        fileName: `historical_report_${i}.pdf`,
        fileUrl: `/uploads/historical_report_${i}.pdf`,
        status: 'PARSED',
        aiSummary: 'Historical report imported.',
        reportDate: d,
        labName: 'Apollo Diagnostics'
      }
    });

    const getVal = (base, variance) => parseFloat((base + (Math.random() * variance * 2 - variance)).toFixed(1));

    await prisma.userHealthRecord.create({
      data: {
        patientId: patient.id,
        reportId: report.id,
        createdAt: d,
        hemoglobin: getVal(13.5, 1.5),
        fasting_blood_sugar: getVal(85, 10),
        ldl_cholesterol: getVal(110, 20),
        thyroid_tsh: i >= 4 ? getVal(2.5, 1.5) : null,
        vitamin_d: i >= 4 && i <= 7 ? getVal(40, 15) : null,
        vitamin_b12: i === 4 ? 435 : null,
      }
    });
    
    // Total Cholesterol (must use ExtractedMetric)
    const metricsToCreate = [];
    
    const pushMetric = async (code, val) => {
        let b = await prisma.biomarkerDefinition.findFirst({ where: { code } });
        if (!b) {
            b = await prisma.biomarkerDefinition.create({
               data: {
                   code,
                   displayName: code,
                   category: 'Imported',
                   unit: ''
               }
            });
        }
        metricsToCreate.push({
            reportId: report.id,
            biomarkerId: b.id,
            value: val,
            unit: b.unit,
            refMin: b.refMin,
            refMax: b.refMax,
            isAbnormal: false
        })
    }

    await pushMetric('CHOLESTEROL_TOTAL', getVal(180, 20));
    if (i === 4 || i === 5) {
      await pushMetric('CALCIUM', getVal(9.5, 0.5));
    }

    if (metricsToCreate.length > 0) {
      await prisma.extractedMetric.createMany({ data: metricsToCreate });
    }
  }
  
  console.log("Injected exact dates for first patient!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
