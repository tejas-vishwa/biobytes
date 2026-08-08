"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function DeleteReportButton({ reportId, onDeleted }: { reportId: string; onDeleted?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        if (onDeleted) {
          onDeleted()
        }
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete report")
      }
    } catch (e) {
      console.error(e)
      alert("Error deleting report")
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/40 p-1 rounded-md border border-red-200 dark:border-red-800">
        <span className="text-[11px] font-semibold text-red-700 dark:text-red-300 px-1">Delete permanently?</span>
        <Button
          size="sm"
          variant="destructive"
          className="h-6 px-2 text-[11px] font-bold"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[11px]"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
      onClick={() => setConfirming(true)}
      title="Permanently delete report"
    >
      <Trash2 className="h-3.5 w-3.5 mr-1" />
      Delete
    </Button>
  )
}
