import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { ExternalLink, Beaker } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function LabsPage() {
  const labs = await prisma.labPartner.findMany({
    where: { isActive: true }
  })

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Our Trusted Lab Partners</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Book your next diagnostic test through BioBytes e-health tracker and have your reports automatically synchronized to your health dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {labs.map(lab => (
            <Card key={lab.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-950 dark:text-blue-400">
                    <Beaker className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{lab.name}</CardTitle>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Diagnostic Lab</span>
                  </div>
                </div>
                <CardDescription className="line-clamp-3">
                  Leading diagnostic service provider offering comprehensive health packages with BioBytes automated report sync.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <a 
                  href={lab.bookingUrl || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={buttonVariants({ className: "w-full" })}
                >
                  Book Diagnostic Test <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
