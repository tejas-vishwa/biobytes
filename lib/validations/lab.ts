import { z } from "zod"

const currentYear = new Date().getFullYear()

export const LabRegisterSchema = z
  .object({
    name: z
      .string({ required_error: "Lab name is required" })
      .trim()
      .min(2, "Lab name must be at least 2 characters")
      .max(150, "Lab name cannot exceed 150 characters"),
    yearEstablished: z.coerce
      .number({ required_error: "Year established is required" })
      .int("Year must be an integer")
      .min(1800, "Year established must be after 1800")
      .max(currentYear + 1, "Year established cannot be in the future"),
    contactPerson: z
      .string({ required_error: "Contact person name is required" })
      .trim()
      .min(2, "Contact person must be at least 2 characters")
      .max(100, "Contact person cannot exceed 100 characters"),
    registrationNo: z
      .string({ required_error: "Registration number is required" })
      .trim()
      .min(2, "Registration number must be at least 2 characters")
      .max(100, "Registration number cannot exceed 100 characters"),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address")
      .max(255, "Email cannot exceed 255 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password cannot exceed 128 characters"),
    operationalScope: z
      .string()
      .trim()
      .max(500, "Operational scope cannot exceed 500 characters")
      .optional()
      .default(""),
  })
  .strict()

export type LabRegisterInput = z.infer<typeof LabRegisterSchema>
