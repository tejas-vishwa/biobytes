import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Tesseract from "tesseract.js"
import { extractText } from "unpdf"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileBase64 = buffer.toString("base64")
    const mimeType = file.type || "application/pdf"

    let extractedText = ""

    // 1. Text extraction using existing OCR tools (unpdf for text-based PDFs, tesseract.js for scanned PDFs/images)
    if (mimeType.includes("pdf")) {
      try {
        const { text } = await extractText(new Uint8Array(buffer))
        extractedText = Array.isArray(text) ? text.join("\n") : (text || "")
      } catch (err) {
        console.warn("unpdf extraction failed, falling back to Tesseract OCR:", err)
      }
    }

    if (!extractedText.trim()) {
      try {
        const ret = await Tesseract.recognize(buffer, "eng")
        extractedText = ret.data.text || ""
      } catch (err) {
        console.error("Tesseract OCR error:", err)
      }
    }

    // Fallback text if OCR returns empty
    if (!extractedText.trim()) {
      extractedText = "Prescription document uploaded."
    }

    // 2. Parse Medicines / Tablets & Dosages
    const medicines: Array<{ name: string; dosage: string; frequency?: string }> = []
    
    // Regex for common medicine names and dosage patterns (e.g. Tab Paracetamol 500mg 1-0-1, Amoxicillin 500 mg BD)
    const medRegex = /(?:tab|tbl|tablet|cap|capsule|syrup|inj|injection)?\s*([A-Za-z0-9\-]{3,30})\s+([\d\.]+\s*(?:mg|g|mcg|ml|iu|units)?)(?:\s+([\d\-]{3,7}|once daily|twice daily|thrice daily|1-0-1|1-1-1|1-0-0|0-0-1|OD|BD|TDS|QDS|stat))?/gi
    
    let match
    while ((match = medRegex.exec(extractedText)) !== null) {
      const name = match[1]?.trim()
      const dosage = match[2]?.trim() || ""
      const frequency = match[3]?.trim() || "As directed"
      
      // Filter out non-medicine noise words
      const noise = ["date", "name", "age", "sex", "patient", "doctor", "hospital", "clinic", "phone", "address", "mg", "tablet", "capsule", "temp", "temperature", "blood", "pressure"]
      if (name && !noise.includes(name.toLowerCase()) && name.length >= 3) {
        medicines.push({ name, dosage, frequency })
      }
    }

    // If regex yields few results, inspect line-by-line for prescription items
    if (medicines.length === 0) {
      const lines = extractedText.split("\n")
      lines.forEach(line => {
        if (/[\d.]+\s*(mg|g|mcg|ml)/i.test(line) || /tab|cap|syrup|inj/i.test(line)) {
          medicines.push({
            name: line.trim().slice(0, 40),
            dosage: "As prescribed",
            frequency: "As directed"
          })
        }
      })
    }

    // 3. Parse Symptoms & Diagnosis
    const symptoms: string[] = []
    const symptomKeywords = ["fever", "cough", "cold", "headache", "pain", "infection", "hypertension", "diabetes", "acidity", "vomiting", "diarrhea", "rash", "weakness", "body ache", "throat infection", "swelling", "nausea"]
    
    symptomKeywords.forEach(kw => {
      if (new RegExp(`\\b${kw}\\b`, "i").test(extractedText)) {
        symptoms.push(kw.charAt(0).toUpperCase() + kw.slice(1))
      }
    })

    // Search for Diagnosis or Rx notes
    const diagnosisMatch = extractedText.match(/(?:diagnosis|symptoms|chief complaints|c\/o)[^\n:]*[:\-]?\s*([^\n]+)/i)
    if (diagnosisMatch && diagnosisMatch[1]) {
      const diagStr = diagnosisMatch[1].trim()
      if (diagStr && !symptoms.includes(diagStr)) {
        symptoms.unshift(diagStr)
      }
    }

    // 4. Parse Vitals & Temperature
    const vitals: { temperature?: string; bp?: string; pulse?: string; weight?: string } = {}
    
    // Body Temperature (e.g. 98.6 F, 101°F, 37 C)
    const tempMatch = extractedText.match(/(?:temp|temperature|fever|body temp)[^\d]{0,15}?([\d\.]+\s*°?\s*[FC])/i) || extractedText.match(/([\d\.]+\s*°?\s*F\b)/i)
    if (tempMatch && tempMatch[1]) {
      vitals.temperature = tempMatch[1].trim()
    }

    // Blood Pressure (e.g. 120/80 mmHg)
    const bpMatch = extractedText.match(/(?:bp|blood pressure)[^\d]{0,15}?([\d]{2,3}\/[\d]{2,3}\s*(?:mmHg)?)/i) || extractedText.match(/([\d]{2,3}\/[\d]{2,3}\s*mmHg)/i)
    if (bpMatch && bpMatch[1]) {
      vitals.bp = bpMatch[1].trim()
    }

    // Pulse (e.g. 72 bpm)
    const pulseMatch = extractedText.match(/(?:pulse|heart rate|hr)[^\d]{0,15}?([\d]{2,3}\s*(?:bpm)?)/i)
    if (pulseMatch && pulseMatch[1]) {
      vitals.pulse = pulseMatch[1].trim()
    }

    // Weight (e.g. 65 kg)
    const weightMatch = extractedText.match(/(?:weight|wt)[^\d]{0,15}?([\d\.]+\s*(?:kg|lbs)?)/i)
    if (weightMatch && weightMatch[1]) {
      vitals.weight = weightMatch[1].trim()
    }

    // 5. Prescribing Doctor Name
    const docMatch = extractedText.match(/(?:dr\.|doctor)[^\w]?\s*([a-z\s\.]+)/i)
    const doctorName = docMatch && docMatch[1] ? `Dr. ${docMatch[1].trim().slice(0, 30)}` : null

    // 6. Save Prescription record to Turso Database
    const prescription = await prisma.prescription.create({
      data: {
        patientId: session.user.id,
        fileName: file.name,
        fileData: fileBase64,
        fileType: mimeType,
        status: "PARSED",
        rawText: extractedText,
        doctorName,
        medicinesJson: JSON.stringify(medicines),
        symptomsJson: JSON.stringify(symptoms),
        vitalsJson: JSON.stringify(vitals),
      }
    })

    return NextResponse.json({
      success: true,
      prescription: {
        id: prescription.id,
        fileName: prescription.fileName,
        doctorName: prescription.doctorName,
        medicines,
        symptoms,
        vitals,
        createdAt: prescription.createdAt
      }
    })

  } catch (error: any) {
    console.error("Error uploading prescription:", error)
    return NextResponse.json({ error: error.message || "Failed to process prescription" }, { status: 500 })
  }
}
