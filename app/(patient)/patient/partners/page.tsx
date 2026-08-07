import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Percent, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function PartnersPage() {
  const partners = [
    {
      name: "Dr. Lal PathLabs",
      type: "Diagnostics & Testing",
      discount: "15% off all home collection tests",
      description: "Directly sync your test results into BioBytes e-health tracker. No more manual uploads.",
      link: "https://www.lalpathlabs.com",
      color: "bg-blue-50 border-blue-200 text-blue-700",
      btnColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      name: "Tata 1mg",
      type: "Pharmacy & E-Consults",
      discount: "Up to 20% off prescription medicines",
      description: "Order medicines based on your BioBytes e-health tracker health alerts and doctor prescriptions.",
      link: "https://www.1mg.com",
      color: "bg-orange-50 border-orange-200 text-orange-700",
      btnColor: "bg-orange-600 hover:bg-orange-700"
    },
    {
      name: "SRL Diagnostics",
      type: "Diagnostics & Testing",
      discount: "12% off full body checkups",
      description: "Verified API integration to pull your historical lab data instantly.",
      link: "https://www.srlworld.com",
      color: "bg-teal-50 border-teal-200 text-teal-700",
      btnColor: "bg-teal-600 hover:bg-teal-700"
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partner Network</h1>
        <p className="text-muted-foreground">Exclusive discounts and seamless integrations with top healthcare providers.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${partner.color}`}>
                  {partner.type}
                </span>
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <CardTitle className="text-xl">{partner.name}</CardTitle>
              <CardDescription className="text-sm font-medium flex items-center text-emerald-600 mt-2">
                <Percent className="h-4 w-4 mr-1" /> {partner.discount}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground text-sm leading-relaxed">{partner.description}</p>
            </CardContent>
            <CardFooter>
              <Link href={partner.link} target="_blank" rel="noopener noreferrer" className={`w-full inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 ${partner.btnColor} text-white`}>
                Book Service <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
