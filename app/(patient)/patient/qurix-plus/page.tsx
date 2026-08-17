"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, QrCode, Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react"

export default function QurixPlusPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "PENDING">("IDLE")

  const handlePayment = async () => {
    setIsProcessing(true)
    try {
      const res = await fetch("/api/upgrade", {
        method: "POST"
      })
      if (res.ok) {
        setPaymentStatus("PENDING")
        setTimeout(() => {
            router.refresh()
        }, 2000)
      }
    } catch (err) {
      console.error(err)
    }
    setIsProcessing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-6 md:mt-10 px-4 pb-16 animate-in fade-in duration-300">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
          Upgrade to QURIX Plus
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Unlock 3D Radiology AI and unlimited historical trend downloads for just <strong className="text-foreground">Rs 29/month</strong>.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-500" /> Free Tier (Current)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" /> <span className="text-sm">Unlimited Lab Report Uploads</span></div>
              <div className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" /> <span className="text-sm">Standard Prescription Parsing</span></div>
              <div className="flex items-start gap-2 text-muted-foreground"><Lock className="h-5 w-5 flex-shrink-0" /> <span className="text-sm">3D X-Ray & CT Scan AI Analysis</span></div>
              <div className="flex items-start gap-2 text-muted-foreground"><Lock className="h-5 w-5 flex-shrink-0" /> <span className="text-sm">Historical Trend Report Downloads</span></div>
            </CardContent>
          </Card>

          <Card className="border-indigo-500/50 bg-indigo-500/10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-400">
                ✨ QURIX Plus
              </CardTitle>
              <CardDescription>Everything in Free, plus:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" /> <span className="text-sm font-medium">3D X-Ray & CT Scan AI Analysis</span></div>
              <div className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" /> <span className="text-sm font-medium">Historical Trend Report Downloads</span></div>
              <div className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-indigo-400 flex-shrink-0" /> <span className="text-sm font-medium">Priority AI Processing Queue</span></div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-xl border-border/80 h-full flex flex-col justify-center">
            <CardHeader className="text-center">
              <CardTitle>Complete Your Upgrade</CardTitle>
              <CardDescription>Scan the QR code below using any UPI app to pay Rs 29.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              
              {paymentStatus === "IDLE" ? (
                <>
                  <div className="bg-white p-4 rounded-xl shadow-inner border">
                    <QrCode className="h-48 w-48 text-gray-800" strokeWidth={1} />
                  </div>
                  <p className="text-sm font-mono bg-muted p-2 rounded-md">UPI ID: qurix@okaxis</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                   <div className="relative w-16 h-16 flex items-center justify-center">
                     <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full"></div>
                     <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                     <ShieldCheck className="h-6 w-6 text-emerald-500" />
                   </div>
                   <h3 className="text-xl font-bold text-emerald-500">Payment Under Review</h3>
                   <p className="text-sm text-muted-foreground">Your request has been received. Our team will verify the transaction and unlock your premium features shortly.</p>
                </div>
              )}
            </CardContent>
            
            {paymentStatus === "IDLE" && (
                <CardFooter>
                <Button 
                    onClick={handlePayment} 
                    disabled={isProcessing} 
                    className="w-full h-12 text-base font-bold shadow-md rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {isProcessing ? "Processing..." : "I have paid Rs 29"} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
