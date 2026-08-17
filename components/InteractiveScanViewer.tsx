"use client";

import React, { useState } from "react";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";

export interface Finding {
  label: string;
  confidence: number;
  coordinates: { x1: number; y1: number; x2: number; y2: number };
  explanation: string;
}

interface ScanViewerProps {
  imageUrl: string;
  findings: Finding[];
}

export function InteractiveScanViewer({ imageUrl, findings }: ScanViewerProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [activeFinding, setActiveFinding] = useState<Finding | null>(null);

  const uniqueFindings = findings?.filter((finding, index, self) =>
    index === self.findIndex((t) => (
      t.label === finding.label || 
      JSON.stringify(t.coordinates) === JSON.stringify(finding.coordinates)
    ))
  ) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-5 rounded-2xl border border-border bg-card shadow-sm w-full">
      {/* Visual Canvas Area */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-black w-full lg:w-80 flex-shrink-0 flex items-center justify-center min-h-[300px]">
        {/* Original X-Ray Image */}
        <img
          src={imageUrl}
          alt="Radiology Scan"
          className="w-full h-full object-contain select-none max-h-80"
        />

        {/* Dynamic SVG Annotation Layer (Mapped to 1024x1024 viewBox for backend compatibility) */}
        {showOverlay && uniqueFindings.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-auto" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet">
            {uniqueFindings.map((finding, index) => {
              const { x1, y1, x2, y2 } = finding.coordinates;
              const width = x2 - x1;
              const height = y2 - y1;
              const isActive = activeFinding === finding;

              return (
                <rect
                  key={index}
                  x={x1}
                  y={y1}
                  width={width}
                  height={height}
                  className={`cursor-pointer transition-all duration-200 animate-pulse ${
                    isActive ? "fill-red-500/40 stroke-red-500 stroke-[10px]" : "fill-red-500/10 stroke-red-500 stroke-[5px]"
                  }`}
                  onMouseEnter={() => setActiveFinding(finding)}
                  onMouseLeave={() => setActiveFinding(null)}
                />
              );
            })}
          </svg>
        )}

        {/* Visibility Toggle Button */}
        {uniqueFindings.length > 0 && (
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-gray-700 text-xs font-medium text-white hover:bg-black/90 transition shadow-lg"
          >
            {showOverlay ? <EyeOff className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
            {showOverlay ? "Hide AI Markings" : "Show AI Markings"}
          </button>
        )}
      </div>

      {/* AI Reasoning & Diagnostic Breakdown */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-foreground">AI Visual Grounding Evidence</h3>
          </div>

          {uniqueFindings.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {uniqueFindings.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all cursor-default ${
                    activeFinding === item
                      ? "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)] scale-[1.02]"
                      : "border-border bg-muted/40 hover:border-red-500/30"
                  }`}
                  onMouseEnter={() => setActiveFinding(item)}
                  onMouseLeave={() => setActiveFinding(null)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-red-500 dark:text-red-400 truncate mr-2">{item.label} Detected</span>
                    <span className="text-[11px] px-2.5 py-1 flex-shrink-0 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-mono font-bold border border-red-500/20">
                      {item.confidence}% Match
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed flex flex-col items-center justify-center h-[200px]">
              <EyeOff className="h-8 w-8 mb-3 opacity-20" />
              <p className="text-sm font-semibold text-foreground">No localized visual anomalies detected.</p>
              <p className="text-xs mt-1 max-w-xs">Image spatial features were evaluated globally without specific focal bounding box grounding.</p>
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground mt-4 border-t border-border pt-3">
          Bounding boxes indicate localized spatial features analyzed by the detection model via YOLOv8 / Grad-CAM Saliency Attribution. This is intended for assistive triage and requires physician verification.
        </p>
      </div>
    </div>
  );
}
