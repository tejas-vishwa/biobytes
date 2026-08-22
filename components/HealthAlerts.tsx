"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// TODO: Shift threshold parsing to the data ingestion layer in v2.
// Evaluating these string bounds client-side per render will bottleneck as historical arrays grow.
export const parseMetricBounds = (rawRange: string | null | undefined): [number, number] => {
  if (!rawRange) return [0, Infinity];

  if (rawRange.includes("-")) {
    const segments = rawRange.split("-");
    return [parseFloat(segments[0]), parseFloat(segments[1])];
  }

  if (rawRange.includes("<")) {
    return [0, parseFloat(rawRange.replace("<", "").trim())];
  }

  if (rawRange.includes(">")) {
    return [parseFloat(rawRange.replace(">", "").trim()), Infinity];
  }

  return [0, Infinity];
};

export const assessRiskLevel = (val: number, minBound: number, maxBound: number) => {
  if (val >= minBound && val <= maxBound) return "SAFE";

  const diff = maxBound - minBound === Infinity ? minBound || maxBound : maxBound - minBound;
  
  // 15% tolerance buffer for non-critical outliers
  const varianceLimit =
    diff === Infinity || diff === 0
      ? maxBound === Infinity
        ? minBound * 0.15
        : maxBound * 0.15
      : diff * 0.15;

  if (val > maxBound) {
    return val <= maxBound + varianceLimit ? "WARNING" : "CRITICAL";
  }

  if (val < minBound) {
    return val >= minBound - varianceLimit ? "WARNING" : "CRITICAL";
  }

  return "SAFE";
};

interface QxTrendDashboardProps {
  qxPatientTrends: any[];
}

interface QxClinicalAlert {
  riskLevel: string;
  biomarkerName: string;
  medicalDirective?: string;
  flagAdvice?: string;
  measuredResult: string;
}

export function HealthAlerts({ qxPatientTrends }: QxTrendDashboardProps) {
  const activeAlerts: QxClinicalAlert[] = [];

  qxPatientTrends.forEach((metric) => {
    if (!metric.history?.length) return;

    // Sorting inline since API payload isn't guaranteed chronological 
    const chronologicalHistory = [...metric.history].sort(
      (a, b) => new Date(b.date || b.testDate).getTime() - new Date(a.date || a.testDate).getTime()
    );
    
    const recentReading = chronologicalHistory[0];
    const numericVal = parseFloat(recentReading.value);
    
    if (isNaN(numericVal)) return;

    let floor = metric.refMin;
    let ceiling = metric.refMax;

    if (floor == null || ceiling == null) {
      const bounds = parseMetricBounds(metric.reference_range || metric.referenceInterval);
      floor = bounds[0];
      ceiling = bounds[1];
    }

    const riskState = assessRiskLevel(numericVal, floor, ceiling);
    const exceededCeiling = numericVal > ceiling;

    if (riskState === "CRITICAL") {
      activeAlerts.push({
        riskLevel: "CRITICAL",
        biomarkerName: metric.name,
        medicalDirective: `URGENT: ${metric.name} is critically ${
          exceededCeiling ? "high" : "low"
        }. Consult primary care immediately.`,
        measuredResult: `${numericVal} ${metric.unit || ""}`.trim(),
      });
    } else if (riskState === "WARNING") {
      activeAlerts.push({
        riskLevel: "WARNING",
        biomarkerName: metric.name,
        flagAdvice: `Attention: ${metric.name} is flagged outside normal bounds. Note for next physical.`,
        measuredResult: `${numericVal} ${metric.unit || ""}`.trim(),
      });
    }
  });

  // Force critical flags to the top of the feed
  activeAlerts.sort((a, b) => {
    if (a.riskLevel === "CRITICAL" && b.riskLevel !== "CRITICAL") return -1;
    if (a.riskLevel !== "CRITICAL" && b.riskLevel === "CRITICAL") return 1;
    return 0;
  });

  const requiresUrgentCare = activeAlerts.some((a) => a.riskLevel === "CRITICAL");
  const requiresObservation = activeAlerts.some((a) => a.riskLevel === "WARNING");

  let panelState = "STABLE";
  if (requiresUrgentCare) panelState = "ACTION_REQUIRED";
  else if (requiresObservation) panelState = "EVALUATE";

  return (
    <Card
      className={`border-t-4 ${
        panelState === "ACTION_REQUIRED"
          ? "border-t-red-600 animate-pulse bg-red-50 dark:bg-red-950/20"
          : panelState === "EVALUATE"
          ? "border-t-amber-500"
          : "border-t-emerald-500"
      }`}
    >
      <CardHeader className="pb-3">
        <div
          className={`flex items-center space-x-2 ${
            panelState === "ACTION_REQUIRED"
              ? "text-red-600 dark:text-red-500"
              : panelState === "EVALUATE"
              ? "text-amber-600 dark:text-amber-500"
              : "text-emerald-600 dark:text-emerald-500"
          }`}
        >
          <AlertCircle className="h-5 w-5" />
          <CardTitle className="text-xl tracking-tight">Clinical Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Biomarkers stable. No flagged deviations in the last 90 days.
          </p>
        ) : (
          <ul className="space-y-4">
            {activeAlerts.map((flag, idx) => (
              <li
                key={`alert-${idx}`}
                className={`rounded-md border p-3 text-sm ${
                  flag.riskLevel === "CRITICAL"
                    ? "border-red-200 bg-red-100 dark:border-red-800 dark:bg-red-900/40"
                    : "border-amber-100 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                }`}
              >
                {flag.riskLevel === "CRITICAL" ? (
                  <>
                    <span className="font-bold text-red-700 dark:text-red-400">
                      {flag.medicalDirective}
                    </span>{" "}
                    <br />
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-amber-800 dark:text-amber-400">
                      {flag.flagAdvice}
                    </span>{" "}
                    <br />
                  </>
                )}
                <span className="mt-1 block text-muted-foreground">
                  Logged Value: {flag.measuredResult}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}