import React from "react"

export type PatientProfile = {
  name: string
  uhiId: string
  age: number
  gender: string
}

export type MedicalHistory = {
  knownConditions: string[]
  pastSurgeries: string
  familyHistoryAlerts: string[]
}

export type CurrentTrend = {
  biomarker: string
  currentValue: string
  previousValue: string
  trendDirection: "Improving" | "Elevated" | "Stable"
  status: "High" | "Low" | "Optimal" | "Warning" | "Critical"
}

export type QurixPlusReportData = {
  patientProfile: PatientProfile
  medicalHistory: MedicalHistory
  currentTrends: CurrentTrend[]
}

const styles = `
:root { --primary-dark: #0f172a; --primary-teal: #0d9488; --bg-light: #f8fafc; --surface: #ffffff; --text-main: #334155; --text-muted: #64748b; --critical: #E63946; --warning: #F59E0B; --optimal: #00A68A; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: white; color: var(--text-main); -webkit-font-smoothing: antialiased; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
@page { size: A4; margin: 0mm; }
.a4-page { width: 100%; height: 100%; min-height: 297mm; background: var(--bg-light); position: relative; display: flex; flex-direction: column; page-break-after: always; }
.no-break { page-break-inside: avoid; }
.header { background: var(--primary-dark); color: white; padding: 12mm 15mm; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid var(--primary-teal); }
.header-logo { display: flex; align-items: center; gap: 10px; }
.header-logo svg { width: 32px; height: 32px; color: var(--primary-teal); }
.brand-title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
.brand-subtitle { font-size: 10px; color: var(--primary-teal); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
.patient-meta { text-align: right; }
.patient-meta h2 { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
.patient-meta p { font-size: 11px; color: #94a3b8; }
.footer { background: var(--surface); border-top: 1px solid #e2e8f0; padding: 8mm 15mm; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: var(--text-muted); margin-top: auto; }
.content { padding: 15mm; flex: 1; }
.report-title { font-size: 22px; font-weight: 800; color: var(--primary-dark); margin-bottom: 5px; }
.report-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 6mm; max-width: 90%; line-height: 1.5; }
.triage-summary { display: flex; gap: 15px; margin-bottom: 10mm; }
.triage-card { flex: 1; background: var(--surface); border-radius: 8px; padding: 15px; border-left: 4px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.triage-card.critical { border-color: var(--critical); }
.triage-card.warning { border-color: var(--warning); }
.triage-card.optimal { border-color: var(--optimal); }
.triage-value { font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 5px; }
.critical .triage-value { color: var(--critical); }
.warning .triage-value { color: var(--warning); }
.optimal .triage-value { color: var(--optimal); }
.triage-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); }
.system-group { margin-bottom: 8mm; page-break-inside: avoid; }
.system-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
.system-icon { width: 24px; height: 24px; background: var(--primary-dark); color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.system-icon svg { width: 14px; height: 14px; }
.system-title { font-size: 16px; font-weight: 700; color: var(--primary-dark); }
.history-section { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 8mm; }
.history-section h3 { font-size: 14px; font-weight: 700; color: var(--primary-dark); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
.history-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
.history-item-label { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-bottom: 4px; }
.history-item-val { font-size: 12px; color: var(--primary-dark); font-weight: 500; }
.history-tag { display: inline-block; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; margin: 2px 4px 2px 0; font-size: 11px; color: #475569; }
.biomarker-row { display: flex; align-items: center; background: var(--surface); border-radius: 8px; padding: 12px 15px; margin-bottom: 8px; border: 1px solid #f1f5f9; }
.biomarker-info { width: 150px; flex-shrink: 0; }
.bm-name { font-size: 13px; font-weight: 700; color: var(--primary-dark); margin-bottom: 2px; }
.bm-meta { font-size: 10px; color: var(--text-muted); }
.biomarker-value-box { width: 100px; text-align: right; padding-right: 20px; }
.bm-value { font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
.val-critical { color: var(--critical); }
.val-warning { color: var(--warning); }
.val-optimal { color: var(--optimal); }
.trend-arrow { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; font-size: 10px; font-weight: bold; }
.arrow-up { color: var(--critical); background: #fee2e2; }
.arrow-down { color: var(--optimal); background: #d1fae5; }
.arrow-neutral { color: var(--text-muted); background: #f1f5f9; }
.bm-prev { font-size: 9px; color: var(--text-muted); font-weight: 500; margin-top: 2px; }
.gauge-container { flex: 1; position: relative; height: 30px; display: flex; align-items: center; }
.gauge-track { width: 100%; height: 6px; background: linear-gradient(90deg, #FEE2E2 0%, #D1FAE5 20%, #D1FAE5 80%, #FEE2E2 100%); border-radius: 10px; position: relative; }
.gauge-node { position: absolute; top: 50%; width: 12px; height: 12px; border-radius: 50%; background: white; transform: translate(-50%, -50%); box-shadow: 0 0 0 3px currentColor, 0 2px 4px rgba(0,0,0,0.2); }
.node-critical { color: var(--critical); z-index: 10; }
.node-warning { color: var(--warning); z-index: 10; }
.node-optimal { color: var(--optimal); z-index: 10; }
.gauge-labels { position: absolute; top: -14px; width: 100%; display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; font-weight: 600; }
`

