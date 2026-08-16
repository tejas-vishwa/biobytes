"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, Camera, X, Pill, Activity, Zap, CheckCircle2, AlertTriangle, Layers, FileSpreadsheet, Stethoscope } from "lucide-react"

export const dynamic = "force-dynamic"

type DocumentCategory = "AUTO" | "REPORT" | "PRESCRIPTION" | "SCAN"

export default function UnifiedUploadPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("AUTO")
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const getTargetEndpoint = (file: File, category: DocumentCategory): { endpoint: string; redirect: string; typeName: string } => {
    const filename = file.name.toLowerCase()
    const mimeType = file.type.toLowerCase()

    if (category === "REPORT") {
      return { endpoint: "/api/extract-report", redirect: "/patient/dashboard", typeName: "Lab Report" }
    }
    if (category === "PRESCRIPTION") {
      return { endpoint: "/api/prescriptions/upload", redirect: "/patient/prescriptions", typeName: "Prescription" }
    }
    if (category === "SCAN") {
      return { endpoint: "/api/analyze-scan", redirect: "/patient/scan-analysis", typeName: "AI Scan Analysis" }
    }

    // AUTO-DETECTION LOGIC
    if (filename.endsWith(".dcm") || filename.endsWith(".nii") || filename.endsWith(".nii.gz") || /xray|x-ray|scan|ct|mri|chest/i.test(filename)) {
      return { endpoint: "/api/analyze-scan", redirect: "/patient/scan-analysis", typeName: "AI Scan Analysis" }
    }
    if (/prescription|rx|medicine|tablet|capsule|doctor/i.test(filename)) {
      return { endpoint: "/api/prescriptions/upload", redirect: "/patient/prescriptions", typeName: "Prescription" }
    }

    // Default to Lab Report extraction
    return { endpoint: "/api/extract-report", redirect: "/patient/dashboard", typeName: "Lab Report" }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setError("")
    setUploadProgress(0)

    let hasError = false
    let currentIdx = 0
    let finalRedirect = "/patient/dashboard"

    for (const file of files) {
      setUploadProgress(currentIdx + 1)
      const target = getTargetEndpoint(file, selectedCategory)
      finalRedirect = target.redirect

      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch(target.endpoint, {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          hasError = true
          const errorData = await res.json().catch(() => ({}))
          setError(errorData.error || `Upload failed for ${file.name} (Status ${res.status}).`)
          break
        }
      } catch (err) {
        hasError = true
        setError(`An error occurred while uploading ${file.name}.`)
        break
      }
      currentIdx++
    }

    setUploading(false)
    setUploadProgress(0)

    if (!hasError) {
      setFiles([])
      router.push(finalRedirect)
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-6 md:mt-10 px-4 pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
          <UploadCloud className="h-7 w-7 sm:h-8 sm:w-8 text-primary" /> Unified Medical Upload Hub
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Upload any medical document. Intelligently differentiates between <strong>Lab Reports</strong>, <strong>Doctor Prescriptions</strong>, and <strong>AI Diagnostic Scans</strong>.
        </p>
      </div>

      {/* Category Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedCategory("AUTO")}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-sm flex flex-col justify-between ${
            selectedCategory === "AUTO"
              ? "bg-primary/15 border-primary text-primary font-bold shadow"
              : "bg-card border-border/80 text-muted-foreground hover:bg-accent/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-amber-500" />
            {selectedCategory === "AUTO" && <CheckCircle2 className="h-4 w-4 text-primary" />}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-extrabold text-foreground">Auto-Detect</p>
            <p className="text-[10px] text-muted-foreground">Smart Document AI</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("REPORT")}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-sm flex flex-col justify-between ${
            selectedCategory === "REPORT"
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow"
              : "bg-card border-border/80 text-muted-foreground hover:bg-accent/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
            {selectedCategory === "REPORT" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-extrabold text-foreground">Lab Reports</p>
            <p className="text-[10px] text-muted-foreground">100+ Biomarkers & CBC</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("PRESCRIPTION")}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-sm flex flex-col justify-between ${
            selectedCategory === "PRESCRIPTION"
              ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow"
              : "bg-card border-border/80 text-muted-foreground hover:bg-accent/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Pill className="h-5 w-5 text-indigo-500" />
            {selectedCategory === "PRESCRIPTION" && <CheckCircle2 className="h-4 w-4 text-indigo-500" />}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-extrabold text-foreground">Prescriptions</p>
            <p className="text-[10px] text-muted-foreground">Medicines & Symptoms</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("SCAN")}
          className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-sm flex flex-col justify-between ${
            selectedCategory === "SCAN"
              ? "bg-purple-500/15 border-purple-500 text-purple-600 dark:text-purple-400 font-bold shadow"
              : "bg-card border-border/80 text-muted-foreground hover:bg-accent/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-purple-500" />
            {selectedCategory === "SCAN" && <CheckCircle2 className="h-4 w-4 text-purple-500" />}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-extrabold text-foreground">AI Scans</p>
            <p className="text-[10px] text-muted-foreground">X-Rays & 3D CT/MRI</p>
          </div>
        </button>
      </div>

      {/* Upload Zone Card */}
      <Card className="shadow-md border-border/80">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" /> Select Medical Files
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Supports PDFs, Images (PNG, JPG, WEBP), and DICOM Medical Scans (.dcm, .nii).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-2xl p-8 text-center hover:bg-muted/40 transition-colors border-primary/30 bg-card active:scale-[0.99] cursor-pointer">
            <input
              id="unified-file-upload"
              type="file"
              multiple
              className="sr-only"
              onChange={handleFileChange}
              accept="image/*,application/pdf,.dcm,.nii,.nii.gz"
            />
            <label htmlFor="unified-file-upload" className="cursor-pointer flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-inner">
                <Camera className="h-7 w-7" />
              </div>
              <span className="text-sm font-extrabold text-foreground">Tap or Drop Files Here</span>
              <span className="text-xs text-muted-foreground mt-1">Select single or multiple medical files</span>
            </label>
          </div>

          {/* Selected files queue */}
          {files.length > 0 && !uploading && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Selected Files ({files.length}):
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-2xl p-2 bg-muted/20">
                {files.map((file, idx) => {
                  const target = getTargetEndpoint(file, selectedCategory)
                  return (
                    <div key={idx} className="flex items-center justify-between bg-card p-3 rounded-xl border shadow-sm">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold truncate text-foreground">{file.name}</p>
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Detected as: {target.typeName}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 ml-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(idx)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Upload progress state */}
          {uploading && (
            <div className="p-8 border rounded-2xl bg-primary/10 text-foreground flex flex-col items-center justify-center space-y-4 shadow-inner">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="font-extrabold text-lg animate-pulse text-foreground">Processing & Extracting Medical Data...</p>
                <p className="text-xs text-muted-foreground mt-1">Processing file {uploadProgress} of {files.length}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl border bg-destructive/10 border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={files.length === 0 || uploading} className="w-full h-12 text-base font-bold shadow-md rounded-xl">
            {uploading ? `Processing ${uploadProgress}/${files.length}...` : `Upload & Process ${files.length} Medical File${files.length > 1 ? "s" : ""}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
