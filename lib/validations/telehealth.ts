import { z } from "zod"

export const TelehealthJoinSchema = z
  .object({
    appointmentId: z
      .string({ required_error: "appointmentId is required" })
      .trim()
      .min(1, "appointmentId cannot be empty")
      .max(100, "Invalid appointmentId"),
  })
  .strict()

export const TelehealthRoomSchema = z
  .object({
    appointmentId: z
      .string({ required_error: "appointmentId is required" })
      .trim()
      .min(1, "appointmentId cannot be empty")
      .max(100, "Invalid appointmentId"),
  })
  .strict()

export type TelehealthJoinInput = z.infer<typeof TelehealthJoinSchema>
export type TelehealthRoomInput = z.infer<typeof TelehealthRoomSchema>
