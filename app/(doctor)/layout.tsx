import { BackButton } from "@/components/BackButton"
import { DoctorNavbar } from "@/components/DoctorNavbar"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <DoctorNavbar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <BackButton />
        {children}
      </main>
    </div>
  )
}
