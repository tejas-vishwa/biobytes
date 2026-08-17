"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, SlidersHorizontal } from "lucide-react";

interface Anomaly {
  id: string;
  region: string;
  finding: string;
  severity: "Severe" | "Moderate" | "Mild";
  confidence: number;
  box: { x: number; y: number; width: number; height: number }; // Percentage (0-100)
}

const mockAnomalies: Anomaly[] = [
  {
    id: "1",
    region: "Middle Finger (3rd Digit PIP Joint)",
    finding: "Complete PIP joint dislocation & severe subluxation with joint erosion",
    severity: "Severe",
    confidence: 96.4,
    box: { x: 34, y: 7, width: 23, height: 26 },
  },
  {
    id: "2",
    region: "Index Finger (2nd Digit MCP/PIP)",
    finding: "PIP joint deviation with periarticular erosion",
    severity: "Moderate",
    confidence: 88.7,
    box: { x: 60, y: 7, width: 22, height: 26 },
  },
  {
    id: "3",
    region: "4th & 5th Digits (MCP Joints)",
    finding: "Marked ulnar drift and subluxation at metacarpophalangeal junctions",
    severity: "Severe",
    confidence: 93.1,
    box: { x: 14, y: 38, width: 42, height: 25 },
  },
];

export function ScanReviewViewer({ rawImageUrl }: { rawImageUrl: string }) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(mockAnomalies[0]);
  const [activeTab, setActiveTab] = useState<"side-by-side" | "overlay">("side-by-side");

  return (
    <div className="w-full mx-auto p-6 rounded-2xl border border-gray-800 bg-gray-950 text-gray-100 shadow-2xl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-gray-800 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Musculoskeletal Module • Radiography
          </span>
          <h2 className="text-xl font-bold mt-2 text-white">Diagnostic Review: Hand / Extremity Scan</h2>
        </div>

        <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab("side-by-side")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "side-by-side" ? "bg-gray-800 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Before & After
          </button>
          <button
            onClick={() => setActiveTab("overlay")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "overlay" ? "bg-gray-800 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Interactive Overlay
          </button>
        </div>
      </div>

      {/* Visual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left Side: Image(s) */}
        <div className="lg:col-span-8 flex flex-col md:flex-row gap-4 justify-center items-center bg-black/60 p-4 rounded-xl border border-gray-900">
          {/* Before: Raw Image */}
          {(activeTab === "side-by-side" || activeTab === "overlay") && (
             <div className={`flex-1 w-full flex flex-col items-center ${activeTab === "overlay" ? "hidden md:flex" : ""}`}>
              <span className="text-xs font-medium text-gray-400 mb-2">Original Scan (Before)</span>
              <div className="relative w-full aspect-[3/4] max-h-[480px] overflow-hidden rounded-lg border border-gray-800 bg-black flex items-center justify-center">
                <img src={rawImageUrl} alt="Raw Scan" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* After: AI Marked Detection */}
          <div className={`w-full flex flex-col items-center ${activeTab === "side-by-side" ? "flex-1" : "flex-[2]"}`}>
            <span className="text-xs font-medium text-emerald-400 mb-2">AI Detection (After)</span>
            <div className="relative w-full aspect-[3/4] max-h-[480px] overflow-hidden rounded-lg border border-red-500/30 bg-black flex items-center justify-center">
              <img src={rawImageUrl} alt="AI Marked Scan" className="w-full h-full object-contain" />

              {/* Bounding Box Highlights */}
              {mockAnomalies.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAnomaly(item)}
                  style={{
                    left: `${item.box.x}%`,
                    top: `${item.box.y}%`,
                    width: `${item.box.width}%`,
                    height: `${item.box.height}%`,
                  }}
                  className={`absolute cursor-pointer border-2 transition-all duration-200 ${
                    selectedAnomaly?.id === item.id
                      ? "border-red-500 bg-red-500/25 shadow-[0_0_20px_rgba(239,68,68,0.5)] z-20"
                      : "border-amber-400/80 bg-amber-400/10 hover:border-red-400 z-10"
                  }`}
                >
                  <span className="absolute -top-5 left-0 bg-gray-950/90 text-red-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-red-500/40">
                    {item.confidence}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: MSK Pathology Scorecard */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              Detected Pathologies & Status
            </h3>

            <div className="space-y-3">
              {mockAnomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  onClick={() => setSelectedAnomaly(anomaly)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedAnomaly?.id === anomaly.id
                      ? "bg-red-500/10 border-red-500/50"
                      : "bg-gray-900/50 border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-white">{anomaly.region}</span>
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
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{anomaly.finding}</p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Confidence</span>
                    <span className="font-mono text-emerald-400 font-semibold">{anomaly.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full"
                      style={{ width: `${anomaly.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-gray-900/80 rounded-xl border border-gray-800 text-[11px] text-gray-400 leading-normal">
            <span className="font-semibold text-gray-300">Notice:</span> Findings represent structural abnormalities (joint space collapse, subluxation, deformity) detected by the MSK vision pipeline. Clinical verification by an orthopedic radiologist is advised.
          </div>
        </div>
      </div>
    </div>
  );
}
