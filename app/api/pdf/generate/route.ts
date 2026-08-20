import { NextResponse } from "next/server"
import { generateUserReport } from "@/lib/report-generator"
import { BespokeReportData } from "@/components/pdf/BespokeHealthReportTemplate"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const data: BespokeReportData = await req.json()
    
    if (!data || !data.patientDemographics || !data.currentFlags) {
      return NextResponse.json({ error: "Invalid payload format. Must match BespokeReportData schema." }, { status: 400 })
    }

    // Extract userId
    const userId = data.patientDemographics.uhiId || "UNKNOWN_USER"

    // Optionally generate AI Summary
    try {
      const { GoogleGenAI } = await import('@google/genai')
      const apiKey = process.env.GEMINI_API_KEY
      
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey })
        const prompt = `
          You are a senior clinical analyst. Write a concise, professional 3-sentence executive summary for a patient's health report.
          Patient: ${data.patientDemographics.age}yo ${data.patientDemographics.gender}
          Conditions: ${data.documentedConditions.map(c => c.condition).join(', ')}
          Current Flags (Biomarkers out of range or optimal): ${JSON.stringify(data.currentFlags.map(f => ({ biomarker: f.biomarker, status: f.status, value: f.currentValue })))}
          
          If there are critical flags, explicitly correlate them to any known conditions and urge immediate medical review.
          If all is optimal, commend their management of conditions and advise continuing maintenance.
          Do not include any formatting, markdown, or greetings. Just the raw summary paragraph.
        `
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        })
        
        if (response.text) {
          data.aiSummary = response.text.trim()
        }
      }
    } catch (aiError) {
      console.error("Failed to generate AI summary, falling back to algorithmic logic:", aiError)
    }

    // Generate the raw HTML string for the PDF export using React Templating
    const htmlReport = await generateUserReport(userId, data)

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
