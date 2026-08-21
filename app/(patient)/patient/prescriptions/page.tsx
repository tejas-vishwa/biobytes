"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill, UploadCloud, FileText, Loader2, Thermometer, Activity, Eye, Trash2, CheckCircle2, Stethoscope, HeartPulse, BellPlus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null)
  
  const { toast } = useToast()
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [reminderMedicine, setReminderMedicine] = useState("")
  const [reminderTime, setReminderTime] = useState("08:00")
  const [savingReminder, setSavingReminder] = useState(false)

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  async function fetchPrescriptions() {
    try {
      const res = await fetch("/api/prescriptions")
      if (res.ok) {
        const data = await res.json()
        setPrescriptions(data)
        if (data.length > 0 && !selectedPrescription) {
          setSelectedPrescription(data[0])
        }
      }
    } catch (e) {
      console.error("Error fetching prescriptions:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch("/api/prescriptions/upload", {
        method: "POST",
        body: formData
      })

      if (res.ok) {
        setSelectedFile(null)
        await fetchPrescriptions()
      } else {
        const err = await res.json()
        alert(err.error || "Failed to parse prescription")
      }
    } catch (err) {
      console.error("Upload error:", err)
      alert("Error uploading prescription")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this prescription permanently?")) return

    try {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        if (selectedPrescription?.id === id) {
          setSelectedPrescription(null)
        }
        await fetchPrescriptions()
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function handleAddReminder(e: React.FormEvent) {
    e.preventDefault()
    setSavingReminder(true)
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescriptionId: selectedPrescription?.id,
          medicineName: reminderMedicine,
          reminderTime: reminderTime
        })
      })
      
      if (res.ok) {
        toast({ title: "Reminder Scheduled!", description: `Email reminder set for ${reminderMedicine} at ${reminderTime}` })
        setIsReminderModalOpen(false)
      } else {
        toast({ title: "Error", description: "Failed to set reminder.", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to set reminder.", variant: "destructive" })
    } finally {
      setSavingReminder(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Pill className="h-8 w-8 text-emerald-600 dark:text-emerald-400" /> My Prescriptions
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload doctor prescriptions to extract medicines, dosages, recorded symptoms, and body temperature.
          </p>
        </div>
      </div>

      {/* Upload Box Card */}
      <Card className="border-2 border-dashed border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Upload Doctor Prescription
          </CardTitle>
          <CardDescription>
            Supports PDF documents and prescription images (PNG, JPG, JPEG).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 text-sm text-muted-foreground w-full cursor-pointer"
            />
            <Button
              type="submit"
              disabled={!selectedFile || uploading}
              className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto font-semibold"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> OCR Extracting...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload & Process
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Main Grid Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Prescription List */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Prescription Records</span>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                {prescriptions.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground flex flex-col items-center">
                <Loader2 className="h-6 w-6 animate-spin mb-2 text-emerald-600" />
                Loading records...
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No prescriptions uploaded yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {prescriptions.map((p) => {
                  const isSelected = selectedPrescription?.id === p.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPrescription(p)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-accent/50 flex items-center justify-between ${
                        isSelected ? "bg-emerald-500/10 border-l-4 border-emerald-600" : ""
                      }`}
                    >
                      <div className="space-y-1 overflow-hidden">
                        <p className="font-semibold text-sm truncate" title={p.fileName}>
                          {p.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.doctorName || "Prescription Report"} • {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(p.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Detailed View */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  {selectedPrescription ? selectedPrescription.fileName : "Prescription Details"}
                </CardTitle>
                {selectedPrescription && (
                  <CardDescription className="mt-1">
                    Uploaded on {new Date(selectedPrescription.createdAt).toLocaleString()}
                    {selectedPrescription.doctorName && ` • ${selectedPrescription.doctorName}`}
                  </CardDescription>
                )}
              </div>
              {selectedPrescription && (
                <a
                  href={selectedPrescription.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" /> View Original
                </a>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {!selectedPrescription ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Select a prescription from the list to view extracted details.
              </div>
            ) : (
              <>
                {/* Section 1: Medicines & Tablets */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Pill className="h-4 w-4" /> Medicines & Tablets Extracted
                  </h3>
                  {selectedPrescription.medicines?.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No specific medicines detected.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedPrescription.medicines.map((m: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl border bg-card/60 flex items-start justify-between shadow-sm">
                          <div>
                            <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" /> {m.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Dosage: <span className="font-semibold text-foreground">{m.dosage}</span></p>
                          </div>
                          {m.instructions && (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
                              {m.instructions}
                            </span>
                          )}
                          {m.duration && (
                            <span className="text-[11px] font-medium text-slate-700 bg-slate-100 dark:bg-slate-900 dark:text-slate-300 px-2 py-0.5 rounded ml-2">
                              {m.duration}
                            </span>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-xs h-7 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            onClick={() => {
                              setReminderMedicine(m.name)
                              setIsReminderModalOpen(true)
                            }}
                          >
                            <BellPlus className="h-3 w-3 mr-1" /> Add Reminder
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 2: Symptoms & Diagnosis */}
                <div className="space-y-3 pt-2 border-t">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" /> Recorded Symptoms & Diagnosis
                  </h3>
                  {selectedPrescription.symptoms?.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No specific symptoms recorded.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedPrescription.symptoms.map((s: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 3: Vitals & Temperature */}
                <div className="space-y-3 pt-2 border-t">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <HeartPulse className="h-4 w-4" /> Vitals & Temperature
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl border bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900">
                      <div className="flex items-center text-xs text-rose-600 font-semibold mb-1">
                        <Thermometer className="h-3.5 w-3.5 mr-1" /> Temperature
                      </div>
                      <p className="font-bold text-base">
                        {selectedPrescription.vitals?.temperature || "Not recorded"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                      <div className="flex items-center text-xs text-blue-600 font-semibold mb-1">
                        <Activity className="h-3.5 w-3.5 mr-1" /> Blood Pressure
                      </div>
                      <p className="font-bold text-base">
                        {selectedPrescription.vitals?.bp || "Not recorded"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
                      <div className="flex items-center text-xs text-purple-600 font-semibold mb-1">
                        <HeartPulse className="h-3.5 w-3.5 mr-1" /> Pulse Rate
                      </div>
                      <p className="font-bold text-base">
                        {selectedPrescription.vitals?.pulse || "Not recorded"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                      <div className="flex items-center text-xs text-amber-600 font-semibold mb-1">
                        <Activity className="h-3.5 w-3.5 mr-1" /> Weight
                      </div>
                      <p className="font-bold text-base">
                        {selectedPrescription.vitals?.weight || "Not recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isReminderModalOpen} onOpenChange={setIsReminderModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleAddReminder}>
            <DialogHeader>
              <DialogTitle>Set Medicine Reminder</DialogTitle>
              <DialogDescription>
                Schedule an email reminder for {reminderMedicine}. We will send you an email at this time.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right">
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReminderModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={savingReminder} className="bg-emerald-600 hover:bg-emerald-700">
                {savingReminder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellPlus className="mr-2 h-4 w-4" />}
                Save Reminder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
