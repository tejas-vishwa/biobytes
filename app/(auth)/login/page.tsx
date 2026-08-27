"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { BackButton } from "@/components/BackButton"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Stethoscope, ShieldCheck, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { QurixLogo } from "@/components/QurixLogo"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DemoAccount {
  name: string
  email: string
  role: string
  roleUrl: string
  color?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"login" | "magic-link" | "demo">("login")

  // Magic link states
  const [magicEmail, setMagicEmail] = useState("")
  const [magicSent, setMagicSent] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [magicError, setMagicError] = useState("")

  // Demo password protection states
  const [selectedDemoUser, setSelectedDemoUser] = useState<DemoAccount | null>(null)
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false)
  const [demoPassword, setDemoPassword] = useState("")
  const [demoError, setDemoError] = useState("")
  const [showDemoPassword, setShowDemoPassword] = useState(false)
  const [verifyingDemo, setVerifyingDemo] = useState(false)

  const onMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!magicEmail.trim()) return

    setMagicLoading(true)
    setMagicError("")

    try {
      const res = await signIn("email", {
        email: magicEmail.trim().toLowerCase(),
        redirect: false,
        callbackUrl: "/patient/dashboard",
      })

      if (res?.error) {
        setMagicError("Failed to dispatch magic link. Please verify your email and try again.")
      } else {
        setMagicSent(true)
      }
    } catch (err) {
      setMagicError("An unexpected error occurred. Please try again.")
    } finally {
      setMagicLoading(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      if (res.error === "CredentialsSignin") {
        setError("Invalid email or password")
      } else {
        setError(res.error)
      }
      setLoading(false)
    } else {
      const session = await getSession()
      if (session?.user?.role === "ADMIN") {
        router.push("/admin")
      } else if (session?.user?.role === "DOCTOR") {
        router.push("/doctor/dashboard")
      } else {
        router.push("/patient/dashboard")
      }
      router.refresh()
    }
  }

  const openDemoModal = (account: DemoAccount) => {
    setSelectedDemoUser(account)
    setDemoPassword("")
    setDemoError("")
    setShowDemoPassword(false)
    setIsDemoDialogOpen(true)
  }

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDemoUser) return

    if (!demoPassword.trim()) {
      setDemoError("Please enter the password.")
      return
    }

    setVerifyingDemo(true)
    setDemoError("")

    let res = await signIn("credentials", {
      email: selectedDemoUser.email,
      password: demoPassword,
      redirect: false,
    })

    // If first attempt fails (e.g. DB not seeded yet), trigger setup-db API and retry automatically
    if (res?.error) {
      try {
        await fetch("/api/setup-db")
        res = await signIn("credentials", {
          email: selectedDemoUser.email,
          password: demoPassword,
          redirect: false,
        })
      } catch (e) {
        console.error("Auto-seed retry error:", e)
      }
    }

    if (res?.error) {
      setDemoError("Incorrect password. Please enter the valid account password.")
      setVerifyingDemo(false)
    } else {
      setIsDemoDialogOpen(false)
      router.push(selectedDemoUser.roleUrl)
      router.refresh()
    }
  }

  const patients: DemoAccount[] = [
    { name: "Priya Sharma", email: "priya@demo.com", role: "Patient", roleUrl: "/patient/dashboard", color: "rose" },
    { name: "Sankalp Verma", email: "sankalp@demo.com", role: "Patient", roleUrl: "/patient/dashboard", color: "blue" },
    { name: "Utkarsh Singh", email: "utkarsh@demo.com", role: "Patient", roleUrl: "/patient/dashboard", color: "indigo" },
    { name: "Tejas Vishwakarma", email: "tejas@demo.com", role: "Patient", roleUrl: "/patient/dashboard", color: "cyan" },
  ]

  const colorMap: Record<string, string> = {
    rose: "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
    blue: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    indigo: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
    cyan: "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md absolute top-4 left-4">
        <BackButton />
      </div>
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center mb-4">
          <Link href="/" className="flex items-center group transition-transform hover:scale-105">
            <QurixLogo className="h-10 w-auto" />
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Sign in to QURIX
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your portal
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {/* Tab Selector */}
              <div className="flex bg-muted p-1 rounded-lg w-full mb-6">
                <button 
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 text-xs sm:text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Password
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab("magic-link")}
                  className={`flex-1 text-xs sm:text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === "magic-link" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Magic Link
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab("demo")}
                  className={`flex-1 text-xs sm:text-sm font-medium py-1.5 rounded-md transition-all ${activeTab === "demo" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Demo Users
                </button>
              </div>

              {activeTab === "login" ? (
                <>
                  {error && <div className="text-sm text-destructive font-medium text-center rounded-md bg-destructive/10 p-3">{error}</div>}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : activeTab === "magic-link" ? (
                <div className="space-y-4">
                  {magicSent ? (
                    <div className="text-center py-4 space-y-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                        ✓
                      </div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">Check your inbox</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        We sent a magic sign-in link to <strong>{magicEmail}</strong>. Click the link in your email to log in instantly.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMagicSent(false)
                          setMagicEmail("")
                        }}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline"
                      >
                        Try another email
                      </button>
                    </div>
                  ) : (
                    <>
                      {magicError && <div className="text-sm text-destructive font-medium text-center rounded-md bg-destructive/10 p-3">{magicError}</div>}
                      <p className="text-xs text-muted-foreground">
                        Enter your email address and we&apos;ll send you a passwordless sign-in link via MailerSend.
                      </p>
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="magic-email">Email</label>
                        <Input
                          id="magic-email"
                          type="email"
                          placeholder="you@domain.com"
                          value={magicEmail}
                          onChange={(e) => setMagicEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={onMagicLinkSubmit}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={magicLoading || !magicEmail.trim()}
                      >
                        {magicLoading ? "Sending Magic Link..." : "Send Magic Link"}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Patient Demo Accounts */}
                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Patients
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground/80">
                        <Lock className="h-3 w-3" /> Password Protected
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {patients.map((p) => (
                        <Button
                          key={p.email}
                          type="button"
                          variant="outline"
                          className={`text-xs py-2 h-auto flex items-center justify-between px-3 ${p.color ? colorMap[p.color] : ""}`}
                          onClick={() => openDemoModal(p)}
                          disabled={loading || verifyingDemo}
                        >
                          <span className="truncate">{p.name}</span>
                          <Lock className="h-3 w-3 opacity-60 ml-1 shrink-0" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Demo Account */}
                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5" /> Doctor
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground/80">
                        <Lock className="h-3 w-3" /> Password Protected
                      </span>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center justify-between px-3"
                      onClick={() => openDemoModal({
                        name: "Dr. Rahul Verma",
                        email: "doctor@demo.com",
                        role: "Doctor",
                        roleUrl: "/doctor/dashboard"
                      })}
                      disabled={loading || verifyingDemo}
                    >
                      <span>Dr. Rahul Verma</span>
                      <Lock className="h-3 w-3 opacity-60 shrink-0" />
                    </Button>
                  </div>

                  {/* Admin Demo Account */}
                  <div className="w-full space-y-2">
                    <p className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" /> Admin
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground/80">
                        <Lock className="h-3 w-3" /> Password Protected
                      </span>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 flex items-center justify-between px-3"
                      onClick={() => openDemoModal({
                        name: "Super Admin",
                        email: "admin@teamqurix.com",
                        role: "Administrator",
                        roleUrl: "/admin"
                      })}
                      disabled={loading || verifyingDemo}
                    >
                      <span>Super Admin</span>
                      <Lock className="h-3 w-3 opacity-60 shrink-0" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            
            {activeTab === "login" && (
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </CardFooter>
            )}
          </form>
        </Card>

        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </div>

      {/* Password Protection Dialog for Demo Accounts */}
      <Dialog open={isDemoDialogOpen} onOpenChange={setIsDemoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedDemoUser && (
            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <DialogHeader className="text-left space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Lock className="h-4 w-4" />
                  </div>
                  <DialogTitle>Demo Account Verification</DialogTitle>
                </div>
                <DialogDescription>
                  Enter the password to sign in as <strong className="text-foreground">{selectedDemoUser.name}</strong> ({selectedDemoUser.email}).
                </DialogDescription>
              </DialogHeader>

              {demoError && (
                <div className="text-xs text-destructive font-medium rounded-md bg-destructive/10 p-2.5">
                  {demoError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="demo-password">
                  Account Password
                </label>
                <div className="relative">
                  <Input
                    id="demo-password"
                    type={showDemoPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={demoPassword}
                    onChange={(e) => {
                      setDemoPassword(e.target.value)
                      if (demoError) setDemoError("")
                    }}
                    autoFocus
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDemoPassword(!showDemoPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showDemoPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDemoDialogOpen(false)}
                  disabled={verifyingDemo}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={verifyingDemo}
                  className="min-w-[120px]"
                >
                  {verifyingDemo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Unlock & Sign in"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

