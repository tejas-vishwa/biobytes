"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon, Clock, ArrowLeft } from "lucide-react"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.doctorId as string
  
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    doctorId: doctorId,
    date: new Date().toISOString().split('T')[0], // Default to today
    time: "",
    preUploadData: false
  })

  useEffect(() => {
    async function fetchDoctor() {
      try {
        const res = await fetch("/api/doctors")
        if (res.ok) {
          const doctors = await res.json()
          const found = doctors.find((d: any) => d.id === doctorId)
          if (found) {
            setDoctor(found)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchDoctor()
  }, [doctorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        router.push("/patient/appointments")
      } else {
        const errorData = await res.json()
        alert(`Failed to book appointment: ${errorData.error || 'Unknown error'}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  if (!doctor) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 pt-12">
        <h2 className="text-2xl font-bold">Doctor Not Found</h2>
        <p className="text-muted-foreground">The QR code you scanned is invalid or the doctor no longer exists.</p>
        <Button onClick={() => router.push("/patient/dashboard")}>Return to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pt-4">
      <Button variant="ghost" className="mb-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Join Hospital Queue</h1>
        <p className="text-muted-foreground">Book your appointment with {doctor.name} instantly.</p>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Scan & Book</CardTitle>
          <CardDescription>
            You are booking an appointment with <strong>{doctor.name}</strong> 
            {doctor.doctorProfile?.specialization && ` (${doctor.doctorProfile.specialization})`}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="date" 
                  className="pl-10"
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Slot (Hourly)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <select 
                  className="flex h-10 w-full pl-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.time}
                  onChange={e => setForm({...form, time: e.target.value})}
                  required
                >
                  <option value="" disabled>Select a time...</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="preupload"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={form.preUploadData}
                onChange={e => setForm({...form, preUploadData: e.target.checked})}
              />
              <label htmlFor="preupload" className="text-sm font-medium leading-none">
                Generate & Share E-Health PIN automatically
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg shadow-lg" disabled={submitting}>
              {submitting ? "Joining Queue..." : "Join Queue Now"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
