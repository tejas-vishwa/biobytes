"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DailyVideoCall } from "@/components/telehealth/DailyVideoCall"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PatientConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.appointmentId as string
  const { data: session } = useSession()

  const [roomData, setRoomData] = useState<{ roomUrl: string, token: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [callEnded, setCallEnded] = useState(false)

  useEffect(() => {
    async function initRoom() {
      try {
        const res = await fetch("/api/telehealth/room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId })
        })
        
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to initialize room")
        }

        const data = await res.json()
        setRoomData(data)

        // Mark as IN_PROGRESS
        await fetch("/api/telehealth/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId })
        })

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      initRoom()
    }
  }, [appointmentId, session])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Connection Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/patient/appointments")}>Return to Appointments</Button>
      </div>
    )
  }

  if (callEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 max-w-md mx-auto text-center">
        <div className="bg-emerald-100 p-4 rounded-full mb-4">
          <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Consultation Ended</h2>
        <p className="text-muted-foreground text-lg">
          Your doctor is now generating your prescription and clinical summary.
        </p>
        <Card className="w-full p-4 mt-6 bg-slate-50 border-dashed border-2">
          <p className="text-sm text-slate-600">
            You will receive a notification once your AI-generated clinical summary and lab recommendations are ready.
          </p>
        </Card>
        <Button className="mt-8 w-full" onClick={() => router.push("/patient/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full h-[85vh] flex flex-col pt-2">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Video Consultation</h1>
        <p className="text-muted-foreground text-sm">Waiting for your doctor to join the call.</p>
      </div>
      
      <div className="flex-1 bg-black rounded-xl overflow-hidden shadow-2xl relative">
        {roomData && (
          <DailyVideoCall 
            roomUrl={roomData.roomUrl} 
            token={roomData.token} 
            isDoctor={false}
            onLeave={() => setCallEnded(true)}
          />
        )}
      </div>
    </div>
  )
}
