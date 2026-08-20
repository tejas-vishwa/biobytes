export type MedicalDocumentType = "prescription" | "lab_report" | "other";

export interface PatientInfo {
  name?: string | null;
  age?: number | null;
  gender?: string | null;
}

export interface DoctorInfo {
  name?: string | null;
  date?: string | null;
}

export interface ExtractedBiomarker {
  testName: string;
  value: number;
  unit?: string | null;
  referenceInterval?: string | null;
  status?: "normal" | "high" | "low" | "critical" | "unknown" | null;
}

export interface ExtractedMedication {
  medicineName: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
}

export interface ExtractedMedicalData {
  documentType: MedicalDocumentType;
  patient?: PatientInfo | null;
  doctor?: DoctorInfo | null;
  biomarkers?: ExtractedBiomarker[] | null;
  medications?: ExtractedMedication[] | null;
  labName?: string | null;
  testDate?: string | null;
}
