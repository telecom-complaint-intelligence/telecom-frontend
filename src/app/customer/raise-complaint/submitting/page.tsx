"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubmittingComplaintPage() {
  const router = useRouter();
  
  // Triage state simulation
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  // Flow control states - initial state will be randomized on mount
  const [severity, setSeverity] = useState<"low" | "high" | "critical">("high");
  const [isFinalSuccess, setIsFinalSuccess] = useState(false);
  
  // Low severity follow-up states
  const [lowFlowState, setLowFlowState] = useState<"recommendation" | "feedbackForm" | "solved">("recommendation");
  const [feedbackText, setFeedbackText] = useState("");

  const steps = [
    { label: "Reading complaint details", detail: "482 words analysed" },
    { label: "Detecting issue category", detail: "Broadband performance" },
    { label: "Analysing customer sentiment", detail: "Negative tone detected" },
    { label: "Calculating console priority", detail: severity.toUpperCase() },
    { label: "Predicting escalation risk", detail: severity === "critical" ? "91% probability" : severity === "high" ? "78% probability" : "12% probability" },
    { label: "Generating recommended actions", detail: "Ready" },
  ];

  // Reset triage animation whenever severity is switched for testing
  const resetTriage = (newSev: "low" | "high" | "critical") => {
    setSeverity(newSev);
    setStep(0);
    setProgress(0);
    setComplete(false);
    setIsFinalSuccess(false);
    setLowFlowState("recommendation");
    setFeedbackText("");
  };

  useEffect(() => {
    if (step < steps.length) {
      const interval = setTimeout(() => {
        setStep(prev => prev + 1);
        setProgress(prev => Math.min(100, prev + 16.7));
      }, 700);
      return () => clearTimeout(interval);
    } else {
      const timer = setTimeout(() => {
        setComplete(true);
        // High/Critical severity immediately routes to inline success state
        if (severity === "high" || severity === "critical") {
          setIsFinalSuccess(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, severity]);

  const handleSameProblem = () => {
    setFeedbackText("Internet very slow every evening (Same issue recurring)");
    setTimeout(() => {
      setIsFinalSuccess(true);
    }, 400);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFinalSuccess(true);
  };

  return (
    <div className="p-6 md:p-12 space-y-8 max-w-3xl w-full mx-auto font-sans relative">
      
      {/* Triage Preview Selector */}
      <div className="p-3 bg-[#F5EFEB] border border-border-beige rounded flex items-center justify-between text-xs">
        <span className="font-semibold text-plum">Select Flow:</span>
        <div className="flex gap-2">
          <button
            onClick={() => resetTriage("critical")}
            className={`px-3 py-1 rounded cursor-pointer transition-all ${
              severity === "critical" ? "bg-[#1E0A2D] text-white font-bold" : "bg-white border border-border-beige text-plum"
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => resetTriage("high")}
            className={`px-3 py-1 rounded cursor-pointer transition-all ${
              severity === "high" ? "bg-[#1E0A2D] text-white font-bold" : "bg-white border border-border-beige text-plum"
            }`}
          >
            High
          </button>
          <button
            onClick={() => resetTriage("low")}
            className={`px-3 py-1 rounded cursor-pointer transition-all ${
              severity === "low" ? "bg-[#1E0A2D] text-white font-bold" : "bg-white border border-border-beige text-plum"
            }`}
          >
            Low
          </button>
        </div>
      </div>

      {!complete ? (
        <div className="bg-card-bg border border-border-beige p-8 rounded shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-accent">
            <span className="h-2 w-2 rounded-full bg-accent animate-ping"></span>
            <span className="text-[10px] font-mono tracking-wider uppercase">Uplink Triage</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-light">Analysing your complaint</h1>
            <p className="text-sm text-plum">
              This will take a few seconds. We are categorising and triaging your ticket so it reaches the correct queue.
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-border-beige rounded overflow-hidden">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Steps */}
          <div className="space-y-4 pt-4">
            {steps.map((s, idx) => {
              const isActive = idx === step;
              const isPassed = idx < step;
              return (
                <div
                  key={idx}
                  className={`flex justify-between items-center text-sm transition-opacity duration-300 ${
                    isActive ? "opacity-100 font-semibold" : isPassed ? "opacity-50" : "opacity-25"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] font-mono ${
                        isPassed ? "bg-accent border-accent text-white" : "border-border-beige"
                      }`}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </span>
                    <span>{s.label}</span>
                  </div>
                  {isPassed && <span className="text-xs font-mono text-plum">{s.detail}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : isFinalSuccess ? (
        // Inline success view (replaces background details card completely)
        <div className="bg-card-bg border border-border-beige p-8 rounded shadow-sm space-y-6 text-center animate-fade-in max-w-md mx-auto">
          <div className="flex justify-center">
            <span className="h-14 w-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 text-2xl font-bold">
              ✓
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-mono text-plum uppercase">Ticket Registered: CMP1025</p>
            <h2 className="text-xl font-serif font-semibold text-foreground">
              Thx for ur time, help is on the way !
            </h2>
            <p className="text-xs text-plum leading-relaxed">
              Your complaint has been successfully flagged. A support representative will review it shortly.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/customer/dashboard")}
            className="w-full py-3 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-xs font-semibold rounded cursor-pointer transition-colors"
          >
            Close and return
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="p-6 bg-card-bg border border-green-200 bg-green-50/10 rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-serif">
                ✓
              </div>
              <div>
                <h1 className="text-2xl font-serif font-semibold">Complaint submitted</h1>
                <p className="text-sm text-plum">We have registered your issue and sent an SMS confirmation.</p>
              </div>
            </div>
            <div className="text-left md:text-right font-mono text-xs text-plum">
              <span>COMPLAINT ID</span>
              <p className="font-semibold text-foreground mt-1">CMP1025</p>
            </div>
          </div>

          {/* Triage Readouts Panel */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping"></span>
              <h2 className="text-base font-serif font-semibold">Triage Readouts</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border-beige border-b border-border-beige">
              <div className="p-5 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Category</span>
                <p className="font-medium text-sm">Broadband</p>
              </div>
              <div className="p-5 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Sentiment</span>
                <p className="font-medium text-sm text-red-600 font-semibold">Highly Negative</p>
              </div>
              <div className="p-5 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Priority</span>
                <p className="font-medium text-sm font-mono text-accent font-semibold">{severity.toUpperCase()}</p>
              </div>
              <div className="p-5 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Response Due</span>
                <p className="font-medium text-sm">
                  {severity === "critical" ? "Immediate Triage" : severity === "high" ? "Within 4 hours" : "Within 24 hours"}
                </p>
              </div>
            </div>

            {/* Content view based on Severity */}
            {severity === "low" && (
              // Low Severity Flow with Recommendations
              <div className="p-6 space-y-6">
                {lowFlowState === "recommendation" && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-5 rounded border border-purple-200 space-y-3">
                      <span className="text-xs font-mono text-accent uppercase font-bold block">Recommended Resolution</span>
                      <p className="text-sm text-plum leading-relaxed">
                        We recommend performing a hard restart of your router. Unplug the power cable for 30 seconds and plug it back in.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setLowFlowState("solved")}
                        className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors cursor-pointer"
                      >
                        ✓ Issue Solved
                      </button>
                      <button
                        type="button"
                        onClick={() => setLowFlowState("feedbackForm")}
                        className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 text-xs font-semibold rounded hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        ✗ Still Facing Issue
                      </button>
                    </div>
                  </div>
                )}

                {lowFlowState === "solved" && (
                  <div className="p-5 bg-green-50 border border-green-200 text-green-800 rounded text-sm font-medium">
                    ✓ Great! Glad to hear the issue was resolved. Your ticket has been closed.
                  </div>
                )}

                {lowFlowState === "feedbackForm" && (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <label className="text-xs font-mono text-plum uppercase block" htmlFor="recheckDesc">
                        Please describe the issue once again:
                      </label>
                      <textarea
                        id="recheckDesc"
                        required
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Detail the remaining symptoms..."
                        rows={3}
                        className="w-full p-3 bg-background border border-border-beige rounded text-xs focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#1E0A2D] text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Submit Issue Details
                      </button>
                      <button
                        type="button"
                        onClick={handleSameProblem}
                        className="px-4 py-2 bg-purple-50 text-accent border border-purple-200 text-xs font-semibold rounded hover:bg-purple-100 transition-colors cursor-pointer"
                      >
                        Same Problem
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/customer/dashboard")}
              className="px-6 py-3 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-sm font-medium rounded transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
