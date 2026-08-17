"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

interface ComplaintDetail {
  id: string;
  ticket_number: string;
  category: string;
  response: string;
  status: string;
  complaint1?: string;
  ai_analysis: {
    negativity_score: number;
    sentiment_score: number;
  };
  priority_scores: {
    complexity: string;
  };
}

function SubmittingComplaintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get("id");
  const { token } = useAuth();

  // Triage state
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [complaintData, setComplaintData] = useState<ComplaintDetail | null>(null);

  // Flow control states
  const [severity, setSeverity] = useState<"low" | "high" | "critical">("low");
  const [isFinalSuccess, setIsFinalSuccess] = useState(false);
  
  // Low severity follow-up states
  const [lowFlowState, setLowFlowState] = useState<"recommendation" | "feedbackForm" | "solved">("recommendation");
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Fetch ticket details from backend
  useEffect(() => {
    if (!ticketId || !token) return;

    fetch(`http://localhost:8000/api/v1/complaints/${ticketId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch complaint details");
        return res.json();
      })
      .then(data => {
        setComplaintData(data);
        const comp = data.priority_scores?.complexity?.toLowerCase() || "low";
        if (comp === "critical" || comp === "high") {
          setSeverity(comp as "low" | "high" | "critical");
        } else {
          setSeverity("low");
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, [ticketId, token]);

  const steps = [
    { label: "Reading complaint details", detail: "Analysing structure" },
    { label: "Detecting issue category", detail: complaintData?.category || "Triage pending" },
    { label: "Analysing customer sentiment", detail: complaintData?.ai_analysis ? `Negativity: ${(complaintData.ai_analysis.negativity_score * 100).toFixed(0)}%` : "Calculating..." },
    { label: "Calculating console priority", detail: complaintData?.priority_scores?.complexity || "Triage pending" },
    { label: "Predicting escalation risk", detail: severity === "critical" ? "91% probability" : severity === "high" ? "78% probability" : "12% probability" },
    { label: "Generating recommended actions", detail: "Ready" },
  ];

  // Animation cycle
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
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const fetchLatestTicketDetails = async () => {
    if (!ticketId || !token) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/complaints/${ticketId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setComplaintData(data);
        const comp = data.priority_scores?.complexity?.toLowerCase() || "low";
        if (comp === "critical" || comp === "high") {
          setSeverity(comp as "low" | "high" | "critical");
        } else {
          setSeverity("low");
        }
      }
    } catch (err) {
      console.error("Error fetching latest details:", err);
    }
  };

  const handleIssueSolved = async () => {
    if (!ticketId || !token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/complaints/${ticketId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ customer_feedback: true })
      });
      if (response.ok) {
        setLowFlowState("solved");
        await fetchLatestTicketDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSameProblem = () => {
    if (complaintData?.complaint1) {
      setFeedbackText(`"${complaintData.complaint1}" is still recurring and unresolved.`);
    } else {
      setFeedbackText("Internet issue is still recurring and unresolved.");
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || !token || !feedbackText.trim()) return;

    setSubmittingFeedback(true);
    try {
      // 1. Update the follow-up complaint text
      await fetch(`http://localhost:8000/api/v1/complaints/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          complaint2: feedbackText,
          status: "IN_PROGRESS"
        })
      });

      // 2. Submit negative feedback to trigger AI Escalation & High Council
      const response = await fetch(`http://localhost:8000/api/v1/complaints/${ticketId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ customer_feedback: false })
      });

      if (response.ok) {
        // Refetch latest details to display the escalated technician plan
        await fetchLatestTicketDetails();
      } else {
        alert("Escalation failed. Proceeding with standard update.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-8 max-w-3xl w-full mx-auto font-sans relative">
      
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
        // Inline success view
        <div className="bg-card-bg border border-border-beige p-8 rounded shadow-sm space-y-6 text-center animate-fade-in max-w-md mx-auto">
          <div className="flex justify-center">
            <span className="h-14 w-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 text-2xl font-bold">
              ✓
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-mono text-plum uppercase">Ticket Registered: {complaintData?.ticket_number || "CMP1025"}</p>
            <h2 className="text-xl font-serif font-semibold text-foreground">
              Thank you for your time!
            </h2>
            <p className="text-xs text-plum leading-relaxed">
              {severity === "low" 
                ? "Your follow-up has been registered. A support representative will review it shortly."
                : "Your complaint has been successfully flagged. A support representative has been assigned."}
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
                <p className="text-sm text-plum">We have registered your issue and sent a confirmation.</p>
              </div>
            </div>
            <div className="text-left md:text-right font-mono text-xs text-plum">
              <span>TICKET NUMBER</span>
              <p className="font-semibold text-foreground mt-1">{complaintData?.ticket_number || "CMP1025"}</p>
            </div>
          </div>

          {/* Triage Readouts Panel */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping"></span>
              <h2 className="text-base font-serif font-semibold">Triage Readouts</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-border-beige border-b border-border-beige">
              <div className="p-5 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Category</span>
                <p className="font-medium text-sm capitalize">{complaintData?.category || "General"}</p>
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
            {severity === "low" && complaintData?.status !== "ESCALATED" ? (
              // Low Severity Flow with Recommendations
              <div className="p-6 space-y-6">
                {lowFlowState === "recommendation" && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-5 rounded border border-purple-200 space-y-3">
                      <span className="text-xs font-mono text-accent uppercase font-bold block">Recommended Resolution</span>
                      <p className="text-sm text-plum leading-relaxed">
                        {complaintData?.response || "We recommend performing a hard restart of your router. Unplug the power cable for 30 seconds and plug it back in."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleIssueSolved}
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
                        Please describe the issue once again (clarify what didn&apos;t work):
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
                        disabled={submittingFeedback}
                        className="px-4 py-2 bg-[#1E0A2D] text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        {submittingFeedback ? "Submitting..." : "Submit Issue Details"}
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
            ) : (
              /* Escalated / High Severity Status Card */
              <div className="p-6 space-y-6">
                <div className="bg-purple-50 p-5 rounded border border-purple-200 space-y-3">
                  <span className="text-xs font-mono text-accent uppercase font-bold block">Assigned resolution</span>
                  <p className="text-sm text-plum leading-relaxed white-space-pre-line">
                    {complaintData?.response || "A technician dispatch is scheduled to restore your services."}
                  </p>
                </div>
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

export default function SubmittingComplaintPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-plum">Loading triage console...</div>}>
      <SubmittingComplaintContent />
    </Suspense>
  );
}
