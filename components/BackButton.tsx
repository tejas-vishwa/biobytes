"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "./ui/button"

export function BackButton() {
  const router = useRouter()

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => router.back()}
      className="md:hidden flex items-center mb-4 text-muted-foreground hover:text-foreground -ml-2"
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      Back
    </Button>
  )
}
