"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, Camera, X, Pill, Activity, CheckCircle2, AlertTriangle, FileSpreadsheet, Loader2, Lock } from "lucide-react"
import DocumentUploadLoader from "@/components/DocumentUploadLoader"

export const dynamic = "force-dynamic"

type DocumentCategory = "REPORT" | "PRESCRIPTION" | "SCAN"

interface ProcessedFileItem {
  file: File
  detectedType: "SCAN" | "PRESCRIPTION" | "REPORT"
  typeName: string
  confidencePct: number
  reason: string
  classifying: boolean
}

export default function UnifiedUploadPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>("REPORT")
  const [fileItems, setFileItems] = useState<ProcessedFileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")

  const classifyFile = async (file: File): Promise<ProcessedFileItem> => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/classify-document", {
        method: "POST",
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        return {
          file,
          detectedType: data.documentType || "REPORT",
          typeName: data.typeName || "Lab Report",
          confidencePct: data.confidencePct || 85,
          reason: data.reason || "AI Document Inspection",
          classifying: false
        }
      }
    } catch (err) {
      console.warn("Classification note:", err)
    }

    const fname = file.name.toLowerCase()
    if (fname.endsWith(".dcm") || fname.endsWith(".nii") || /xray|scan|ct|mri/i.test(fname)) {
      return { file, detectedType: "SCAN", typeName: "AI Diagnostic Scan (X-Ray/CT)", confidencePct: 90, reason: "DICOM/Scan Signature", classifying: false }
    }
    if (/prescription|rx|medicine|doctor/i.test(fname)) {
      return { file, detectedType: "PRESCRIPTION", typeName: "Doctor Prescription", confidencePct: 88, reason: "Prescription Signature", classifying: false }
    }

    return { file, detectedType: "REPORT", typeName: "Biomarker Lab Report", confidencePct: 80, reason: "Standard Document", classifying: false }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      
      const initialItems: ProcessedFileItem[] = newFiles.map(f => ({
        file: f,
        detectedType: selectedCategory,
        typeName: selectedCategory === "SCAN" ? "AI Diagnostic Scan" : selectedCategory === "PRESCRIPTION" ? "Doctor Prescription" : "Lab Report",
        confidencePct: 95,
        reason: "User Category Selection",
        classifying: true
      }))

      setFileItems(prev => [...prev, ...initialItems])

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]
        const classified = await classifyFile(file)

        setFileItems(prev => prev.map(item => item.file === file ? classified : item))
      }
    }
  }

  const removeFileItem = (indexToRemove: number) => {
    setFileItems(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const getTargetEndpoint = (item: ProcessedFileItem, category: DocumentCategory): { endpoint: string; redirect: string; displayType: string } => {
    if (category === "REPORT") {
      return { endpoint: "/api/extract-report", redirect: "/patient/dashboard", displayType: "Biomarker Lab Report" }
    }
    if (category === "PRESCRIPTION") {
      return { endpoint: "/api/prescriptions/upload", redirect: "/patient/prescriptions", displayType: "Doctor Prescription" }
    }
    return { endpoint: "/api/analyze-scan", redirect: "/patient/scan-analysis", displayType: "AI Diagnostic Scan" }
  }

  const handleUpload = async () => {
    if (fileItems.length === 0) return

    setUploading(true)
    setError("")
    setUploadProgress(0)

    let hasError = false
    let currentIdx = 0
    let finalRedirect = "/patient/dashboard"

    for (const item of fileItems) {
      setUploadProgress(currentIdx + 1)
      const target = getTargetEndpoint(item, selectedCategory)
      finalRedirect = target.redirect

      const formData = new FormData()
      formData.append("file", item.file)

      try {
        const res = await fetch(target.endpoint, {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          hasError = true
          const errorData = await res.json().catch(() => ({}))
          setError(errorData.error || `Upload failed for ${item.file.name} (Status ${res.status}).`)
          break
        }
      } catch (err) {
        hasError = true
        setError(`An error occurred while uploading ${item.file.name}.`)
        break
      }
      currentIdx++
    }

    setUploading(false)
    setUploadProgress(0)

    if (!hasError) {
      setFileItems([])
      router.push(finalRedirect)
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-6 md:mt-10 px-4 pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
          <UploadCloud className="h-7 w-7 sm:h-8 sm:w-8 text-primary" /> Medical Document Upload Hub
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Upload and extract data from your <strong>Lab Reports</strong> and <strong>Doctor Prescriptions</strong>.
        </p>
      </div>

      {/* Category Selection Tabs (Lab Reports, Prescriptions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSelectedCategory("REPORT")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 shadow-sm flex flex-col justify-between ${
            selectedCategory === "REPORT"
              ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow"
              : "bg-card border-border/80 text-muted-foreground hover:bg-accent/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
            {selectedCategory === "REPORT" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground">Lab Reports</p>
            <p className="text-xs text-muted-foreground mt-0.5">100+ Biomarkers, Blood Tests & CBC</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory("PRESCRIPTION")}
          className={`p-4 rounded-2xl border text-left transition-all duration-200 shadow-sm flex flex-col justify-between ${
            selectedCategory === "PRESCRIPTION"
              ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow"
              : "bg-card border-border/80 text-muted-foreground hover:bg-accent/50"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Pill className="h-6 w-6 text-indigo-500" />
            {selectedCategory === "PRESCRIPTION" && <CheckCircle2 className="h-5 w-5 text-indigo-500" />}
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground">Prescriptions</p>
            <p className="text-xs text-muted-foreground mt-0.5">Medicines, Dosages & Symptoms</p>
          </div>
        </button>
      </div>

      {/* Upload Zone Card */}
      <Card className="shadow-md border-border/80">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" /> Select {selectedCategory === "PRESCRIPTION" ? "Prescription" : "Lab Report"} Files
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Supports PDFs and Images (PNG, JPG, WEBP).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {false ? null : (
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
          )}

          {/* Selected files queue */}
          {fileItems.length > 0 && !uploading && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Selected Files ({fileItems.length}):</span>
              </p>
              <div className="max-h-72 overflow-y-auto space-y-2 border rounded-2xl p-2 bg-muted/20">
                {fileItems.map((item, idx) => {
                  const target = getTargetEndpoint(item, selectedCategory)
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-3.5 rounded-xl border shadow-sm gap-2">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold truncate text-foreground">{item.file.name}</p>
                          <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border mt-1 ${
                            selectedCategory === "SCAN"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                              : selectedCategory === "PRESCRIPTION"
                              ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          }`}>
                            Processing as: {target.displayType}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                        <span className="text-xs text-muted-foreground">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <Button variant="ghost" size="icon" onClick={() => removeFileItem(idx)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
            <DocumentUploadLoader />
          )}

          {error && (
            <div className="p-3 rounded-xl border bg-destructive/10 border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={fileItems.length === 0 || uploading || (selectedCategory === "SCAN" && session?.user?.paymentStatus !== "ACTIVE")} className="w-full h-12 text-base font-bold shadow-md rounded-xl">
            {uploading ? `Processing ${uploadProgress}/${fileItems.length}...` : `Upload & Process ${fileItems.length} ${selectedCategory === "SCAN" ? "Medical Scan" : selectedCategory === "PRESCRIPTION" ? "Prescription" : "Lab Report"}${fileItems.length > 1 ? "s" : ""}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
