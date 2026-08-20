import React from "react"

export type PatientDemographics = {
  name: string
  uhiId: string
  age: number
  gender: string
}

export type DocumentedCondition = {
  condition: string
  diagnosedYear: number
  status: "Active" | "Managed" | "Resolved"
}

export type HistoricalBaseline = {
  date: string
  value: number
}

export type CurrentFlag = {
  biomarker: string
  currentValue: number
  unit: string
  referenceRange: string
  status: "High" | "Low" | "Critical High" | "Critical Low" | "Optimal"
  historicalBaselines: HistoricalBaseline[]
}

export type BespokeReportData = {
  patientDemographics: PatientDemographics
  documentedConditions: DocumentedCondition[]
  currentFlags: CurrentFlag[] // All biomarkers tracked today, both optimal and flagged
}

const styles = `
:root {
  --primary-dark: #0f172a;
  --bg-light: #f8fafc;
  --surface: #ffffff;
  --text-main: #334155;
  --text-muted: #64748b;
  
  /* Triage Colors */
  --critical-bg: #fef2f2;
  --critical-border: #dc2626;
  --critical-text: #991b1b;
  
  --wellness-bg: #f0fdf4;
  --wellness-border: #16a34a;
  --wellness-text: #166534;

  --warning: #F59E0B;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', 'Plus Jakarta Sans', sans-serif; background-color: white; color: var(--text-main); -webkit-font-smoothing: antialiased; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
@page { size: A4; margin: 0mm; }
.a4-page { width: 100%; min-height: 297mm; background: var(--bg-light); position: relative; display: flex; flex-direction: column; page-break-after: always; }
.no-break { page-break-inside: avoid; }

/* HEADER */
.header { padding: 12mm 15mm 8mm; display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #e2e8f0; background: var(--surface); }
.brand { display: flex; flex-direction: column; }
.brand-title { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: var(--primary-dark); }
.brand-subtitle { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-top: 4px; }
.demographics { text-align: right; }
.patient-name { font-size: 20px; font-weight: 800; color: var(--primary-dark); }
.patient-meta { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

.content { padding: 12mm 15mm; flex: 1; }

/* LAYOUT SHIFTING ENGINES */
.triage-block { padding: 20px; border-radius: 12px; border-left: 6px solid; margin-bottom: 10mm; }
.triage-block.critical { background: var(--critical-bg); border-color: var(--critical-border); }
.triage-block.wellness { background: var(--wellness-bg); border-color: var(--wellness-border); }

.triage-title { font-size: 18px; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.critical .triage-title { color: var(--critical-text); }
.wellness .triage-title { color: var(--wellness-text); }

.triage-summary { font-size: 14px; line-height: 1.6; }
.critical .triage-summary { color: #7f1d1d; }
.wellness .triage-summary { color: #14532d; }

/* PROCEDURAL SECTIONS */
.section-title { font-size: 16px; font-weight: 800; color: var(--primary-dark); border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; margin-top: 5mm; }

.conditions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 10mm; }
.condition-card { background: var(--surface); border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
.cond-name { font-size: 13px; font-weight: 700; color: var(--primary-dark); }
.cond-meta { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
.cond-status { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-top: 6px; }
.cond-status.Active { background: #fee2e2; color: #dc2626; }
.cond-status.Managed { background: #fef9c3; color: #ca8a04; }
.cond-status.Resolved { background: #d1fae5; color: #16a34a; }

/* BIOMARKER LIST */
.biomarker-list { display: flex; flex-direction: column; gap: 10px; }
.biomarker-row { display: flex; align-items: center; background: var(--surface); border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; page-break-inside: avoid; }
.bm-info { width: 180px; flex-shrink: 0; }
.bm-name { font-size: 14px; font-weight: 800; color: var(--primary-dark); }
.bm-ref { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

.bm-value-box { width: 120px; text-align: right; padding-right: 20px; }
.bm-val { font-size: 20px; font-weight: 900; }
.bm-unit { font-size: 11px; color: var(--text-muted); font-weight: 600; margin-left: 4px; }
.val-High, .val-Critical { color: var(--critical-border); }
.val-Low { color: var(--warning); }
.val-Optimal { color: var(--wellness-border); }

/* SPARKLINE */
.sparkline-container { flex: 1; height: 40px; display: flex; align-items: flex-end; position: relative; padding-bottom: 5px; }
.sparkline-label { position: absolute; font-size: 9px; color: #94a3b8; bottom: -10px; }
.sparkline-label.start { left: 0; }
.sparkline-label.end { right: 0; }
.sparkline-line { stroke: var(--primary-dark); stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.sparkline-point { fill: var(--primary-dark); }
.sparkline-point.alert { fill: var(--critical-border); r: 3; }
.sparkline-grid { stroke: #f1f5f9; stroke-width: 1; stroke-dasharray: 2 2; }

/* FOOTER */
.footer { background: var(--primary-dark); color: white; padding: 6mm 15mm; font-size: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
`

