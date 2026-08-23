import { z } from "zod"

export const ClinicalSummarySchema = z.object({
  chief_complaint: z.string(),
  clinical_summary: z.string(),
  prescribed_medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
  })),
  lab_tests_ordered: z.array(z.string()),
  lifestyle_advice: z.array(z.string()),
  follow_up: z.string(),
})

export type ClinicalSummary = z.infer<typeof ClinicalSummarySchema>
