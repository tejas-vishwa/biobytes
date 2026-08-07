import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Tesseract from "tesseract.js"
import { extractText } from "unpdf"

export const dynamic = "force-dynamic"
export const maxDuration = 60 // Allow longer execution time for Vercel Serverless

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the user still exists in the database (handles stale JWT cookies after a DB reset)
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!userExists) {
      return NextResponse.json({ error: "Your session is invalid or the account was deleted. Please log out and log back in." }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimeType = file.type

    let extractedText = ""

    if (mimeType === "application/pdf") {
      const uint8Array = new Uint8Array(buffer)
      const pdfData = await extractText(uint8Array)
      if (typeof pdfData === 'string') {
        extractedText = pdfData
      } else if (pdfData && typeof pdfData === 'object' && 'text' in pdfData) {
        const textObj = (pdfData as any).text
        extractedText = Array.isArray(textObj) ? textObj.join('\n') : (textObj || "")
      } else if (Array.isArray(pdfData as any)) {
        extractedText = (pdfData as any).join('\n')
      }
    } else if (mimeType.startsWith("image/")) {
      const result = await Tesseract.recognize(buffer, "eng")
      extractedText = result.data.text
    } else {
      return NextResponse.json({ error: "Unsupported file type. Please upload a PDF, JPG, or PNG." }, { status: 400 })
    }

    if (typeof extractedText !== 'string') {
      extractedText = String(extractedText)
    }

    if (!extractedText.trim()) {
      throw new Error("Could not extract any text from the document.")
    }

    // REGEX PARSING LOGIC
    const parsedData: any = {
      patient_name: null,
      lab_name: "BioBytes Automated Lab",
      report_date: new Date().toISOString().split('T')[0],
      overall_summary: "Automated extraction using Tesseract.js and PDF-Parse.",
      biomarkers: []
    }

    // Try to extract patient name
    const nameMatch = extractedText.match(/(?:name|patient name|patient)\s*[:\-]?\s*([A-Za-z\s\.]+)/i)
    if (nameMatch && nameMatch[1]) {
      let rawName = nameMatch[1].trim().substring(0, 50)
      rawName = rawName.replace(/^(mr\.|mrs\.|ms\.|dr\.|mr|mrs|ms|dr)\s+/i, '').trim()
      parsedData.patient_name = rawName
    }

    // Try to extract Report Date
    let reportDateMatch = extractedText.match(/(?:date|registered on|collected on|collection date|reported on)[\s\:\-]*(\d{1,2}[\/\-][a-zA-Z]{3,4}[\/\-]\d{2,4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[a-zA-Z]{3,10}\s+\d{2,4}|[a-zA-Z]{3,10}\s+\d{1,2},?\s+\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i)
    if (!reportDateMatch) {
      // Fallback: just find the first date looking string in the document
      reportDateMatch = extractedText.match(/\b(\d{1,2}[\/\-][a-zA-Z]{3,4}[\/\-]\d{2,4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[a-zA-Z]{3,10}\s+\d{2,4}|[a-zA-Z]{3,10}\s+\d{1,2},?\s+\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/i)
    }
    
    if (reportDateMatch && reportDateMatch[1]) {
      try {
        let dateStr = reportDateMatch[1].replace(/[\/\-]/g, ' ').replace(/,/g, '').trim()
        let parsedDate: Date
        
        const parts = dateStr.split(/\s+/)
        if (parts.length === 3 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1])) && !isNaN(Number(parts[2]))) {
           let p1 = parts[0]
           let p2 = parts[1]
           let p3 = parts[2]
           
           if (p1.length === 4) {
             // YYYY MM DD
             parsedDate = new Date(`${p1}-${p2.padStart(2, '0')}-${p3.padStart(2, '0')}T00:00:00Z`)
           } else {
             // DD MM YYYY
             let year = p3
             if (year.length === 2) year = "20" + year
             parsedDate = new Date(`${year}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}T00:00:00Z`)
           }
        } else {
           parsedDate = new Date(dateStr)
        }

        if (!isNaN(parsedDate.getTime())) {
          parsedData.report_date = parsedDate.toISOString().split('T')[0]
        }
      } catch (e) {
        // Ignore and keep default today's date
      }
    }

    // Try to extract Lab Name
    const labMatch = extractedText.match(/(Dr\s*Lal\s*PathLabs|Apollo\s*Diagnostics|Thyrocare|SRL\s*Diagnostics|Metropolis|Redcliffe|Max\s*Healthcare|Suburban\s*Diagnostics|Tata\s*1mg|Lucid\s*Medical|Vijaya\s*Diagnostic|[A-Za-z0-9\s]{3,25}(?:Diagnostics|Pathology|Labs|Laboratory|Clinic))/i)
    if (labMatch && labMatch[0]) {
      parsedData.lab_name = labMatch[0].trim().substring(0, 40)
    }

    // Import BIOMARKERS_100 at the top of the file ideally, but for now we'll require it here or ensure it's imported.
    const { BIOMARKERS_100 } = require('@/lib/biomarkers100');
    
    // Variables for UserHealthRecord legacy table
    let hr_hemoglobin: number | null = null;
    let hr_fasting_blood_sugar: number | null = null;
    let hr_total_cholesterol: number | null = null;
    let hr_ldl_cholesterol: number | null = null;
    let hr_thyroid_tsh: number | null = null;
    let hr_vitamin_d: number | null = null;
    let hr_vitamin_b12: number | null = null;
    let hr_calcium: number | null = null;

    // Universal Dynamic Extraction Engine
    BIOMARKERS_100.forEach((b: any) => {
      // Create a flexible regex based on the biomarker's name
      // e.g., for "Total Cholesterol", we look for "Total Cholesterol" followed by any characters, then a number.
      // We safely escape the biomarker name.
      const safeName = b.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Some special cases for robust matching (e.g., abbreviations)
      let patterns = [new RegExp(`(?:${safeName})[^\\d]{0,40}?([\\d\\.]+)`, 'i')];
      
      if (b.code === 'HEMOGLOBIN') patterns.push(/(?:hb|haemoglobin)[^\d]{0,40}?([\d\.]+)/i);
      if (b.code === 'GLUCOSE_FASTING') patterns.push(/(?:fbs|fpg)[^\d]{0,40}?([\d\.]+)/i);
      if (b.code === 'CHOLESTEROL_TOTAL') patterns.push(/(?<!LDL\s*|HDL\s*|VLDL\s*)(?:Total\s*)?Cholesterol(?:\s*\(?Total\)?)?[^\d]{0,40}?([\d\.]+)/i);
      if (b.code === 'TSH') patterns.push(/(?:thyroid stimulating hormone)[^\d]{0,40}?([\d\.]+)/i);
      
      let matchedValue: number | null = null;
      for (const regex of patterns) {
        const match = extractedText.match(regex);
        if (match && match[1]) {
          const value = parseFloat(match[1]);
          if (!isNaN(value)) {
            parsedData.biomarkers.push({
              name: b.name,
              code: b.code,
              value,
              unit: b.unit,
              isAbnormal: false
            });
            matchedValue = value;
            break;
          }
        }
      }

      // Preserve legacy routing for UserHealthRecord
      if (matchedValue !== null) {
        if (b.code === 'HEMOGLOBIN') hr_hemoglobin = matchedValue;
        if (b.code === 'GLUCOSE_FASTING') hr_fasting_blood_sugar = matchedValue;
        if (b.code === 'CHOLESTEROL_TOTAL') hr_total_cholesterol = matchedValue;
        if (b.code === 'LDL') hr_ldl_cholesterol = matchedValue;
        if (b.code === 'TSH') hr_thyroid_tsh = matchedValue;
        if (b.code === 'VITAMIN_D') hr_vitamin_d = matchedValue;
        if (b.code === 'VITAMIN_B12') hr_vitamin_b12 = matchedValue;
        if (b.code === 'CALCIUM') hr_calcium = matchedValue;
      }
    });

    // Ensure we generate some AI Summary text so it's not empty on the dashboard
    const abnormalities = parsedData.biomarkers.filter((b: any) => b.isAbnormal)
    if (parsedData.biomarkers.length > 0) {
      parsedData.overall_summary = `Successfully extracted ${parsedData.biomarkers.length} health metrics (e.g. ${parsedData.biomarkers.map((b: any) => b.name).join(", ")}). Please consult with your doctor for a detailed clinical assessment.`
    } else {
      parsedData.overall_summary = "Could not extract standard biomarkers. Please ensure the PDF is a standard lab report."
    }

    // Identity Verification
    let reportPatientName = (parsedData.patient_name || "").toLowerCase()
    const accountPatientName = (session.user.name || "").toLowerCase()
    
    if (reportPatientName && accountPatientName) {
      reportPatientName = reportPatientName.replace(/^(mr\.|mrs\.|ms\.|dr\.|mr|mrs|ms|dr)\s+/i, '')
      const reportNameParts = reportPatientName.split(" ").filter(Boolean)
      const isMatch = reportNameParts.some((part: string) => accountPatientName.includes(part) && part.length > 2)
      
      if (!isMatch) {
        return NextResponse.json({ 
          error: `Identity mismatch. The report belongs to "${parsedData.patient_name || reportPatientName}", but this account belongs to "${session.user.name}". For security, this upload was blocked.` 
        }, { status: 403 })
      }
    }

    // Store PDF binary directly in Turso database as Base64
    const base64Data = buffer.toString("base64")

    const report = await prisma.report.create({
      data: {
        patientId: session.user.id,
        fileName: file.name,
        fileUrl: "/placeholder.pdf",
        fileData: base64Data,
        fileType: mimeType || file.type || "application/pdf",
        status: "PARSED",
        parsedJson: JSON.stringify(parsedData), // Save parsed JSON string instead of raw text
        aiSummary: parsedData.overall_summary || null,
        labName: parsedData.lab_name,
        reportDate: parsedData.report_date ? new Date(parsedData.report_date) : new Date(),
      },
    })

    // Update fileUrl to serve directly from Turso database endpoint
    await prisma.report.update({
      where: { id: report.id },
      data: { fileUrl: `/api/reports/${report.id}/file` }
    })

    // Dynamic Biomarker Routing
    if (parsedData.biomarkers && Array.isArray(parsedData.biomarkers)) {
      for (const b of parsedData.biomarkers) {
        if (!b.name || b.value === null || b.value === undefined) continue;

        // Dynamically injected code from the universal engine
        let code = b.code || b.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        let finalDisplayName = b.name;

        let biomarkerDef = await prisma.biomarkerDefinition.findFirst({
          where: { code }
        });

        if (!biomarkerDef) {
          biomarkerDef = await prisma.biomarkerDefinition.create({
            data: {
              code,
              displayName: finalDisplayName,
              unit: b.unit || "",
              category: "Extracted",
            }
          });
        }

        await prisma.extractedMetric.create({
          data: {
            reportId: report.id,
            biomarkerId: biomarkerDef.id,
            value: b.value,
            unit: b.unit || biomarkerDef.unit,
            refMin: biomarkerDef.refMin,
            refMax: biomarkerDef.refMax,
            isAbnormal: b.isAbnormal || false,
          }
        });
      }
    }

    const healthRecord = await prisma.userHealthRecord.create({
      data: {
        reportId: report.id,
        patientId: session.user.id,
        hemoglobin: hr_hemoglobin,
        fasting_blood_sugar: hr_fasting_blood_sugar,
        thyroid_tsh: hr_thyroid_tsh,
        ldl_cholesterol: hr_ldl_cholesterol, // Fixed mapping
        vitamin_d: hr_vitamin_d,
        vitamin_b12: hr_vitamin_b12
      },
    })

    return NextResponse.json({ success: true, report, healthRecord })
  } catch (error: any) {
    console.error("Extraction error:", error)
    return NextResponse.json({ error: error?.message || "Failed to process report" }, { status: 500 })
  }
}
