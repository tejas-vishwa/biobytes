import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Stethoscope, KeyRound, Clock, ShieldCheck } from "lucide-react"

export default function DoctorsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-6">
          <Stethoscope className="h-16 w-16 text-emerald-500" />
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">For Doctors</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Get instant context on your patients&apos; health history without lengthy onboarding. Enter a temporary access code and see 12 months of longitudinal data in seconds.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="space-y-3 p-6 border rounded-lg bg-emerald-50/50">
              <KeyRound className="h-8 w-8 text-emerald-600" />
              <h3 className="text-lg font-bold">No Registration Required</h3>
              <p className="text-muted-foreground">Skip the complex signup process. Enter the access code provided by your patient and get immediate access to their records.</p>
            </div>
            <div className="space-y-3 p-6 border rounded-lg bg-emerald-50/50">
              <Clock className="h-8 w-8 text-emerald-600" />
              <h3 className="text-lg font-bold">Longitudinal View</h3>
              <p className="text-muted-foreground">Stop relying on fragmented paper reports. See beautifully graphed biomarker trends over 3, 6, or 12 months instantly.</p>
            </div>
            <div className="space-y-3 p-6 border rounded-lg bg-emerald-50/50">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <h3 className="text-lg font-bold">Secure & Private</h3>
              <p className="text-muted-foreground">Access codes expire automatically after 24 hours and have strict usage limits to ensure patient data remains private.</p>
            </div>
          </div>

          <div className="mt-12">
            <Link href="/doctor/access">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-emerald-600 hover:bg-emerald-700">Enter Patient Access Code</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
