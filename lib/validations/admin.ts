import { z } from "zod"

export const AdminUserActionSchema = z
  .object({
    action: z.enum(["SUSPEND", "ACTIVATE", "RESET_PASSWORD"], {
      errorMap: () => ({ message: "Action must be SUSPEND, ACTIVATE, or RESET_PASSWORD" }),
    }),
  })
  .strict()

export const AdminSubscriptionApprovalSchema = z
  .object({
    userId: z
      .string({ required_error: "userId is required" })
      .trim()
      .min(1, "userId cannot be empty")
      .max(100, "Invalid userId"),
  })
  .strict()

export const AdminLabApprovalParamsSchema = z
  .object({
    id: z
      .string({ required_error: "Lab ID is required" })
      .trim()
      .min(1, "Lab ID cannot be empty")
      .max(100, "Invalid Lab ID"),
  })
  .strict()

export type AdminUserActionInput = z.infer<typeof AdminUserActionSchema>
export type AdminSubscriptionApprovalInput = z.infer<typeof AdminSubscriptionApprovalSchema>
export type AdminLabApprovalParamsInput = z.infer<typeof AdminLabApprovalParamsSchema>
