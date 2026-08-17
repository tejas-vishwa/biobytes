"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stethoscope, QrCode } from "lucide-react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export const dynamic = "force-dynamic"

export default function DoctorAccessPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (scanning) {
      // Allow Dialog animation to finish rendering the #reader div
      const timer = setTimeout(() => {
        scanner = new Html5QrcodeScanner("reader", { qrbox: { width: 250, height: 250 }, fps: 5 }, false)
        scanner.render((decodedText) => {
           setCode(decodedText.replace(/^(QRX-|BIO-)/i, ''))
           setScanning(false)
        }, (err) => {
           // Ignore frame errors
        })
      }, 150)
      
      return () => { 
        clearTimeout(timer)
        if (scanner) {
          try {
            scanner.clear().catch(console.error)
          } catch(e) {}
        }
      }
    }
  }, [scanning])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/doctor/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }) // Supports 6-digit PIN
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/doctor/patient/${data.sessionId}`)
      } else {
        setError("Invalid or expired code")
      }
    } catch (e) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card className="border-t-4 border-t-emerald-500 shadow-lg">
        <CardHeader className="text-center">
          <Stethoscope className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
          <CardTitle className="text-2xl">Patient Access</CardTitle>
          <CardDescription>Enter the 6-digit PIN or scan QR code.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="text-sm font-medium text-destructive text-center bg-destructive/10 py-2 rounded">{error}</div>}
            
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">Access PIN</label>
              <div className="flex space-x-2">
                <Input
                  id="code"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  className="text-center font-mono text-lg tracking-widest uppercase h-12"
                />
                
                <Dialog open={scanning} onOpenChange={setScanning}>
                  <DialogTrigger className="flex h-12 w-12 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                    <QrCode className="h-6 w-6" />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center">Scan QR Code</DialogTitle>
                    </DialogHeader>
                    <div id="reader" className="mx-auto w-full max-w-sm"></div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700" disabled={loading || code.length !== 6}>
              {loading ? "Validating..." : "View Patient History"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Demo tip: Try using PIN <strong>123456</strong>
      </div>
    </div>
  )
}
