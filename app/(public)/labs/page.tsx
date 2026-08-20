import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Beaker, LineChart, Sparkles, TrendingUp, CheckCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function LabsB2BPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-blue-500/10 via-background to-background">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-50 dark:bg-blue-950/50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
              <span>QURIX Lab Partner Network</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter sm:text-5xl">
                Grow Your Diagnostic Business <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
                  with QURIX.
                </span>
              </h1>
              <p className="mx-auto max-w-[750px] text-muted-foreground md:text-xl">
                Join our premium network of diagnostic partners. Automate report syncing, reach thousands of active patients, and modernize your lab's digital presence instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
              <Link href="/lab-onboarding">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700">
                  Register Your Lab
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="w-full py-20 bg-slate-50 dark:bg-slate-900/50 border-y">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Why Partner with Us?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                QURIX connects your diagnostic facility directly with a massive patient base, streamlining your operations while driving unprecedented growth.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-t-4 border-t-emerald-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Increase Daily Walk-ins</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Get listed directly on the QURIX Patient App. Our AI continuously recommends relevant diagnostic tests based on a patient's health trends, driving highly targeted walk-ins directly to your facility.
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                    <Activity className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Automate Report Syncing</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  Eliminate manual report deliveries. QURIX integrations allow your LIS (Laboratory Information System) to push reports directly to a patient's digital vault for instant AI extraction.
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-purple-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                    <LineChart className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Zero Setup Fees</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground leading-relaxed">
                  There are absolutely no upfront costs or rigid contracts. QURIX operates on a transparent, purely performance-based commission model. If we don't bring you business, you don't pay.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works Summary */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-10">The Onboarding Process</h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Submit Registration", desc: "Fill out the lab onboarding form with your business details and credentials." },
                { step: "2", title: "Verification", desc: "Our team reviews your submitted certifications (NABL/ISO) within 24 hours." },
                { step: "3", title: "Account Activation", desc: "You receive your secure credentials via email and go live on the QURIX network." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{item.title}</h3>
                    <p className="text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/lab-onboarding">
                <Button size="lg" className="h-12 px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                  Begin Onboarding <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
