import { z } from "zod"

export const BookAppointmentSchema = z
  .object({
    doctorId: z
      .string({ required_error: "doctorId is required" })
      .trim()
      .min(1, "doctorId cannot be empty")
      .max(100, "doctorId is too long"),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must follow YYYY-MM-DD format")
      .optional(),
    time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must follow HH:mm 24-hour format")
      .optional(),
    scheduledTime: z
      .string()
      .datetime({ offset: true, message: "scheduledTime must be a valid ISO datetime" })
      .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "Invalid date format"))
      .optional(),
    type: z.enum(["OFFLINE", "ONLINE"]).optional().default("OFFLINE"),
    preUploadData: z.boolean().optional(),
  })
  .refine(
    (data) => data.scheduledTime || (data.date && data.time),
    {
      message: "Either scheduledTime or both date and time must be provided",
      path: ["scheduledTime"],
    }
  )

export const UpdateAppointmentStatusSchema = z
  .object({
    status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "IN_PROGRESS"], {
      errorMap: () => ({
        message: "Status must be PENDING, ACCEPTED, REJECTED, COMPLETED, or IN_PROGRESS",
      }),
    }),
  })
  .strict()

export type BookAppointmentInput = z.infer<typeof BookAppointmentSchema>
export type UpdateAppointmentStatusInput = z.infer<typeof UpdateAppointmentStatusSchema>
