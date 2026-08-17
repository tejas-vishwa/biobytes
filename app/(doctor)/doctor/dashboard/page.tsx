"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Clock, User, QrCode, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"

export const dynamic = "force-dynamic"

export default function DoctorDashboardPage() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/appointments")
      if (res.ok) {
        setAppointments(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setFetching(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (res.ok) fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  // Dynamically use the current Vercel URL
  const appUrl = typeof window !== 'undefined' ? window.location.origin : "";

  const bookingUrl = appUrl && session?.user?.id 
    ? `${appUrl}/patient/book/${session.user.id}` 
    : ""

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Manage your upcoming patient appointments & queue.</p>
        </div>
        <Link href="/doctor/access">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <QrCode className="mr-2 h-4 w-4" /> Scan Patient Access Code
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* QR Code Section */}
        <Card className="md:col-span-1 glass-panel">
          <CardHeader>
            <CardTitle>My Booking QR Code</CardTitle>
            <CardDescription>Patients can scan this in the lobby to join your queue.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-4">
            {bookingUrl ? (
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <QRCodeSVG value={bookingUrl} size={180} />
              </div>
            ) : (
              <div className="h-[180px] w-[180px] bg-slate-100 animate-pulse rounded-xl" />
            )}
            <p className="text-xs text-center text-muted-foreground mt-2">
              Print this or display it on a tablet at your reception.
            </p>
          </CardContent>
        </Card>

        {/* Live Queue Section */}
        <Card className="md:col-span-2 glass-panel">
          <CardHeader>
            <CardTitle>Live Patient Queue</CardTitle>
            <CardDescription>Your schedule for today and beyond.</CardDescription>
          </CardHeader>
          <CardContent>
            {fetching ? (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>
            ) : appointments.filter(a => a.status !== "REJECTED").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                No active appointments in your queue.
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter(appt => appt.status !== "REJECTED" && appt.status !== "CHECKED")
                  .map(appt => (
                  <div key={appt.id} className="flex flex-col space-y-3 p-4 border rounded-lg bg-card shadow-sm transition-all hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-100 p-2.5 rounded-full">
                          <User className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{appt.patient?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: 
                            <span className={`ml-1 font-medium ${appt.status === 'ACCEPTED' ? 'text-primary' : 'text-amber-500'}`}>
                              {appt.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {appt.status === "PENDING" && (
                          <>
                            <Button size="sm" variant="outline" className="h-9" onClick={() => handleUpdateStatus(appt.id, "REJECTED")}>Decline</Button>
                            <Button size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus(appt.id, "ACCEPTED")}>Accept & Queue</Button>
                          </>
                        )}
                        {appt.status === "ACCEPTED" && (
                          <Button size="sm" variant="default" className="h-9 w-full sm:w-auto" onClick={() => handleUpdateStatus(appt.id, "CHECKED")}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Checked
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-3 border-t mt-2">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-emerald-500" />
                        {new Date(appt.scheduledTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-emerald-500" />
                        {new Date(appt.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    {appt.accessCode && appt.status === "ACCEPTED" && (
                      <div className="mt-3 bg-muted/60 text-foreground text-sm px-4 py-3 rounded-lg flex items-center justify-between border border-border">
                        <div className="flex items-center">
                          PIN provided: <strong className="ml-2 tracking-widest text-emerald-500 text-lg">{appt.accessCode}</strong>
                        </div>
                        <Link href={`/doctor/access?code=${appt.accessCode}`}>
                          <Button variant="outline" size="sm" className="h-auto">
                            Access File
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Checked Appointments Section */}
                {appointments.filter(a => a.status === "CHECKED").length > 0 && (
                  <div className="pt-6 border-t border-border mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-foreground flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-2" />
                        Recently Checked Patients ({appointments.filter(a => a.status === "CHECKED").length})
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {appointments.filter(a => a.status === "CHECKED").map(appt => (
                        <div key={appt.id} className="flex flex-col space-y-3 p-4 border border-border rounded-xl bg-card shadow-sm transition-all hover:shadow-md">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div className="flex items-center space-x-3">
                              <div className="bg-emerald-500/10 p-2.5 rounded-full">
                                <User className="h-5 w-5 text-emerald-500" />
                              </div>
                              <div>
                                <p className="font-semibold text-base text-foreground">{appt.patient?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Email: <span className="text-foreground">{appt.patient?.email || "N/A"}</span>
                                </p>
                              </div>
                            </div>
                            
                            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full w-fit">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed & Checked
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
                            <div className="flex items-center">
                              <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                              {new Date(appt.scheduledTime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                              {new Date(appt.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          {appt.accessCode && (
                            <div className="mt-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-xs px-3 py-2 rounded-lg flex items-center justify-between border border-emerald-500/20">
                              <div className="flex items-center font-medium">
                                Shared PIN: <strong className="ml-1.5 tracking-widest text-emerald-500 text-sm">{appt.accessCode}</strong>
                              </div>
                              <Link href={`/doctor/access?code=${appt.accessCode}`}>
                                <Button variant="outline" size="sm" className="h-7 text-xs border-emerald-500/30 hover:bg-emerald-500/20">
                                  Access File
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