const SparklineGraph = ({ baselines, status }: { baselines: HistoricalBaseline[], status: string }) => {
  if (baselines.length < 2) {
    return <div className="text-xs text-muted-foreground italic">Insufficient historical data for trend analysis.</div>
  }

  // Calculate scales
  const values = baselines.map(b => b.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min === 0 ? 1 : max - min
  
  const width = 200
  const height = 30
  
  const points = baselines.map((b, i) => {
    const x = (i / (baselines.length - 1)) * width
    const y = height - ((b.value - min) / range) * height
    return { x, y, value: b.value, date: b.date }
  })

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(" ")
  const isAlert = status.includes("Critical") || status.includes("High") || status.includes("Low")
  const lineColor = isAlert ? "#dc2626" : "#0f172a"

  return (
    <div className="sparkline-container">
      <svg width="100%" height="40" viewBox={`-5 -5 ${width + 10} ${height + 10}`} preserveAspectRatio="none">
        {/* Baseline Grid */}
        <line x1="0" y1={height} x2={width} y2={height} className="sparkline-grid" />
        <line x1="0" y1="0" x2={width} y2="0" className="sparkline-grid" />
        
        {/* Trend Line */}
        <polyline points={polylineStr} style={{ stroke: lineColor, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }} />
        
        {/* Data Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 && isAlert ? 3 : 2} style={{ fill: lineColor }} />
        ))}
      </svg>
      <div className="sparkline-label start">{points[0].date}</div>
      <div className="sparkline-label end">Today</div>
    </div>
  )
}

const ProceduralExecutiveSummary = ({ data }: { data: BespokeReportData }) => {
  const criticalFlags = data.currentFlags.filter(f => f.status.includes("Critical"))
  const warningFlags = data.currentFlags.filter(f => f.status === "High" || f.status === "Low")
  
  // Algorithmic Layout Shifting
  const isWellness = criticalFlags.length === 0 && warningFlags.length === 0
  const isCritical = criticalFlags.length > 0

  if (isCritical) {
    // Generate bespoke string for critical triage
    let summary = `URGENT REVIEW REQUIRED: We have detected ${criticalFlags.length} critical biomarker anomaly(s) in today's reading. `
    
    // Correlate with Documented Conditions
    const diabeticHistory = data.documentedConditions.find(c => c.condition.toLowerCase().includes("diabet"))
    const hba1cFlag = criticalFlags.find(f => f.biomarker.toLowerCase().includes("hba1c") || f.biomarker.toLowerCase().includes("glucose"))
    
    if (diabeticHistory && hba1cFlag) {
      summary += `Your ${hba1cFlag.biomarker} is dangerously elevated at ${hba1cFlag.currentValue}${hba1cFlag.unit}. Given your history of ${diabeticHistory.condition} (Diagnosed ${diabeticHistory.diagnosedYear}), this poses a severe immediate risk of hyperglycemia complications. `
    }

    const cardioHistory = data.documentedConditions.find(c => c.condition.toLowerCase().includes("hyperten") || c.condition.toLowerCase().includes("heart"))
    const bpFlag = criticalFlags.find(f => f.biomarker.toLowerCase().includes("blood pressure") || f.biomarker.toLowerCase().includes("systolic"))

    if (cardioHistory && bpFlag) {
      summary += `Your ${bpFlag.biomarker} reading of ${bpFlag.currentValue} is critically alarming due to your pre-existing ${cardioHistory.condition}. `
    }

    summary += `Please seek immediate medical consultation with your primary care provider.`

    return (
      <div className="triage-block critical">
        <div className="triage-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          CRITICAL CLINICAL ALERT
        </div>
        <div className="triage-summary">{summary}</div>
      </div>
    )
  }

  if (isWellness) {
    let summary = `EXCELLENT HEALTH MAINTAINED: All ${data.currentFlags.length} tracked biomarkers are perfectly within the optimal clinical reference ranges. `
    
    if (data.documentedConditions.length > 0) {
      const activeConditions = data.documentedConditions.filter(c => c.status === "Active" || c.status === "Managed")
      if (activeConditions.length > 0) {
        summary += `You are successfully managing your ${activeConditions.map(c => c.condition).join(" and ")} with no adverse physiological impacts detected today. `
      }
    }

    summary += `Continue your current wellness, diet, and physiological maintenance protocols.`

    return (
      <div className="triage-block wellness">
        <div className="triage-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
          OPTIMAL WELLNESS
        </div>
        <div className="triage-summary">{summary}</div>
      </div>
    )
  }

  // Standard Warning Status
  return (
    <div className="triage-block" style={{ background: "#fffbeb", borderColor: "#f59e0b" }}>
      <div className="triage-title" style={{ color: "#b45309" }}>
        ELEVATED ATTENTION REQUIRED
      </div>
      <div className="triage-summary" style={{ color: "#78350f" }}>
        We have detected {warningFlags.length} biomarkers trending out of optimal physiological ranges. Minor adjustments to protocol or clinical review is advised to prevent long-term chronicity.
      </div>
    </div>
  )
}

export function BespokeHealthReportTemplate({ data }: { data: BespokeReportData }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>Bespoke Health Report - {data.patientDemographics.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <div className="a4-page">
          
          {/* HEADER */}
          <div className="header no-break">
            <div className="brand">
              <div className="brand-title">QURIX BESPOKE</div>
              <div className="brand-subtitle">Algorithmic Health Intelligence</div>
            </div>
            <div className="demographics">
              <div className="patient-name">{data.patientDemographics.name}</div>
              <div className="patient-meta">ID: {data.patientDemographics.uhiId} | {data.patientDemographics.age} Yrs | {data.patientDemographics.gender} | {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div className="content">
            {/* ALGORITHMIC LAYOUT SHIFT: Procedural Executive Summary */}
            <ProceduralExecutiveSummary data={data} />

            {/* MODULAR RENDERING: Condition Summary */}
            {data.documentedConditions.length > 0 && (
              <div className="no-break">
                <div className="section-title">Documented Medical History</div>
                <div className="conditions-grid">
                  {data.documentedConditions.map((cond, i) => (
                    <div key={i} className="condition-card">
                      <div className="cond-name">{cond.condition}</div>
                      <div className="cond-meta">Diagnosed: {cond.diagnosedYear}</div>
                      <div className={`cond-status ${cond.status}`}>{cond.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HISTORICAL CONTEXT ENGINE: Biomarkers & Sparklines */}
            <div className="section-title">Longitudinal Biomarker Analysis</div>
            <div className="biomarker-list">
              {data.currentFlags.map((flag, idx) => {
                const valClass = flag.status.includes("High") ? "val-High" : flag.status.includes("Low") ? "val-Low" : "val-Optimal"
                return (
                  <div key={idx} className="biomarker-row">
                    <div className="bm-info">
                      <div className="bm-name">{flag.biomarker}</div>
                      <div className="bm-ref">Range: {flag.referenceRange} {flag.unit}</div>
                    </div>
                    <div className="bm-value-box">
                      <div className={`bm-val ${valClass}`}>{flag.currentValue}<span className="bm-unit">{flag.unit}</span></div>
                    </div>
                    
                    {/* Sparkline Component */}
                    <div className="flex-1 pl-4">
                      <SparklineGraph baselines={flag.historicalBaselines} status={flag.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* FOOTER */}
          <div className="footer no-break">
            <div>CONFIDENTIAL BESPOKE REPORT</div>
            <div>Generated by QURIX Algorithmic Intelligence</div>
          </div>
        </div>
      </body>
    </html>
  )
}
