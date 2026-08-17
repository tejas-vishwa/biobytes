"use client";

import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export interface Anomaly {
  id: string;
  region: string;
  finding: string;
  severity: "Severe" | "Moderate" | "Mild";
  confidence: number;
  box: { x: number; y: number; width: number; height: number }; // In percentage 0-100
}

export interface ScanResult {
  scanTitle: string;
  modality: string;
  imageUrl: string;
  anomalies: Anomaly[];
}

export default function DynamicScanReviewViewer({
  currentScan,
}: {
  currentScan: ScanResult | null;
}) {
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);

  if (!currentScan) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-gray-800 bg-gray-950 text-gray-400">
        Please upload or select a scan to begin AI analysis.
      </div>
    );
  }

  const uniqueAnomalies = currentScan.anomalies?.filter((anomaly, index, self) =>
    index === self.findIndex((t) => (
      t.region === anomaly.region || 
      JSON.stringify(t.box) === JSON.stringify(anomaly.box)
    ))
  ) || [];

  const selectedAnomaly =
    uniqueAnomalies.find((a) => a.id === selectedAnomalyId) ||
    uniqueAnomalies[0] ||
    null;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 rounded-2xl border border-gray-800 bg-gray-950 text-gray-100 shadow-2xl">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-800 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {currentScan.modality}
          </span>
          <h2 className="text-xl font-bold mt-2 text-white">
            {currentScan.scanTitle}
          </h2>
        </div>
      </div>

      {/* Visual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left Side: Before & After */}
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-4 justify-center items-center bg-black/60 p-4 rounded-xl border border-gray-900">
          
          {/* Before: Raw Scan */}
          <div className="flex-1 w-full flex flex-col items-center">
            <span className="text-xs font-medium text-gray-400 mb-2">
              Original Scan (Before)
            </span>
            <div className="relative w-full aspect-[3/4] max-h-[480px] overflow-hidden rounded-lg border border-gray-800 bg-black flex items-center justify-center">
              <img
                src={currentScan.imageUrl}
                alt="Raw Scan"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* After: Dynamic Bounding Boxes */}
          <div className="flex-1 w-full flex flex-col items-center">
            <span className="text-xs font-medium text-emerald-400 mb-2">
              AI Detection (After)
            </span>
            <div className="relative w-full aspect-[3/4] max-h-[480px] overflow-hidden rounded-lg border border-red-500/30 bg-black flex items-center justify-center">
              <img
                src={currentScan.imageUrl}
                alt="AI Marked Scan"
                className="w-full h-full object-contain"
              />

              {/* Dynamically mapped boxes from the API */}
              {uniqueAnomalies && uniqueAnomalies.length > 0 ? (
                uniqueAnomalies.map((item) => {
                  const isSelected = selectedAnomaly?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAnomalyId(item.id)}
                      style={{
                        left: `${item.box.x}%`,
                        top: `${item.box.y}%`,
                        width: `${item.box.width}%`,
                        height: `${item.box.height}%`,
                      }}
                      className={`absolute cursor-pointer border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-red-500 bg-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20"
                          : "border-amber-400/80 bg-amber-400/10 hover:border-red-400 z-10"
                      }`}
                    >
                      <span className="absolute -top-5 left-0 bg-gray-950/90 text-red-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-red-500/40">
                        {item.confidence}%
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-center p-6 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-gray-300 max-w-xs">
                    Anomaly detected, but specific spatial grounding could not be mapped.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Findings Panel */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              Detected Pathologies & Status
            </h3>

            <div className="space-y-3">
              {uniqueAnomalies.map((anomaly) => {
                const isSelected = selectedAnomaly?.id === anomaly.id;
                return (
                  <div
                    key={anomaly.id}
                    onClick={() => setSelectedAnomalyId(anomaly.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-red-500/10 border-red-500/50"
                        : "bg-gray-900/50 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-white">
                        {anomaly.region}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          anomaly.severity === "Severe"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {anomaly.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {anomaly.finding}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Confidence</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {anomaly.confidence}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full"
                        style={{ width: `${anomaly.confidence}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-gray-900/80 rounded-xl border border-gray-800 text-[11px] text-gray-400 leading-normal">
            <span className="font-semibold text-gray-300">Notice:</span> Findings are dynamically evaluated via the vision model and must be verified by a qualified physician.
          </div>
        </div>
      </div>
    </div>
  );
}
