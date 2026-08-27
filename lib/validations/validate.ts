import { z, ZodError } from "zod"
import { NextResponse } from "next/server"

export interface ValidationErrorDetail {
  field: string
  message: string
}

/**
 * Formats Zod errors into a clean, client-safe array of field issues
 */
export function formatZodErrors(error: ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "payload",
    message: issue.message,
  }))
}

/**
 * Creates a standard 400 Bad Request JSON response for validation failures
 */
export function createValidationErrorResponse(
  error: ZodError,
  customMessage?: string
): NextResponse {
  const details = formatZodErrors(error)
  const firstIssueMessage = details[0]?.message
  const message = customMessage || firstIssueMessage || "Input validation failed"
  return NextResponse.json(
    {
      error: message,
      details,
    },
    { status: 400 }
  )
}

/**
 * Validates arbitrary input data synchronously against a Zod schema
 */
export function validateSchema<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse; error: ZodError } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      success: false,
      response: createValidationErrorResponse(result.error),
      error: result.error,
    }
  }
  return { success: true, data: result.data }
}
