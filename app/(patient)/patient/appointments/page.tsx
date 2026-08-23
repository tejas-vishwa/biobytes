"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, Activity } from "lucide-react"

export const dynamic = "force-dynamic"

function QueueStatusBadge({ appointmentId }: { appointmentId: string }) {
  const [position, setPosition] = useState<number | null>(null)

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch(`/api/appointments/queue/${appointmentId}`)
        if (res.ok) {
          const data = await res.json()
          setPosition(data.position)
        }
      } catch (e) {
        console.error(e)
      }
    }
    
    fetchQueue()
    const interval = setInterval(fetchQueue, 15000) // Poll every 15 seconds
    return () => clearInterval(interval)
  }, [appointmentId])

  if (position === null) return <span className="text-xs animate-pulse">Calculating queue...</span>
  
  return (
    <div className="flex items-center space-x-1 text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md animate-in fade-in">
      <Activity className="h-4 w-4 mr-1 animate-pulse" />
      Queue: #{position} in line
    </div>
  )
}

export default function PatientAppointmentsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    time: "",
    preUploadData: false,
    type: "OFFLINE"
  })

  const fetchData = async () => {
    try {
      const [docRes, apptRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch("/api/appointments")
      ])
      if (docRes.ok) setDoctors(await docRes.json())
      if (apptRes.ok) setAppointments(await apptRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let isoScheduledTime = ""
      if (form.date && form.time) {
        const [year, month, day] = form.date.split('-').map(Number)
        const [hours, minutes] = form.time.split(':').map(Number)
        const localScheduledDate = new Date(year, month - 1, day, hours, minutes)
        isoScheduledTime = localScheduledDate.toISOString()
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          scheduledTime: isoScheduledTime
        })
      })
      if (res.ok) {
        setForm({ doctorId: "", date: "", time: "", preUploadData: false, type: "OFFLINE" })
        fetchData()
      } else {
        const errorData = await res.json()
        alert(`Failed to book appointment: ${errorData.error || 'Unknown error'}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">Book and manage your doctor consultations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Book New Appointment</CardTitle>
            <CardDescription>Schedule a visit with our partnered doctors.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Doctor</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.doctorId}
                  onChange={e => setForm({...form, doctorId: e.target.value})}
                  required
                >
                  <option value="" disabled>Choose a doctor...</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.doctorProfile?.specialization || "General"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      className="pl-9"
                      value={form.date}
                      onChange={e => setForm({...form, date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Slot (Hourly)</label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <select 
                      className="flex h-10 w-full pl-9 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Consultation Type</label>
                <div className="flex space-x-6 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="OFFLINE"
                      checked={form.type === "OFFLINE"}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">In-clinic</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="ONLINE"
                      checked={form.type === "ONLINE"}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Video Consultation</span>
                  </label>
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
                <label htmlFor="preupload" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Generate & Share E-Health PIN automatically
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading || fetching}>
                {loading ? "Booking..." : "Confirm Appointment"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled consultations.</CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                No upcoming appointments.
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map(appt => (
                  <div key={appt.id} className="flex flex-col space-y-2 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm flex items-center">
                            {appt.doctor?.name}
                            {appt.type === "ONLINE" && (
                              <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">Video</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">Status: <span className="text-primary font-medium">{appt.status}</span></p>
                        </div>
                      </div>
                      
                      {(appt.status === "ACCEPTED" || appt.status === "PENDING") && (
                        <div className="flex items-center mt-2 sm:mt-0">
                          <QueueStatusBadge appointmentId={appt.id} />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {new Date(appt.scheduledTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-3 w-3" />
                        {new Date(appt.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    {appt.accessCode && (
                      <div className="mt-2 bg-emerald-50 text-emerald-700 text-xs px-3 py-2 rounded flex items-center border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3 mr-2" />
                        Shared E-Health PIN: <strong className="ml-1 tracking-widest">{appt.accessCode}</strong>
                      </div>
                    )}
                    
                    {appt.type === "ONLINE" && appt.status === "ACCEPTED" && (
                      <div className="mt-2 pt-2 border-t">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700" 
                          onClick={() => window.location.href = `/patient/consultation/${appt.id}`}
                        >
                          Join Video Call
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
