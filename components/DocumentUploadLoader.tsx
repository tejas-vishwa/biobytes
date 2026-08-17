import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function DocumentUploadLoader() {
  const [loadingText, setLoadingText] = useState('Initializing AI Pipeline...');

  // Cycle through text to keep the user engaged while waiting
  useEffect(() => {
    const messages = [
      "Taking a mindful look at your report...",
      "Translating complex clinical data into clarity...",
      "Organizing your health journey with care...",
      "Connecting your biomarker trends...",
      "Almost ready—bringing your wellness picture into focus..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingText(messages[i]);
    }, 2500); // Changes text every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full items-center justify-center py-6">
      {/* Glassmorphism Card */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/90 p-10 text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] backdrop-blur-xl w-full max-w-md">
        
        {/* Subtle glowing background orb */}
        <div className="absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[50px]"></div>

        {/* EKG Heartbeat Icon with Pulse Animation */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Activity 
            className="h-10 w-10 text-emerald-400 animate-pulse" 
            strokeWidth={1.5} 
          />
          {/* Ping effect behind the icon */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping"></div>
        </div>

        {/* Dynamic Loading Text */}
        <h3 className="mb-2 text-lg font-semibold tracking-wide text-gray-100">
          Analyzing Document
        </h3>
        
        <div className="h-6 overflow-hidden">
          <p className="animate-pulse text-sm font-medium text-emerald-400/80 transition-all duration-300">
            {loadingText}
          </p>
        </div>

        {/* Progress Bar (Indeterminate) */}
        <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-gray-800">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 animate-[translate_2s_infinite_linear]"></div>
        </div>
      </div>
    </div>
  );
}
