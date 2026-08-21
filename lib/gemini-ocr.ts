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
 * Extracts raw text from PDF files using unpdf.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfData = await extractText(new Uint8Array(buffer))
    if (typeof pdfData === "string") {
      return pdfData
    } else if (pdfData && typeof pdfData === "object" && "text" in pdfData) {
      const textObj = (pdfData as any).text
      return Array.isArray(textObj) ? textObj.join("\n") : textObj || ""
    }
  } catch (err) {
    console.warn("PDF extraction error:", err)
  }
  return ""
}

/**
 * Sanitizes and validates extracted medications list.
 * Strips out header words, prepositions, timing instructions, item list numbers, and non-drug text.
 */

// Hardcoded drug dictionary for validation
const VALID_DRUGS = new Set([
  "paracetamol", "azithromycin", "dolo", "pan", "darolac", "amoxicillin", 
  "pantoprazole", "cetirizine", "ibuprofen", "aspirin", "metformin", 
  "atorvastatin", "cefim", "cefixime", "augmentin", "linezolid", 
  "levofloxacin", "ciprofloxacin", "omeprazole", "ranitidine", "telmisartan", 
  "amlodipine", "montelukast", "calpol", "crocin", "allegra", "sinarest"
]);

export function sanitizeMedications(medications: ExtractedMedication[]): ExtractedMedication[] {
  if (!Array.isArray(medications)) return []
  const cleanList: ExtractedMedication[] = []

  for (const m of medications) {
    if (!m || typeof m.drug_name !== "string") continue

    let name = m.drug_name.trim().replace(/^[\d\.\-\s]+/, "").trim()
    if (name.length < 3) continue

    const lowerName = name.toLowerCase()

    let isValidDrug = false;
    for (const validDrug of VALID_DRUGS) {
      if (lowerName.includes(validDrug)) {
        isValidDrug = true;
        break;
      }
    }
    
    // Bypass dictionary strict match if it successfully parsed a strict dosage unit (mg, ml, g, etc)
    if (!isValidDrug && !(m as any)._has_unit) {
      continue;
    }

    cleanList.push({
      drug_name: name,
      dosage: m.dosage ? m.dosage.trim() : null,
      frequency: m.frequency ? m.frequency.trim() : null,
      timing_instructions: m.timing_instructions ? m.timing_instructions.trim() : null
    })
  }

  return cleanList
}

export async function extractPrescriptionData(buffer: Buffer, mimeType: string): Promise<ExtractedMedicalData> {
  return await fallbackPrescriptionExtraction(buffer, mimeType)
}

export async function extractMedicalData(buffer: Buffer, mimeType: string): Promise<ExtractedMedicalData> {
  return await fallbackLabReportExtraction(buffer, mimeType)
}

