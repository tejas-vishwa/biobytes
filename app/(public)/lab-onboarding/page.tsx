"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, UploadCloud, Building2, User, KeyRound, ArrowRight } from "lucide-react"

export default function LabOnboardingPage() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    yearEstablished: "",
    contactPerson: "",
    registrationNo: "",
    email: "",
    password: "",
  })

  // State for checkboxes
  const [scopes, setScopes] = useState({
    pathology: false,
    radiology: false,
    microbiology: false,
    cardiology: false
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleScopeChange = (id: keyof typeof scopes) => {
    setScopes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Build operational scope string from checkboxes
    const selectedScopes = Object.entries(scopes)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key)
      .join(", ")

    // We will use FormData to handle both fields and file
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value)
    })
    data.append("operationalScope", selectedScopes)
    if (selectedFile) {
      data.append("certificationFile", selectedFile)
    }

    try {
      const res = await fetch("/api/labs/register", {
        method: "POST",
        body: data,
      })

      if (res.ok) {
        setSubmitted(true)
        toast({
          title: "Application Submitted!",
          description: "Your registration is pending review by our team.",
        })
      } else {
        const err = await res.json()
        throw new Error(err.error || "Registration failed")
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center min-h-[70vh] bg-slate-50 dark:bg-slate-900/50">
          <Card className="max-w-md w-full text-center py-8">
            <CardHeader>
              <div className="mx-auto h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Application Received</CardTitle>
              <CardDescription className="text-base mt-2">
                Thank you for applying to join the QURIX Lab Partner Network. Our team will review your credentials and be in touch within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pt-6">
              <Button onClick={() => window.location.href = "/"} className="w-full">
                Return Home
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight">Lab Partner Registration</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Complete the form below to begin your onboarding process. All fields are required to ensure the authenticity of our diagnostic network.
            </p>
          </div>

          <Card className="shadow-lg border-t-4 border-t-blue-600">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-8 pt-8">
                
                {/* 1. Business Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center text-blue-700 dark:text-blue-400">
                    <Building2 className="mr-2 h-5 w-5" /> Business Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Lab Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Apex Diagnostics" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearEstablished">Year Established</Label>
                      <Input id="yearEstablished" name="yearEstablished" type="number" min="1800" max={new Date().getFullYear()} value={formData.yearEstablished} onChange={handleChange} required placeholder="e.g. 2010" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="contactPerson">Primary Contact Person</Label>
                      <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required placeholder="Full Name" />
                    </div>
                  </div>
                </div>

                <hr className="border-border/50" />

                {/* 2. Credentials */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center text-blue-700 dark:text-blue-400">
                    <UploadCloud className="mr-2 h-5 w-5" /> Credentials & Verification
                  </h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNo">Registration Number (NABL / ISO / State Govt)</Label>
                      <Input id="registrationNo" name="registrationNo" value={formData.registrationNo} onChange={handleChange} required placeholder="Enter Registration/License ID" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certificationFile">Upload Certification Document (PDF/JPG)</Label>
                      <Input 
                        id="certificationFile" 
                        type="file" 
                        accept=".pdf,image/*" 
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">Optional, but speeds up the verification process.</p>
                    </div>
                  </div>
                </div>

                <hr className="border-border/50" />

                {/* 3. Operational Scope */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center text-blue-700 dark:text-blue-400">
                    <Activity className="mr-2 h-5 w-5" /> Operational Scope
                  </h3>
                  <p className="text-sm text-muted-foreground">Select the primary diagnostic services your facility provides:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {Object.entries(scopes).map(([key, isChecked]) => (
                      <div className="flex items-center space-x-2" key={key}>
                        <Checkbox 
                          id={`scope-${key}`} 
                          checked={isChecked} 
                          onCheckedChange={() => handleScopeChange(key as keyof typeof scopes)}
                        />
                        <Label htmlFor={`scope-${key}`} className="capitalize cursor-pointer">{key}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="border-border/50" />

                {/* 4. Account Setup */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center text-blue-700 dark:text-blue-400">
                    <KeyRound className="mr-2 h-5 w-5" /> Account Setup
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="lab@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Secure Password</Label>
                      <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
                    </div>
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-muted/30 p-6 border-t flex justify-end">
                <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Submit Application <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
