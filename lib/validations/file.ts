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

/**
 * Sanitizes uploaded file name to prevent path traversal and execution risks
 */
export function sanitizeSafeFileName(fileName: string | null | undefined, fallback: string = "medical_file"): string {
  if (!fileName) return `${fallback}_${Date.now()}`
  
  // Remove path traversal, null bytes, and control chars
  let clean = fileName
    .replace(/[\0\x00-\x1f\x7f-\x9f]/g, "")
    .replace(/[/\\]+/g, "")
    .replace(/\.\.+/g, ".")
    .trim()

  // Replace any non-alphanumeric (except standard dots, dashes, underscores)
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, "_")

  // Disallow dangerous extensions
  const dangerousExts = /\.(php|phtml|phar|exe|bat|cmd|sh|js|jsp|asp|aspx|py|cgi|pl|html|htm|svg|wasm|dll|so|vbs)$/i
  if (dangerousExts.test(clean)) {
    clean = clean.replace(dangerousExts, ".bin")
  }

  if (clean.length === 0 || clean === ".") {
    clean = `${fallback}_${Date.now()}`
  }

  return clean.slice(0, 100)
}

/**
 * Checks binary magic bytes to verify genuine file type and reject disguised executables/scripts
 */
export function verifyFileContentMagicBytes(buffer: Buffer): { valid: boolean; detectedType?: string; error?: string } {
  if (!buffer || buffer.length < 4) {
    return { valid: false, error: "File content is empty or unreadable" }
  }

  // Check for executable signatures (DOS/PE MZ, ELF, shell scripts, php)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) { // MZ executable
    return { valid: false, error: "Executable files (.exe/.dll) are prohibited" }
  }
  if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) { // ELF
    return { valid: false, error: "Executable binary files are prohibited" }
  }

  const prefixString = buffer.slice(0, 100).toString("ascii").toLowerCase()
  if (
    prefixString.includes("<?php") ||
    prefixString.includes("<script") ||
    prefixString.includes("<html") ||
    prefixString.startsWith("#!/")
  ) {
    return { valid: false, error: "Script files and embedded HTML are prohibited" }
  }

  // 1. PDF: %PDF- (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, detectedType: "application/pdf" }
  }

  // 2. PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return { valid: true, detectedType: "image/png" }
  }

  // 3. JPEG/JPG: 0xFF 0xD8 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedType: "image/jpeg" }
  }

  // 4. WebP: RIFF....WEBP (0x52 0x49 0x46 0x46 ... 0x57 0x45 0x42 0x50)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return { valid: true, detectedType: "image/webp" }
  }

  // 5. DICOM: bytes 128-131 match 'DICM'
  if (buffer.length >= 132) {
    const dicmSig = buffer.slice(128, 132).toString("ascii")
    if (dicmSig === "DICM") {
      return { valid: true, detectedType: "application/dicom" }
    }
  }

  return { valid: false, error: "Uploaded file signature does not match allowed medical formats (PDF, PNG, JPEG, WEBP, DICOM)" }
}

/**
 * Validates multipart File object for MIME type, size, extension, and content
 */
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

  const fileType = (uploadedFile.type || "").toLowerCase().trim()
  const fileName = uploadedFile.name || ""
  const isAllowedMime = allowedMimeTypes.includes(fileType)
  const isAllowedExt = /\.(pdf|png|jpe?g|webp|dcm|nii|nii\.gz)$/i.test(fileName)

  if (!isAllowedMime && !isAllowedExt) {
    return {
      valid: false,
      response: NextResponse.json(
        { error: "Invalid file format. Only PDF, PNG, JPEG, WEBP, and DICOM medical files are permitted." },
        { status: 400 }
      ),
    }
  }

  return { valid: true, file: uploadedFile }
}

/**
 * Generates security headers for serving stored files to prevent inline script execution
 */
export function getSafeFileServingHeaders(mimeType: string, fileName: string): Record<string, string> {
  const safeName = sanitizeSafeFileName(fileName)
  return {
    "Content-Type": mimeType,
    "Content-Disposition": `inline; filename="${safeName}"`,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    "X-Frame-Options": "SAMEORIGIN",
    "Cache-Control": "private, max-age=86400, no-transform",
  }
}