export function QurixPlusTemplate({ data }: { data: QurixPlusReportData }) {
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'critical': return 'val-critical'
      case 'high':
      case 'warning': return 'val-warning'
      case 'optimal':
      case 'low': return 'val-optimal'
      default: return 'val-optimal'
    }
  }

  const getNodeColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'critical': return 'node-critical'
      case 'high':
      case 'warning': return 'node-warning'
      case 'optimal':
      case 'low': return 'node-optimal'
      default: return 'node-optimal'
    }
  }

  const getArrow = (direction: string) => {
    if (direction === 'Elevated') return <span className="trend-arrow arrow-up">↑</span>
    if (direction === 'Improving') return <span className="trend-arrow arrow-down">↓</span>
    return <span className="trend-arrow arrow-neutral">-</span>
  }

  // Simple logic to place the dot on the gauge based on status
  const getGaugePosition = (status: string) => {
    if (status === 'Critical' || status === 'High') return '85%'
    if (status === 'Warning') return '25%'
    return '50%'
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <title>QURIX Plus - Executive Clinical Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <div className="a4-page">
          {/* HEADER */}
          <div className="header no-break">
            <div className="header-logo">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <div>
                <div className="brand-title">QURIX Plus</div>
                <div className="brand-subtitle">Executive Health Passport</div>
              </div>
            </div>
            <div className="patient-meta">
              <h2>{data.patientProfile.name}</h2>
              <p>ID: {data.patientProfile.uhiId} | {data.patientProfile.age} Yrs | {data.patientProfile.gender}</p>
              <p>Date Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="content">
            <h1 className="report-title">Biomarker Exception Report</h1>
            <p className="report-desc">
              This automated executive summary isolates critical and warning analytes. Values plotted outside the green safe zone require immediate medical review.
            </p>

            {/* Historical Context Section */}
            <div className="history-section no-break">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Patient Clinical History
              </h3>
              <div className="history-grid">
                <div>
                  <div className="history-item-label">Known Conditions</div>
                  <div className="history-item-val">
                    {data.medicalHistory.knownConditions.map((c, i) => <span key={i} className="history-tag">{c}</span>)}
                  </div>
                </div>
                <div>
                  <div className="history-item-label">Past Surgeries</div>
                  <div className="history-item-val">{data.medicalHistory.pastSurgeries}</div>
                </div>
                <div>
                  <div className="history-item-label">Family History</div>
                  <div className="history-item-val">
                    {data.medicalHistory.familyHistoryAlerts.map((c, i) => <span key={i} className="history-tag">{c}</span>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Biomarkers */}
            <div className="system-group">
              <div className="system-header">
                <div className="system-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="system-title">Tracked Biomarkers</div>
              </div>

              {data.currentTrends.map((trend, idx) => (
                <div key={idx} className="biomarker-row">
                  <div className="biomarker-info">
                    <div className="bm-name">{trend.biomarker}</div>
                    <div className="bm-meta">Status: {trend.status}</div>
                  </div>
                  <div className="biomarker-value-box">
                    <div className={`bm-value ${getStatusColor(trend.status)}`}>
                      {trend.currentValue}
                      {getArrow(trend.trendDirection)}
                    </div>
                    <div className="bm-prev">Prev: {trend.previousValue}</div>
                  </div>
                  <div className="gauge-container">
                    <div className="gauge-track">
                      <div className={`gauge-node ${getNodeColor(trend.status)}`} style={{ left: getGaugePosition(trend.status) }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* FOOTER */}
          <div className="footer no-break">
            <div>This document was auto-generated by the QURIX Plus Intelligence Engine.</div>
            <div>Confidential Medical Record</div>
          </div>
        </div>
      </body>
    </html>
  )
}
