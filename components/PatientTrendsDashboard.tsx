"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Search, FileX } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts'
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import Link from "next/link"

export function PatientTrendsDashboard({ accessCode }: { accessCode?: string }) {
  const [trends, setTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [months, setMonths] = useState(6)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchTrends() {
      setLoading(true)
      const url = accessCode 
        ? `/api/metrics/trends?months=${months}&accessCode=${accessCode}`
        : `/api/metrics/trends?months=${months}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTrends(data)
      }
      setLoading(false)
    }
    fetchTrends()
  }, [months, accessCode])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // Deduplicate categories for the selector
  const categories = ["All", ...Array.from(new Set(trends.map(t => t.category)))]

  // Filter trends based on category, search query, and presence of data
  const filteredTrends = trends.filter(t => {
    if (t.history.length === 0) return false;
    
    const matchesCategory = activeCategory === "All" || t.category === activeCategory
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const downloadSingleGraph = async (code: string, name: string) => {
    const cardEl = document.getElementById(`card-${code}`)
    if (!cardEl) return
    try {
      const canvas = await html2canvas(cardEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      })
      const imgData = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `BioBytes_${name.replace(/[^a-zA-Z0-9]/g, '_')}_Trend.png`
      link.href = imgData
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      console.error("Graph download failed:", err)
      alert(`Failed to download graph: ${err?.message || "Error capturing chart"}`)
    }
  }

  const generatePDF = async () => {
    setGeneratingPdf(true)
    try {
      const populatedTrends = trends.filter(t => t.history && t.history.length > 0)
      
      let aiSummary = "Based on your recent lab reports, here is an automated clinical summary of your health trends."
      try {
        const res = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metrics: populatedTrends })
        })
        if (res.ok) {
          const data = await res.json()
          if (data && data.summary) aiSummary = data.summary
        }
      } catch (e) {
        console.warn("Summary fetch note:", e)
      }

      const doc = new jsPDF('p', 'mm', 'a4')
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      // Header Banner
      doc.setFillColor(13, 148, 136)
      doc.rect(0, 0, pageWidth, 24, 'F')
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text("BioBytes e-Health Tracker", 14, 15)
      
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, 15, { align: "right" })

      // AI Clinical Summary Box
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(15, 23, 42)
      doc.text("AI Doctor Health Summary", 14, 32)

      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      
      const splitSummary = doc.splitTextToSize(aiSummary, pageWidth - 36)
      const summaryBoxHeight = Math.max(16, (splitSummary.length * 4.5) + 6)
      
      doc.rect(14, 36, pageWidth - 28, summaryBoxHeight, 'FD')
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(51, 65, 85)
      doc.text(splitSummary, 18, 42)

      let currentY = 36 + summaryBoxHeight + 10

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(15, 23, 42)
      doc.text("Tracked Biomarker Trends", 14, currentY)
      currentY += 6

      // Capture individual chart cards cleanly with per-card fallback
      for (let i = 0; i < filteredTrends.length; i++) {
        const trend = filteredTrends[i]
        const cardEl = document.getElementById(`card-${trend.code}`)
        if (!cardEl) continue

        try {
          const canvas = await html2canvas(cardEl, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
          })
          const imgData = canvas.toDataURL('image/png')
          
          const cardWidth = (pageWidth - 36) / 2
          const cardHeight = 65

          const isSecondColumn = i % 2 === 1
          const xPos = isSecondColumn ? 14 + cardWidth + 8 : 14
          
          if (!isSecondColumn && i > 0) {
            currentY += cardHeight + 6
          }

          if (currentY + cardHeight > pageHeight - 18) {
            doc.addPage()
            currentY = 18
          }

          doc.addImage(imgData, 'PNG', xPos, currentY, cardWidth, cardHeight)
        } catch (cardErr) {
          console.warn(`Could not capture card ${trend.code}:`, cardErr)
        }
      }

      // Footer with page numbering
      const totalPages = doc.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p)
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          "BioBytes e-Health Report • Confidential • Does not replace professional medical advice.", 
          14, pageHeight - 8
        )
        doc.text(`Page ${p} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: "right" })
      }

      doc.save(`BioBytes_Health_Trends_Report_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err: any) {
      console.error("PDF generation failed:", err)
      alert(`PDF Generation Note: ${err?.message || "Failed to generate PDF. Please try again."}`)
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Trends</h1>
          <p className="text-muted-foreground">Visualize your biomarker changes over time.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={months} 
            onChange={(e) => setMonths(Number(e.target.value))}
            className="flex h-10 w-[180px] rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-sm"
            disabled={generatingPdf}
          >
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
          </select>
          
          <Button 
            onClick={generatePDF} 
            disabled={loading || generatingPdf || trends.filter(t => t.history.length > 0).length === 0}
            className="flex items-center gap-2 shadow-sm"
          >
            <Download className="h-4 w-4" />
            {generatingPdf ? "Generating..." : "Download Report"}
          </Button>
        </div>
      </div>

      {/* Interactive Search Bar & Glassmorphism Category Selector */}
      <div className="flex flex-col space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search all 100 tests (e.g., Hemoglobin, SGPT, Calcium)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-background/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm backdrop-blur-md border ${
                activeCategory === cat 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background/60 text-muted-foreground hover:bg-muted/80 border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading your health data...</p>
        </div>
      ) : filteredTrends.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-background/50 backdrop-blur-sm">
          No tests found matching your search.
        </div>
      ) : (
        <div id="charts-container" className="grid gap-6 p-2 md:grid-cols-2">
          {filteredTrends.map((trend) => (
            <Card id={`card-${trend.code}`} key={trend.code} className="overflow-hidden bg-background/60 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-primary">{trend.name}</CardTitle>
                    <CardDescription className="font-medium mt-1">
                      {trend.category}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend.refMin !== null && trend.refMax !== null && (
                      <div className="text-right">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Reference Range</span>
                        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          {trend.refMin} - {trend.refMax} {trend.unit}
                        </span>
                      </div>
                    )}
                    {trend.history.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => downloadSingleGraph(trend.code, trend.name)}
                        title={`Download ${trend.name} Graph`}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {trend.history.length > 0 ? (
                  <div className="h-[280px] w-full p-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trend.history}
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="id" 
                          tickFormatter={(id) => {
                            const point = trend.history.find((d: any) => d.id === id)
                            return point ? formatDate(point.date) : ''
                          }}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          domain={[
                            (dataMin: number) => {
                              const minVal = isNaN(dataMin) || dataMin === Infinity || dataMin === -Infinity ? 0 : dataMin;
                              let minBound = minVal;
                              if (trend.refMin !== null && trend.refMin !== undefined) {
                                minBound = Math.min(minVal, trend.refMin);
                              }
                              if (minBound >= 0 && minBound <= 30) {
                                return 0;
                              }
                              return Math.max(0, Math.floor(minBound * 0.85));
                            },
                            (dataMax: number) => {
                              const maxVal = isNaN(dataMax) || dataMax === Infinity || dataMax === -Infinity ? 10 : dataMax;
                              let maxBound = maxVal;
                              if (trend.refMax !== null && trend.refMax !== undefined) {
                                maxBound = Math.max(maxVal, trend.refMax);
                              }
                              return Math.ceil(Math.max(maxBound * 1.15, maxBound + 2));
                            }
                          ]}
                          tickFormatter={(val: number) => {
                            if (isNaN(val)) return ''
                            const num = Number(val)
                            return Number.isInteger(num) ? num.toString() : num.toFixed(1)
                          }}
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          axisLine={false}
                          tickLine={false}
                          width={50}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              const exactDate = new Date(data.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                              return (
                                <div className="bg-background/95 backdrop-blur-md p-3 border border-border/50 rounded-xl shadow-xl text-sm">
                                  <p className="font-bold text-foreground">{exactDate}</p>
                                  <p className="text-muted-foreground text-xs mb-1">{data.labName || "Lab Report"}</p>
                                  <p className="text-primary font-bold text-lg">{`${data.value} ${trend.unit}`}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        {trend.refMin !== null && trend.refMax !== null && (
                          <ReferenceArea 
                            y1={trend.refMin} 
                            y2={trend.refMax} 
                            fill="#10b981" 
                            fillOpacity={0.08} 
                          />
                        )}
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0d9488" 
                          strokeWidth={3}
                          activeDot={{ r: 7, fill: "#0d9488", stroke: "white", strokeWidth: 2 }}
                          dot={{ r: 4, fill: "#0d9488", strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  // BEAUTIFUL EMPTY STATE WITH FADED CHART GRID
                  <div className="empty-state-chart h-[280px] w-full p-4 relative flex items-center justify-center">
                    {/* Faded Background Chart */}
                    <div className="absolute inset-0 p-4 opacity-20 pointer-events-none grayscale">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[{ id: 1, value: trend.refMax || 100 }, { id: 2, value: trend.refMin || 0 }]} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="id" tick={false} axisLine={false} tickLine={false} />
                          <YAxis domain={['auto', 'auto']} tickFormatter={(val: number) => `${Math.round(Number(val))}`} allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={50} />
                          <Line type="monotone" dataKey="value" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Glassmorphism Overlay */}
                    <div className="z-10 flex flex-col items-center justify-center p-6 text-center bg-background/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm max-w-[80%]">
                      <div className="h-12 w-12 rounded-full bg-muted/80 flex items-center justify-center mb-3 shadow-inner">
                        <FileX className="h-6 w-6 text-muted-foreground/70" />
                      </div>
                      <h3 className="font-semibold text-foreground/90 mb-1 text-sm">No historical data</h3>
                      <p className="text-xs text-muted-foreground max-w-[200px] mb-4">
                        Upload your next report to track {trend.name}.
                      </p>
                      <Link href="/patient/upload">
                        <Button variant="outline" size="sm" className="h-8 text-xs rounded-full shadow-sm hover:shadow-md transition-all bg-background/50">
                          Upload Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
