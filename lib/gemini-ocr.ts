import { GoogleGenAI } from "@google/genai"
import Tesseract from "tesseract.js"
import { extractText } from "unpdf"
import { BIOMARKERS_100 } from "./biomarkers100"
import type { ExtractedMedicalData, ExtractedMedication } from "@/types/medical-ocr"

// List of non-medicine words to filter out from prescription OCR
const NON_MEDICINE_WORDS = new Set([
  "instruction", "instructions", "meal", "meals", "stomach", "after", "before", "food",
  "daily", "days", "day", "every", "hours", "hour", "take", "for", "times", "time",
  "water", "bedtime", "morning", "night", "evening", "sos", "rx", "note", "notes",
  "advice", "signature", "doctor", "dr", "patient", "name", "date", "age", "sex",
  "gender", "clinic", "hospital", "phone", "address", "reg", "no", "number", "tab",
  "tbl", "tablet", "tablets", "cap", "capsule", "capsules", "syrup", "inj", "injection",
  "sl", "ointment", "drops", "cream", "gel", "lotion", "mg", "g", "mcg", "ml", "iu",
  "units", "diet", "follow", "up", "review", "test", "tests", "investigation",
  "investigations", "diagnosis", "symptoms", "history", "chief", "complaint", "complaints",
  "bp", "pulse", "temp", "temperature", "weight", "height", "spo2", "rr", "vitals", "with",
  "without", "empty", "full", "glass", "cup", "spoon", "puff", "puffs", "daily", "weekly"
])

/**
 * Sanitizes and validates extracted medications list.
 * Strips out header words, prepositions, timing instructions, item list numbers, and non-drug text.
 */
export function sanitizeMedications(medications: ExtractedMedication[]): ExtractedMedication[] {
  if (!Array.isArray(medications)) return []

  const cleanList: ExtractedMedication[] = []

  for (const m of medications) {
    if (!m || typeof m.medicineName !== "string") continue

    let name = m.medicineName.trim().replace(/^[\d\.\-\s]+/, "").trim()

    // Skip short or empty names
    if (name.length < 3) continue

    const lowerName = name.toLowerCase()

    // Skip if name is purely numeric or special characters
    if (/^[\d\.\-\s\:\,]+$/.test(name)) continue

    // Skip if name is a known non-medicine word/header
    if (NON_MEDICINE_WORDS.has(lowerName)) continue

    // Skip if name starts with or consists of instruction phrases
    if (/^(take|after|before|for|every|with|on|in|to|avoid|follow|diet|note|dr|rx)\b/i.test(name) &&
        !/\b(paracetamol|azithromycin|dolo|pan|darolac|amoxicillin|pantoprazole|cetirizine|ibuprofen|aspirin|metformin|atorvastatin|cefim|cefixime|augmentin|linezolid|levofloxacin|ciprofloxacin|omeprazole|ranitidine|telmisartan|amlodipine|montelukast)\b/i.test(name)) {
      continue
    }

    // Clean dosage: if dosage is just an item number like "1.", "2.", "5", "7" without units, nullify or fix it
    let dosage = m.dosage ? m.dosage.trim() : null
    if (dosage && (/^[\d\.\s]+$/.test(dosage) && parseFloat(dosage) < 20)) {
      // Single digit number without mg/g/ml unit is usually an item list number, not a dosage
      dosage = null
    }

    // Clean frequency
    let frequency = m.frequency ? m.frequency.trim() : null
    if (frequency && NON_MEDICINE_WORDS.has(frequency.toLowerCase())) {
      frequency = null
    }

    cleanList.push({
      medicineName: name,
      dosage,
      frequency,
      duration: m.duration ? m.duration.trim() : null
    })
  }

  return cleanList
}

export const PRESCRIPTION_JSON_SCHEMA = {
  type: "object",
  properties: {
    documentType: {
      type: "string",
      enum: ["prescription"],
      description: "Classified strictly as a doctor prescription document."
    },
    patient: {
      type: "object",
      properties: {
        name: { type: "string", nullable: true },
        age: { type: "integer", nullable: true },
        gender: { type: "string", nullable: true }
      }
    },
    doctor: {
      type: "object",
      properties: {
        name: { type: "string", nullable: true },
        date: { type: "string", nullable: true }
      }
    },
    medications: {
      type: "array",
      description: "Extract ONLY real pharmaceutical medicine/drug names. DO NOT include section headers, list numbers, instructions ('after meal', 'for 7 days'), or timing notes as medicines.",
      items: {
        type: "object",
        properties: {
          medicineName: { 
            type: "string", 
            description: "The actual brand name or generic drug name (e.g. Azithromycin, Dolo, Pan, Darolac)." 
          },
          dosage: { 
            type: "string", 
            nullable: true, 
            description: "Dosage strength with unit e.g. 500mg, 650mg, 40mg, 1 capsule. DO NOT put item list numbers here." 
          },
          frequency: { 
            type: "string", 
            nullable: true, 
            description: "Administration frequency e.g. 1-0-1, BD, TDS, once daily, SOS." 
          },
          duration: { 
            type: "string", 
            nullable: true, 
            description: "Duration e.g. 5 days, 1 week." 
          }
        },
        required: ["medicineName"]
      }
    },
    symptoms: {
      type: "array",
      description: "Extract list of chief complaints, symptoms, or diagnosis notes",
      items: { type: "string" }
    },
    vitals: {
      type: "object",
      description: "Extract vitals recorded on prescription",
      properties: {
        temperature: { type: "string", nullable: true },
        bp: { type: "string", nullable: true },
        pulse: { type: "string", nullable: true },
        weight: { type: "string", nullable: true }
      }
    }
  },
  required: ["documentType", "patient", "medications"]
}

