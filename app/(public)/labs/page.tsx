import { PrismaClient } from "@prisma/client"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Beaker } from "lucide-react"
import Link from "next/link"

const prisma = new PrismaClient()

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
            <Card key={lab.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 p-4 rounded-full mb-4">
                  <Beaker className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">{lab.name}</CardTitle>
                <CardDescription>Verified BioBytes e-health tracker Partner</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Get seamless integration of your test results when booking through our platform.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <a href={lab.bookingUrl || "#"} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto" variant="outline">
                    Book Test <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
