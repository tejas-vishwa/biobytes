"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, Camera, X } from "lucide-react"

export const dynamic = "force-dynamic"

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0) // Tracks current file index being uploaded
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

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setError("")
    setUploadProgress(0)

    let hasError = false
    let currentIdx = 0

    for (const file of files) {
      setUploadProgress(currentIdx + 1)
      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch("/api/extract-report", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          hasError = true
          const errorData = await res.json().catch(() => ({}))
          setError(errorData.error || `Upload failed for ${file.name} (Status ${res.status}).`)
          break // Stop sequence on first error to prevent cascading failures
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
      setFiles([]) // Clear queue
      router.push("/patient/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Reports</h1>
        <p className="text-muted-foreground">Upload your lab reports (PDF/JPG/PNG). You can select multiple files at once.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Files or Snap Photos</CardTitle>
          <CardDescription>Max file size: 10MB per file. Data will be automatically extracted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors">
            <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-4">
              <label htmlFor="file-upload" className="cursor-pointer font-medium bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md inline-block shadow-sm transition-all active:scale-95">
                <span>Select Files</span>
                <input id="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept="image/*,application/pdf" />
              </label>
              <p className="text-sm text-muted-foreground block">Select multiple PDFs or Images</p>
            </div>
          </div>
          
          {files.length > 0 && !uploading && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Files ({files.length}):</p>
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2 bg-muted/20">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-background p-3 rounded-md border shadow-sm">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 ml-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <Button variant="ghost" size="icon" onClick={() => removeFile(idx)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {uploading && (
            <div className="p-8 border rounded-lg bg-emerald-50 text-emerald-700 flex flex-col items-center justify-center space-y-4 shadow-inner">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg animate-pulse">Extracting Data...</p>
                <p className="text-sm text-emerald-600/80 mt-1">Processing file {uploadProgress} of {files.length}</p>
              </div>
            </div>
          )}
          
          {error && <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={files.length === 0 || uploading} className="w-full h-12 text-lg">
            {uploading ? `Processing ${uploadProgress}/${files.length}...` : `Upload ${files.length} Report${files.length > 1 ? 's' : ''}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
