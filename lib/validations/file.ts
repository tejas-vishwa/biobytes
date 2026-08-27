import { NextResponse } from "next/server"

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]

export const ALLOWED_SCAN_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/dicom",
  "application/octet-stream",
]

export function validateUploadedFile(
  file: unknown,
  allowedMimeTypes: string[] = ALLOWED_DOCUMENT_MIME_TYPES,
  maxSizeBytes: number = MAX_FILE_SIZE_BYTES
): { valid: true; file: File } | { valid: false; response: NextResponse } {
  if (!file || typeof file !== "object" || !("size" in file) || !("arrayBuffer" in file)) {
    return {
      valid: false,
      response: NextResponse.json({ error: "No file uploaded or invalid file format" }, { status: 400 }),
    }
  }

  const uploadedFile = file as File

  if (uploadedFile.size === 0) {
    return {
      valid: false,
      response: NextResponse.json({ error: "Uploaded file is empty" }, { status: 400 }),
    }
  }

  if (uploadedFile.size > maxSizeBytes) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: `File size exceeds the allowed limit of ${Math.round(maxSizeBytes / (1024 * 1024))}MB` },
        { status: 400 }
      ),
    }
  }

  const fileType = uploadedFile.type || ""
  const fileName = uploadedFile.name || ""
  const isAllowedMime = allowedMimeTypes.includes(fileType)
  const isAllowedExt = /\.(pdf|png|jpe?g|webp|dcm|nii|nii\.gz)$/i.test(fileName)

  if (!isAllowedMime && !isAllowedExt) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Invalid file type. Allowed formats: PDF, PNG, JPEG, WEBP, DICOM" },
        { status: 400 }
      ),
    }
  }

  return { valid: true, file: uploadedFile }
}