export const PRESCRIPTION_SYSTEM_PROMPT = `
You are an advanced medical prescription OCR and clinical data extraction engine. Your task is to analyze doctor prescriptions with extreme precision.

STRICT MEDICAL EXTRACTION RULES:
1. MEDICATIONS ONLY: Extract ONLY actual pharmaceutical drug names (brand names or generic names, e.g. Azithromycin, Dolo, Pan 40, Darolac, Paracetamol, Amoxicillin).
2. DO NOT EXTRACT NON-DRUG TEXT: Do NOT treat section titles ("Instructions", "Advice", "Diagnosis", "Notes"), timing directions ("after meal", "before food", "on empty stomach"), prepositions ("for", "every", "with"), or item list numbers ("1.", "2.", "3.", "4.") as medicine names.
3. DOSAGE vs ITEM NUMBER: "500mg", "650mg", "40mg" are dosages. Item list numbers like "1.", "2.", "5", "7" are NOT dosages. If no dosage unit (mg, ml, g, cap) is specified, leave dosage as null.
4. PATIENT & DOCTOR INFO: Extract patient name, age, gender, doctor name (e.g. Dr. Rahul Verma), and prescription date.
5. NO GUESSING / HALLUCINATION: If a word is illegible or handwriting is unclear, output null. Never guess medical data.
6. FORMAT: Return strictly valid JSON adhering to the provided JSON Schema.
`

/**
 * Main entrypoint to extract structured prescription data using Gemini API Structured Outputs.
 * High precision, intelligent filtering, and structured validation.
 */
export async function extractPrescriptionData(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractedMedicalData> {
  const apiKey = process.env.GEMINI_API_KEY

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey })
      const base64Data = buffer.toString("base64")

      let effectiveMimeType = mimeType || "application/pdf"
      if (!effectiveMimeType.includes("pdf") && !effectiveMimeType.startsWith("image/")) {
        effectiveMimeType = "image/jpeg"
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: PRESCRIPTION_SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType: effectiveMimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: PRESCRIPTION_JSON_SCHEMA as any,
          temperature: 0.0
        }
      })

      const rawText = response.text ? response.text() : ""
      if (rawText) {
        const parsed = JSON.parse(rawText)
        const sanitizedMeds = sanitizeMedications(parsed.medications || [])
        return {
          documentType: "prescription",
          patient: parsed.patient || null,
          doctor: parsed.doctor || null,
          medications: sanitizedMeds,
          biomarkers: null
        }
      }
    } catch (error) {
      console.warn("Gemini Structured Outputs prescription extraction failed, falling back to local OCR:", error)
    }
  }

  return await fallbackPrescriptionExtraction(buffer, mimeType)
}

/**
 * General entrypoint for medical document extraction.
 */
