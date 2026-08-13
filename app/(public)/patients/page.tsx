import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ActivitySquare, CheckCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default function PatientsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-6">
          <ActivitySquare className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">For Patients</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Take control of your health data. Centralize your lab reports, monitor biomarkers over time, and receive proactive health alerts before issues escalate.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl text-left">
            {[
              "Automated AI data extraction from PDFs",
              "Beautiful 3, 6, 12-month trend charts",
              "Instant sharing with your doctor",
              "Proactive warnings for abnormal values"
            ].map((feature, i) => (
              <div key={i} className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full">Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
