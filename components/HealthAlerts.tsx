"use client"

import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const parseRange = (referenceRange: string | null | undefined): [number, number] => {
  if (!referenceRange) return [0, Infinity]
  
  if (referenceRange.includes("-")) {
    const parts = referenceRange.split("-")
    return [parseFloat(parts[0]), parseFloat(parts[1])]
  }
  
  if (referenceRange.includes("<")) {
    const val = referenceRange.replace("<", "").trim()
    return [0, parseFloat(val)]
  }

  if (referenceRange.includes(">")) {
    const val = referenceRange.replace(">", "").trim()
    return [parseFloat(val), Infinity]
  }

  return [0, Infinity]
}

export const calculateSeverity = (value: number, min: number, max: number) => {
  if (value >= min && value <= max) {
    return 'GREEN'
  }

  const range = max - min === Infinity ? min || max : max - min
  const threshold = (range === Infinity || range === 0) ? 
      (max === Infinity ? min * 0.15 : max * 0.15) : 
      range * 0.15

  if (value > max) {
    if (value <= max + threshold) return 'YELLOW'
    return 'RED'
  }

  if (value < min) {
    if (value >= min - threshold) return 'YELLOW'
    return 'RED'
  }

  return 'GREEN'
}

interface HealthAlertsProps {
  patientTrendHistory: any[]
}

interface Alert {
  severity: string;
  test_name: string;
  urgent_warning?: string;
  advice?: string;
  result: string;
}

export function HealthAlerts({ patientTrendHistory }: HealthAlertsProps) {
  const alerts: Alert[] = []

  patientTrendHistory.forEach(test => {
    if (!test.history || test.history.length === 0) return
    
    const sortedHistory = [...test.history].sort((a, b) => new Date(b.date || b.testDate).getTime() - new Date(a.date || a.testDate).getTime())
    const latest = sortedHistory[0]
    
    const value = parseFloat(latest.value)
    if (isNaN(value)) return

    let min = test.refMin
    let max = test.refMax
    
    if (min === undefined || max === undefined || min === null || max === null) {
      const parsed = parseRange(test.reference_range || test.referenceInterval)
      min = parsed[0]
      max = parsed[1]
    }

    const severity = calculateSeverity(value, min, max)

    if (severity === 'RED') {
      const isHigh = value > max;
      alerts.push({
        severity: 'RED',
        test_name: test.name,
        urgent_warning: `URGENT: Your ${test.name} is critically ${isHigh ? 'high' : 'low'}. Please consult a doctor immediately.`,
        result: `${value} ${test.unit || ''}`.trim()
      });
    } else if (severity === 'YELLOW') {
      const isHigh = value > max;
      alerts.push({
        severity: 'YELLOW',
        test_name: test.name,
        advice: `Attention needed: Your ${test.name} is slightly flagged. Discuss this at your next checkup.`,
        result: `${value} ${test.unit || ''}`.trim()
      });
    }
  })

  alerts.sort((a, b) => {
    if (a.severity === 'RED' && b.severity !== 'RED') return -1
    if (a.severity !== 'RED' && b.severity === 'RED') return 1
    return 0
  })

  const hasCritical = alerts.some(a => a.severity === 'RED')
  const hasYellow = alerts.some(a => a.severity === 'YELLOW')
  
  let overallStatus = 'NORMAL'
  if (hasCritical) overallStatus = 'CRITICAL'
  else if (hasYellow) overallStatus = 'ATTENTION_NEEDED';

  return (
    <Card className={`border-t-4 ${overallStatus === 'CRITICAL' ? 'border-t-red-600 animate-pulse bg-red-50 dark:bg-red-950/20' : overallStatus === 'ATTENTION_NEEDED' ? 'border-t-amber-500' : 'border-t-green-500'}`}>
      <CardHeader className="pb-3">
        <div className={`flex items-center space-x-2 ${overallStatus === 'CRITICAL' ? 'text-red-600 dark:text-red-500' : overallStatus === 'ATTENTION_NEEDED' ? 'text-amber-600 dark:text-amber-500' : 'text-green-600 dark:text-green-500'}`}>
          <AlertCircle className="h-5 w-5" />
          <CardTitle className="text-xl">Health Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">All clear! No active alerts in the last 90 days. You are doing great!</p>
        ) : (
          <ul className="space-y-4">
            {alerts.map((alert, i) => (
              <li 
                key={i} 
                className={`p-3 rounded-md text-sm border ${
                  alert.severity === 'RED' 
                    ? 'bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800' 
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900'
                }`}
              >
                {alert.severity === 'RED' ? (
                  <>
                    <span className="font-bold text-red-700 dark:text-red-400">{alert.urgent_warning}</span> <br/>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-amber-800 dark:text-amber-400">{alert.advice}</span> <br/>
                  </>
                )}
                <span className="text-muted-foreground mt-1 block">Result: {alert.result}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}