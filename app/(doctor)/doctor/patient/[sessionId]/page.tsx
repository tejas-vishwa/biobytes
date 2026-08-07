import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, User, FileText } from "lucide-react"
import { PatientTrendsDashboard } from "@/components/PatientTrendsDashboard"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function DoctorPatientView({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId: code } = await params

  // Validate the code
  const accessCode = await prisma.doctorAccessCode.findUnique({
    where: { code },
    include: { patient: true }
  })

  if (!accessCode || accessCode.isRevoked || accessCode.expiresAt < new Date()) {
    notFound()
  }

  const patientId = accessCode.patientId
  const patient = accessCode.patient

  // Fetch 6 months of reports
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const reports = await prisma.report.findMany({
    where: { patientId, reportDate: { gte: sixMonthsAgo } },
    orderBy: { reportDate: 'desc' }
  })

  const metrics = await prisma.extractedMetric.findMany({
    where: {
      report: { patientId, reportDate: { gte: sixMonthsAgo } }
    },
    include: { biomarker: true, report: true },
    orderBy: { report: { reportDate: 'desc' } }
  })

  // Fetch AI extracted health records
  const healthRecords = await prisma.userHealthRecord.findMany({
    where: { patientId },
    include: { report: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-100 dark:bg-emerald-800 p-3 rounded-full">
            <User className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{patient.name}</h1>
            <p className="text-muted-foreground text-sm">{patient.email} | Shared via Access Code</p>
          </div>
        </div>
        <div className="text-right text-sm text-emerald-700 dark:text-emerald-400 font-medium">
          Session expires: {new Date(accessCode.expiresAt).toLocaleString()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-destructive" /> Abnormal Flags (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.filter(m => m.isAbnormal).length === 0 ? (
              <p className="text-muted-foreground">No abnormal biomarkers found.</p>
            ) : (
              <ul className="space-y-3">
                {metrics.filter(m => m.isAbnormal).map(m => (
                  <li key={m.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium">{m.biomarker.displayName}</span>
                      <p className="text-xs text-muted-foreground">{new Date(m.report.reportDate!).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-destructive">{m.value} {m.unit}</span>
                      <p className="text-xs text-muted-foreground">Ref: {m.refMin}-{m.refMax}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest Health Summary */}
      <Card className="bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Latest Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports[0]?.aiSummary ? (
            <p className="text-sm leading-relaxed">{reports[0].aiSummary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No AI summary available.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Reports History
            </CardTitle>
          </CardHeader>
          <CardContent>
             {reports.length === 0 ? (
              <p className="text-muted-foreground">No reports found.</p>
            ) : (
              <ul className="space-y-3">
                {reports.map(r => (
                  <li key={r.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                    <div>
                      <span className="font-medium">{r.labName || "Lab Report"}</span>
                      <p className="text-xs text-muted-foreground">{new Date(r.reportDate!).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                      Available
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clinical Recharts View for Doctor */}
      <Card>
        <CardHeader>
          <CardTitle>Biomarker Trends Overview</CardTitle>
          <CardDescription>Clinical visualizations of patient biomarker history.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-0 bg-transparent shadow-none">
          <PatientTrendsDashboard accessCode={code} />
        </CardContent>
      </Card>

      {/* Raw AI JSON Records */}
      <Card>
        <CardHeader>
          <CardTitle>Raw AI-Extracted JSON Records</CardTitle>
          <CardDescription>Direct, strict-schema extractions mapped to hardcoded database columns.</CardDescription>
        </CardHeader>
        <CardContent>
          {healthRecords.length === 0 ? (
            <p className="text-muted-foreground">No AI-extracted records available.</p>
          ) : (
            <div className="space-y-4">
              {healthRecords.map(hr => (
                <div key={hr.id} className="border rounded-md p-4 bg-slate-950 text-slate-300 font-mono text-sm overflow-x-auto">
                  <p className="text-emerald-400 mb-2 border-b border-slate-800 pb-2">
                    Report Date: {new Date(hr.report.reportDate || hr.createdAt).toLocaleDateString()}
                  </p>
                  <pre>
                    {JSON.stringify({
                      hemoglobin: hr.hemoglobin,
                      fasting_blood_sugar: hr.fasting_blood_sugar,
                      thyroid_tsh: hr.thyroid_tsh,
                      raw_json: hr.report.parsedJson ? JSON.parse(hr.report.parsedJson) : null
                    }, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