async function fallbackPrescriptionExtraction(buffer: Buffer, mimeType: string): Promise<ExtractedMedicalData> {
  let extractedText = ""

  if (mimeType.includes("pdf")) extractedText = await extractTextFromPDF(buffer)
  
  if (!extractedText.trim()) {
    try {
      const ret = await Tesseract.recognize(buffer, "eng")
      extractedText = ret.data.text || ""
    } catch (err) {}
  }

  const lines = extractedText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const marginCount = Math.floor(lines.length * 0.1);
  const coreLines = lines.slice(marginCount, lines.length - marginCount);
  
  let currentZone = "NONE";
  const diagnoses: string[] = [];
  const rawMedications: ExtractedMedication[] = [];

  for (const line of coreLines) {
    const lowerLine = line.toLowerCase();
    
    if (/\b(rx|medications|treatment|medicines|drugs)\b/i.test(lowerLine)) {
      currentZone = "MEDICATIONS";
      continue;
    } else if (/\b(diagnosis|symptoms|c\/o|clinical notes|complaints)\b/i.test(lowerLine)) {
      currentZone = "DIAGNOSIS";
      continue;
    } else if (/\b(vitals|temperature|bp|pulse|weight|height|advice|follow up|dr\.|doctor|reg no|disclaimer)\b/i.test(lowerLine)) {
      currentZone = "OTHER";
      continue;
    }

    // Always check for strict dosage match to auto-detect medicines even if zone failed
    const dosageMatch = line.match(/(\d+(\.\d+)?)\s*(mg|ml|g|mcg|iu|tablet(s)?|cap(sule(s)?)?|drop(s)?)/i);
    const hasStrictDosage = !!dosageMatch;

    if (currentZone === "DIAGNOSIS" && !hasStrictDosage) {
      // Prevent consuming doctor names, reg numbers, disclaimers
      if (lowerLine.includes("dr.") || lowerLine.includes("reg") || lowerLine.includes("disclaimer") || line.length > 60) {
        currentZone = "OTHER";
        continue;
      }
      const cleaned = line.replace(/^[\-\•\*\d\.]+\s*/, '').trim();
      if (cleaned.length > 2 && !/\d/.test(cleaned) && cleaned.length < 40) diagnoses.push(cleaned);
    } 
    
    if (currentZone === "MEDICATIONS" || hasStrictDosage) {
      const dosage = dosageMatch ? dosageMatch[0] : null;
      
      let frequency = null;
      let timing_instructions = null;
      
      if (/\b(OD|1-0-0|0-0-1|once daily)\b/i.test(line)) frequency = "Once Daily (OD)";
      else if (/\b(BD|BID|1-0-1|1-1-0|twice daily)\b/i.test(line)) frequency = "Twice Daily (BD)";
      else if (/\b(TDS|TID|1-1-1|thrice daily)\b/i.test(line)) frequency = "Thrice Daily (TDS)";
      else if (/\b(QID|four times)\b/i.test(line)) frequency = "Four times daily (QID)";
      else if (/\b(SOS|as needed)\b/i.test(line)) frequency = "As needed (SOS)";
      
      if (/\b(after meal(s)?|pc)\b/i.test(line)) timing_instructions = "After meals";
      else if (/\b(before meal(s)?|ac|empty stomach)\b/i.test(line)) timing_instructions = "Before meals";
      
      // Match the drug name
      const drugMatch = line.match(/(?:tab|tbl|tablet|cap|capsule|syrup|inj)?\s*([A-Za-z]{3,25})/i);
      if (drugMatch && drugMatch[1]) {
        rawMedications.push({
          drug_name: drugMatch[1].trim(),
          dosage,
          frequency,
          timing_instructions
        });
      }
    }
  }

  // Inject a 'strict_unit_matched' property so sanitizeMedications knows it's highly likely a drug
  const sanitizedMeds = sanitizeMedications(rawMedications.map(m => ({...m, _has_unit: !!m.dosage})) as any);

  return {
    documentType: "prescription",
    patient: { name: null, age: null, gender: null },
    doctor: { name: null, date: new Date().toISOString().split("T")[0] },
    diagnoses_and_symptoms: diagnoses.length > 0 ? diagnoses : null,
    medications: sanitizedMeds,
    biomarkers: null,
    labName: null,
    testDate: null
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
    extractedText = await extractTextFromPDF(buffer)
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

  let testDate: string | null = null
  const dateMatch = extractedText.match(/(?:sample collected|date of collection|test date|registered on|report date|date|collected|registered|reported)\s*[:\-\=]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})/i)
  if (dateMatch && dateMatch[1]) {
    testDate = dateMatch[1].trim()
  }

  let labName: string | null = null
  if (/thyrocare/i.test(extractedText)) labName = "Thyrocare"
  else if (/lal path/i.test(extractedText)) labName = "Dr. Lal PathLabs"
  else if (/srl/i.test(extractedText)) labName = "SRL Diagnostics"
  else if (/metropolis/i.test(extractedText)) labName = "Metropolis Healthcare"
  else if (/apollo/i.test(extractedText)) labName = "Apollo Diagnostics"
  else if (/suburban/i.test(extractedText)) labName = "Suburban Diagnostics"
  else if (/lucid/i.test(extractedText)) labName = "Lucid Medical Diagnostics"
  else if (/vijaya/i.test(extractedText)) labName = "Vijaya Diagnostic Centre"
  else if (/max/i.test(extractedText)) labName = "Max Healthcare"

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
    doctor: { name: doctorName, date: testDate || new Date().toISOString().split("T")[0] },
    biomarkers: biomarkers.length > 0 ? biomarkers : null,
    medications: null,
    labName,
    testDate
  }
}
