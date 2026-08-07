"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check, Copy } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function ShareCodeButton({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState<string | undefined>(initialCode)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const generateCode = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/access-codes", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setCode(data.code)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpen = () => {
    if (!code) {
      generateCode()
    }
    setOpen(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2" onClick={handleOpen}>
        <Share2 className="mr-2 h-4 w-4" />
        {loading ? "Generating..." : (code ? "View Access Code" : "Share with Doctor")}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-center">Doctor Access Code</DialogTitle>
        </DialogHeader>
        
        {code ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <QRCodeSVG 
                value={code} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Or share this 6-digit PIN directly:</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="text-4xl font-mono font-bold tracking-widest text-primary">
                  {code}
                </div>
                <Button size="icon" variant="ghost" onClick={copyToClipboard} className="ml-2">
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
