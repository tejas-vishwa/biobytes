import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BackButton } from "@/components/BackButton"
import { PatientNavbar } from "@/components/PatientNavbar"

export const dynamic = "force-dynamic"

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "PATIENT") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <PatientNavbar userName={session.user.name} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <BackButton />
        {children}
      </main>
    </div>
  )
}
