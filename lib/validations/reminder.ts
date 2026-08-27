import { z } from "zod"

export const CreateReminderSchema = z
  .object({
    medicineName: z
      .string({ required_error: "Medicine name is required" })
      .trim()
      .min(1, "Medicine name cannot be empty")
      .max(150, "Medicine name cannot exceed 150 characters"),
    reminderTime: z
      .string({ required_error: "Reminder time is required" })
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Reminder time must follow 24-hour format HH:mm (e.g. 08:30)"),
    prescriptionId: z
      .string()
      .trim()
      .max(100, "prescriptionId is invalid")
      .nullable()
      .optional(),
  })
  .strict()

export const DeleteReminderQuerySchema = z
  .object({
    id: z
      .string({ required_error: "Reminder ID is required" })
      .trim()
      .min(1, "Reminder ID cannot be empty")
      .max(100, "Invalid reminder ID"),
  })
  .strict()

export type CreateReminderInput = z.infer<typeof CreateReminderSchema>
export type DeleteReminderQueryInput = z.infer<typeof DeleteReminderQuerySchema>
