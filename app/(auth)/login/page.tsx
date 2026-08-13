"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { BackButton } from "@/components/BackButton"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Stethoscope, ShieldCheck } from "lucide-react"
import { QurixLogo } from "@/components/QurixLogo"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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
      setError("Invalid email or password")
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

  const demoLogin = async (emailToLogin: string, password: string, roleUrl: string) => {
    setLoading(true)
    setError("")

    let res = await signIn("credentials", {
      email: emailToLogin,
      password,
      redirect: false,
    })

    // If first attempt fails (e.g. DB not seeded yet), trigger setup-db API and retry automatically
    if (res?.error) {
      try {
        await fetch("/api/setup-db")
        res = await signIn("credentials", {
          email: emailToLogin,
          password,
          redirect: false,
        })
      } catch (e) {
        console.error("Auto-seed retry error:", e)
      }
    }

    if (res?.error) {
      console.error("Login attempt error:", res.error)
      if (res.error === "CredentialsSignin") {
        setError("Invalid demo credentials. Please try again.")
      } else {
        setError(`Login error (${res.error}). Please verify environment configuration.`)
      }
      setLoading(false)
    } else {
      router.push(roleUrl)
      router.refresh()
    }
  }

  const patients = [
    { name: "Priya Sharma", email: "priya@demo.com", color: "rose" },
    { name: "Sankalp Verma", email: "sankalp@demo.com", color: "blue" },
    { name: "Utkarsh Singh", email: "utkarsh@demo.com", color: "indigo" },
    { name: "Tejas Vishwakarma", email: "tejas@demo.com", color: "cyan" },
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="relative flex items-center py-1 w-full">
                <div className="flex-grow border-t border-muted"></div>
                <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">Quick Demo Login</span>
                <div className="flex-grow border-t border-muted"></div>
              </div>

              {/* Patient Demo Accounts */}
              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  <User className="h-3 w-3" /> Patients (password: demo1234)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {patients.map((p) => (
                    <Button
                      key={p.email}
                      type="button"
                      variant="outline"
                      className={`text-xs py-2 h-auto ${colorMap[p.color]}`}
                      onClick={() => demoLogin(p.email, "demo1234", "/patient/dashboard")}
                      disabled={loading}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Doctor Demo Account */}
              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" /> Doctor (password: demo1234)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                  onClick={() => demoLogin("doctor@demo.com", "demo1234", "/doctor/dashboard")}
                  disabled={loading}
                >
                  Dr. Rahul Verma
                </Button>
              </div>

              {/* Admin Demo Account */}
              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Admin (password: BB@quirx.in)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                  onClick={() => demoLogin("admin@qurix.health", "BB@quirx.in", "/admin")}
                  disabled={loading}
                >
                  Admin User
                </Button>
              </div>

            </CardFooter>
          </form>
        </Card>

        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
