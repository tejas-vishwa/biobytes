"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DailyVideoCall } from "@/components/telehealth/DailyVideoCall"
import { Button } from "@/components/ui/button"

export default function DoctorConsultationPage() {
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
        <Button onClick={() => router.push("/doctor/dashboard")}>Return to Dashboard</Button>
      </div>
    )
  }

  if (callEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold">Consultation Ended</h2>
        <p className="text-muted-foreground">
          The call has ended. You can now review the AI summary and finalize the prescription.
        </p>
        <Button className="mt-4 w-full" onClick={() => router.push("/doctor/dashboard")}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full h-[85vh] flex flex-col lg:flex-row gap-6 pt-2">
      {/* Daily Video (70%) */}
      <div className="flex-grow lg:w-2/3 flex flex-col h-full bg-black rounded-xl overflow-hidden shadow-2xl relative">
        {roomData && (
          <DailyVideoCall 
            roomUrl={roomData.roomUrl} 
            token={roomData.token} 
            isDoctor={true}
            onLeave={() => setCallEnded(true)}
          />
        )}
      </div>

      {/* Digital Twin Panel Placeholder (30%) - To be built fully in Phase 4 */}
      <div className="lg:w-1/3 h-full flex flex-col space-y-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm h-full flex flex-col">
          <h2 className="text-lg font-bold border-b pb-2 mb-4">Patient Digital Twin</h2>
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm px-4">
              Biomarker trends and live transcript will appear here in Phase 3 & 4.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