export async function extractMedicalData(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractedMedicalData> {
  return await fallbackLabReportExtraction(buffer, mimeType)
}

/**
 * Local OCR fallback for prescriptions with intelligent line-by-line drug matching.
 */
async function fallbackPrescriptionExtraction(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractedMedicalData> {
  let extractedText = ""

  if (mimeType.includes("pdf")) {
    try {
      const pdfData = await extractText(new Uint8Array(buffer))
      if (typeof pdfData === "string") {
        extractedText = pdfData
      } else if (pdfData && typeof pdfData === "object" && "text" in pdfData) {
        const textObj = (pdfData as any).text
        extractedText = Array.isArray(textObj) ? textObj.join("\n") : textObj || ""
      }
    } catch (err) {
      console.warn("unpdf extraction failed:", err)
    }
  }

  if (!extractedText.trim()) {
    try {
      const ret = await Tesseract.recognize(buffer, "eng")
      extractedText = ret.data.text || ""
    } catch (err) {
      console.error("Tesseract fallback failed:", err)
    }
  }

  const cleanSalutations = (str: string) =>
    str.replace(/\b(mr\.|mrs\.|ms\.|smt\.|shri\.|dr\.|master\.|miss\.|mr|mrs|ms|smt|shri|dr|master|miss)\b/gi, "").replace(/\s+/g, " ").trim()

  let patientName: string | null = null
  const nameMatch = extractedText.match(/(?:patient\s*name|patient\'?s?\s*name|name\s*of\s*patient|name)\s*[:\-\=]?\s*(?:mr\.|mrs\.|ms\.|dr\.)?\s*([A-Za-z\s\.]{2,50})/i)
  if (nameMatch && nameMatch[1]) {
    let rawName = nameMatch[1].trim().replace(/\b(age|sex|gender|dob|ref|lab|date)\b.*/i, "").trim()
    rawName = cleanSalutations(rawName)
    if (rawName.length > 1) patientName = rawName
  }

  let doctorName: string | null = null
  const docMatch = extractedText.match(/(?:dr\.|doctor)[^\w]?\s*([a-z\s\.]+)/i)
  if (docMatch && docMatch[1]) {
    doctorName = `Dr. ${docMatch[1].trim().slice(0, 30)}`
  }

  const rawMedications: ExtractedMedication[] = []
  
  // Intelligent line-by-line drug matching
  const lines = extractedText.split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Regex requiring explicit medical strength (mg, g, mcg, ml, cap, tab) or known drug prefix
    const lineMatch = trimmed.match(/(?:tab|tbl|tablet|cap|capsule|syrup|inj)?\s*([A-Za-z]{3,25})\s+([\d\.]+\s*(?:mg|g|mcg|ml|iu)?)(?:\s+([\d\-]{3,7}|once daily|twice daily|thrice daily|1-0-1|1-1-1|1-0-0|0-0-1|OD|BD|TDS|SOS))?/i)

    if (lineMatch && lineMatch[1]) {
      const medName = lineMatch[1].trim()
      const rawDosage = lineMatch[2]?.trim() || null
      const freq = lineMatch[3]?.trim() || null

      rawMedications.push({
        medicineName: medName,
        dosage: rawDosage,
        frequency: freq,
        duration: null
      })
    }
  }

  const sanitizedMeds = sanitizeMedications(rawMedications)

  return {
    documentType: "prescription",
    patient: { name: patientName, age: null, gender: null },
    doctor: { name: doctorName, date: new Date().toISOString().split("T")[0] },
    medications: sanitizedMeds,
    biomarkers: null
  }
}

/**
 * Local extraction for Lab Reports.
 */
async function fallbackLabReportExtraction(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractedMedicalData> {
  let extractedText = ""

  if (mimeType.includes("pdf")) {
    try {
      const pdfData = await extractText(new Uint8Array(buffer))
      if (typeof pdfData === "string") {
        extractedText = pdfData
      } else if (pdfData && typeof pdfData === "object" && "text" in pdfData) {
        const textObj = (pdfData as any).text
        extractedText = Array.isArray(textObj) ? textObj.join("\n") : textObj || ""
      }
    } catch (err) {
      console.warn("unpdf extraction failed:", err)
    }
  }

  if (!extractedText.trim()) {
    try {
      const ret = await Tesseract.recognize(buffer, "eng")
      extractedText = ret.data.text || ""
    } catch (err) {
      console.error("Tesseract fallback failed:", err)
    }
  }

  const cleanSalutations = (str: string) =>
    str.replace(/\b(mr\.|mrs\.|ms\.|smt\.|shri\.|dr\.|master\.|miss\.|mr|mrs|ms|smt|shri|dr|master|miss)\b/gi, "").replace(/\s+/g, " ").trim()

  let patientName: string | null = null
  const nameMatch = extractedText.match(/(?:patient\s*name|patient\'?s?\s*name|name\s*of\s*patient|name)\s*[:\-\=]?\s*(?:mr\.|mrs\.|ms\.|dr\.)?\s*([A-Za-z\s\.]{2,50})/i)
  if (nameMatch && nameMatch[1]) {
    let rawName = nameMatch[1].trim().replace(/\b(age|sex|gender|dob|ref|lab|date)\b.*/i, "").trim()
    rawName = cleanSalutations(rawName)
    if (rawName.length > 1) patientName = rawName
  }

  let doctorName: string | null = null
  const docMatch = extractedText.match(/(?:dr\.|doctor)[^\w]?\s*([a-z\s\.]+)/i)
  if (docMatch && docMatch[1]) {
    doctorName = `Dr. ${docMatch[1].trim().slice(0, 30)}`
  }

  const biomarkers: any[] = []
  BIOMARKERS_100.forEach((b) => {
    const safeName = b.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`(?:${safeName})[^\\d]{0,40}?([\\d\\.]+)`, "i")
    const match = extractedText.match(regex)
    if (match && match[1]) {
      const val = parseFloat(match[1])
      if (!isNaN(val)) {
        let status: "normal" | "high" | "low" = "normal"
        if (b.refMin !== null && val < b.refMin) status = "low"
        if (b.refMax !== null && val > b.refMax) status = "high"
        biomarkers.push({
          testName: b.name,
          value: val,
          unit: b.unit,
          referenceInterval: b.refMin && b.refMax ? `${b.refMin} - ${b.refMax}` : null,
          status
        })
      }
    }
  })

  return {
    documentType: "lab_report",
    patient: { name: patientName, age: null, gender: null },
    doctor: { name: doctorName, date: new Date().toISOString().split("T")[0] },
    biomarkers: biomarkers.length > 0 ? biomarkers : null,
    medications: null
  }
}
