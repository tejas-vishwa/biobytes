"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileText, Activity, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Cpu, Stethoscope, Layers, ShieldCheck, Zap } from "lucide-react"

export default function ScanAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
      setError("")
      setResults(null)
    }
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setAnalyzing(true)
    setError("")
    setResults(null)

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch("/api/analyze-scan", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to analyze scan")
      }

      const data = await res.json()
      setResults(data)
    } catch (err: any) {
      console.error("Scan analysis error:", err)
      setError(err.message || "An error occurred while communicating with the AI microservice.")
    } finally {
      setAnalyzing(false)
    }
  }

  const getRiskColor = (risk: string) => {
    if (risk === "HIGH" || risk === "CRITICAL") return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
    if (risk === "MODERATE") return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
  }

  const getProbBarColor = (prob: number) => {
    if (prob >= 40.0) return "bg-red-500"
    if (prob >= 15.0) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" /> AI Diagnostic Scan Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep Learning AI inference for Chest X-Rays, CT Scans, and MRIs powered by <strong>TorchXRayVision</strong> and <strong>MONAI</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
          <Cpu className="h-4 w-4" /> PyTorch Microservice Ready
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: File Upload Card */}
        <Card className="md:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary" /> Upload Medical Scan
            </CardTitle>
            <CardDescription>
              Supports 2D X-Rays (PNG, JPG) & 3D CT/MRI Scans (DICOM .dcm, NIfTI .nii).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/40 transition-colors border-primary/30 bg-card">
                <input
                  id="scan-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,.dcm,.nii,.nii.gz"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <label htmlFor="scan-file-input" className="cursor-pointer flex flex-col items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Layers className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Click to select scan</span>
                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG, DICOM (.dcm), NIfTI</span>
                </label>
              </div>

              {selectedFile && (
                <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold truncate">{selectedFile.name}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={!selectedFile || analyzing}
                className="w-full h-11 text-sm font-bold shadow"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running PyTorch AI Inference...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" /> Run AI Diagnostic Analysis
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col items-start border-t pt-4 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> HIPAA Compliant Local Pipeline
            </div>
            <p className="text-[11px]">Images are processed through TorchXRayVision DenseNet-121 and MONAI 3D models.</p>
          </CardFooter>
        </Card>

        {/* Right Column: AI Analysis Results Dashboard */}
        <Card className="md:col-span-2 shadow-md">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" /> Diagnostic AI Results Dashboard
                </CardTitle>
                <CardDescription>
                  14 Chest Pathologies & 3D Volumetric Segmentation Analytics
                </CardDescription>
              </div>
              {results && (
                <div className={`px-3 py-1 rounded-full border font-bold text-xs flex items-center gap-1.5 ${getRiskColor(results.overallRisk)}`}>
                  <Activity className="h-3.5 w-3.5" /> Overall Risk: {results.overallRisk}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!results && !analyzing && (
              <div className="py-16 text-center text-muted-foreground flex flex-col items-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-8 w-8" />
                </div>
                <p className="font-semibold text-base">No Scan Analyzed Yet</p>
                <p className="text-xs max-w-sm">
                  Upload a Chest X-Ray or 3D CT scan file on the left to run AI inference via TorchXRayVision and MONAI.
                </p>
              </div>
            )}

            {analyzing && (
              <div className="py-16 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="relative h-16 w-16">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div>
                  <p className="font-bold text-lg animate-pulse">Running AI Microservice Inference...</p>
                  <p className="text-xs text-muted-foreground mt-1">Normalizing tensor values (-1024 to 1024) & processing 14 pathology probability scores</p>
                </div>
              </div>
            )}

            {results && (
              <div className="space-y-6">
                {/* Meta info header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-card border">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase">Modality</span>
                    <p className="font-bold text-sm text-foreground">{results.modality}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase">AI Engine</span>
                    <p className="font-bold text-sm text-foreground">{results.modelUsed}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase">Primary Indicator</span>
                    <p className="font-bold text-sm text-foreground">{results.pathologies?.[0]?.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase">Execution Speed</span>
                    <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{results.executionTimeSeconds}s</p>
                  </div>
                </div>

                {/* AI Findings Summary Banner */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary-foreground">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Clinical AI Summary</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{results.summary}</p>
                </div>

                {/* Pathology Probability Bars Grid */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                    <span>Chest Pathologies Probability Map ({results.pathologies?.length || 0})</span>
                    <span className="text-[11px] font-normal">Risk Thresholds: High &gt; 40% | Mod &gt; 15%</span>
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {results.pathologies?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl border bg-card flex flex-col justify-between space-y-2 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-foreground flex items-center gap-1.5">
                            {item.status === "CRITICAL" ? (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            ) : item.status === "MODERATE" ? (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                            {item.name}
                          </span>
                          <span className={`${item.status === "CRITICAL" ? "text-red-600 font-extrabold" : item.status === "MODERATE" ? "text-amber-600 font-bold" : "text-emerald-600 font-medium"}`}>
                            {item.probability}%
                          </span>
                        </div>

                        {/* Progress bar container */}
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getProbBarColor(item.probability)}`}
                            style={{ width: `${Math.min(100, Math.max(3, item.probability))}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
