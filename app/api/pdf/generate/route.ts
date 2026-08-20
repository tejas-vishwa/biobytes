import { NextResponse } from "next/server"
import { generateUserReport } from "@/lib/report-generator"
import { QurixPlusReportData } from "@/components/pdf/QurixPlusTemplate"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const data: QurixPlusReportData = await req.json()
    
    if (!data || !data.patientProfile || !data.currentTrends) {
      return NextResponse.json({ error: "Invalid payload format. Must match QurixPlusReportData schema." }, { status: 400 })
    }

    // In a real application, you might extract userId from session or request
    // and fetch additional database metadata. Here we pass a mock ID or use the UHI
    const userId = data.patientProfile.uhiId || "UNKNOWN_USER"

    // Generate the raw HTML string for the PDF export using React Templating
    const htmlReport = generateUserReport(userId, data)

    // Option A: Return the HTML directly for the browser to render and print.
    // Option B (if using Puppeteer backend): We would pipe this htmlReport string into page.setContent(htmlReport)
    
    // We return the raw HTML with the correct content type
    return new NextResponse(htmlReport, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        // We can add a print directive script just like the static template
      }
    })
  } catch (error: any) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
