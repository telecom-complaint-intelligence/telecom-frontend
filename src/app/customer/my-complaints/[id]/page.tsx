"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Activity, CheckCircle, Send, Paperclip, AlertOctagon } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface ComplaintDetail {
  id: string;
  ticket_number: string;
  complaint1: string;
  complaint2: string | null;
  response: string | null;
  status: string;
  category: string;
  customer_feedback: boolean | null;
  created_at: string;
  resolved_by?: string | null;
  ai_analysis: {
    negativity_score: number;
    sentiment_score: number;
    diagnosis: string | null;
    root_cause: string | null;
    risk_level: string | null;
    policy_status: string | null;
    final_decision: string | null;
    critic_feedback: string | null;
    solution_a: string | null;
    solution_high: string | null;
  } | null;
  priority_scores: {
    complexity: string;
    total_complexity_score: number;
  } | null;
}

export default function ComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Feedback states
  const [lowFlowState, setLowFlowState] = useState<"recommendation" | "feedbackForm" | "solved">("recommendation");
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchComplaintDetails = async () => {
    if (!id || !token) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/complaints/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setComplaint(data);
      }
    } catch (err) {
      console.error("Error fetching complaint:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id, token]);

  const handleIssueSolved = async () => {
    if (!id || !token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/complaints/${id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ customer_feedback: true })
      });
      if (response.ok) {
        setLowFlowState("solved");
        await fetchComplaintDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSameProblem = () => {
    if (complaint?.complaint1) {
      setFeedbackText(`"${complaint.complaint1}" is still recurring and unresolved.`);
    } else {
      setFeedbackText("Internet issue is still recurring and unresolved.");
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !token || !feedbackText.trim()) return;

    setSubmittingFeedback(true);
    try {
      // 1. Update the follow-up text
      await fetch(`http://localhost:8000/api/v1/complaints/${id}`, {
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

      // 2. Submit negative feedback to trigger escalation
      const response = await fetch(`http://localhost:8000/api/v1/complaints/${id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ customer_feedback: false })
      });

      if (response.ok) {
        await fetchComplaintDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 md:p-12 text-center text-sm text-plum max-w-6xl w-full mx-auto font-sans">
        Loading ticket detail...
      </main>
    );
  }

  if (!complaint) {
    return (
      <main className="p-6 md:p-12 text-center text-sm text-plum max-w-6xl w-full mx-auto font-sans">
        Ticket not found.
      </main>
    );
  }

  const complexity = complaint.priority_scores?.complexity || "LOW";
  const severity = complexity.toLowerCase();

  // Timeline computation
  const timeline = [
    { label: "Submitted", time: complaint.created_at ? new Date(complaint.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Recent", done: true },
    { label: "Analysed", time: complaint.created_at ? new Date(complaint.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "Recent", done: true },
    { 
      label: "Assigned", 
      time: complaint.status !== "OPEN" ? "Updated" : "Pending", 
      done: complaint.status !== "OPEN" 
    },
    { 
      label: complaint.status === "ESCALATED" ? "Escalated" : complaint.status === "CLOSED" || complaint.status === "RESOLVED" ? "Resolved" : "In Progress", 
      time: "Live Status", 
      active: complaint.status === "OPEN" || complaint.status === "IN_PROGRESS" || complaint.status === "ESCALATED",
      done: complaint.status === "CLOSED" || complaint.status === "RESOLVED"
    },
  ];

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-plum uppercase">
        <Link href="/customer/my-complaints" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft size={12} /> My complaints
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{complaint.ticket_number || id.substring(0, 8)}</span>
      </div>

      {/* Ticket Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-beige pb-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-plum uppercase block">COMPLAINT ID: {id}</span>
          <h1 className="text-3xl font-serif font-normal capitalize">{complaint.complaint1}</h1>
        </div>
        <span className={`text-xs font-mono font-semibold px-3 py-1.5 rounded uppercase self-start md:self-center border ${
          complaint.status === "OPEN" ? "bg-red-50 text-red-700 border-red-200" :
          complaint.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-700 border-amber-200" :
          complaint.status === "ESCALATED" ? "bg-purple-50 text-purple-700 border-purple-200 animate-pulse" :
          "bg-green-50 text-green-700 border-green-200"
        }`}>
          {complaint.status}
        </span>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tracking steps */}
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-6">
            <h2 className="text-sm font-mono uppercase tracking-wider text-plum">Resolution timeline</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative before:absolute before:left-3 md:before:left-6 before:top-4 before:right-6 before:h-0.5 before:bg-border-beige before:hidden md:before:block">
              {timeline.map((step, idx) => (
                <div key={idx} className="relative pl-6 md:pl-0 md:pt-6 space-y-1 text-xs">
                  <span
                    className={`absolute left-0 top-1 md:top-0 md:left-4 h-3 w-3 rounded-full border ring-4 ring-background ${
                      step.done
                        ? "bg-accent border-accent text-white"
                        : step.active
                        ? "bg-accent border-accent animate-pulse"
                        : "bg-background border-border-beige"
                    }`}
                  ></span>
                  <p className="font-semibold text-foreground">{step.label}</p>
                  <p className="text-[10px] text-plum font-mono">{step.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-plum">Details Reported</h2>
            <p className="text-sm text-plum font-serif leading-relaxed capitalize">
              {complaint.complaint1}
            </p>
            {complaint.complaint2 && (
              <div className="mt-3 pt-3 border-t border-border-beige space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Follow-up symptoms</span>
                <p className="text-sm text-plum font-serif leading-relaxed capitalize">
                  {complaint.complaint2}
                </p>
              </div>
            )}
          </div>

          {/* Dynamic AI Resolution Panel */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping"></span>
              <h2 className="text-base font-serif font-semibold">AI Console Recommendations</h2>
            </div>

            {/* Resolution Checker (For low/medium complexity, still open) */}
            {complaint.status === "OPEN" && (severity === "low" || severity === "medium") ? (
              <div className="p-6 space-y-6">
                {lowFlowState === "recommendation" && (
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-5 rounded border border-purple-200 space-y-3">
                      <span className="text-xs font-mono text-accent uppercase font-bold block">Recommended self-care steps</span>
                      <p className="text-sm text-plum leading-relaxed white-space-pre-line">
                        {complaint.response || "No immediate action proposed. Support operations team has been notified."}
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
                        Describe what didn&apos;t work (triggers AI escalation):
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
              /* Display resolution outputs for high complexity or already resolved tickets */
              <div className="p-6 space-y-6">
                <div className="bg-purple-50 p-5 rounded border border-purple-200 space-y-3">
                  <span className="text-xs font-mono text-accent uppercase font-bold block">Assigned resolution</span>
                  <p className="text-sm text-plum leading-relaxed white-space-pre-line">
                    {complaint.response || "A technician dispatch is scheduled to restore your services."}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right column */}
        <div className="space-y-6">
          
          {/* Operator assignment */}
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-semibold">Assigned Engineer</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent-light text-accent flex items-center justify-center text-sm font-serif">
                VK
              </div>
              <div>
                <p className="text-sm font-semibold">Operations Support</p>
                <p className="text-xs text-plum">Telu Triage Center</p>
              </div>
            </div>
             <div className="text-xs text-plum leading-relaxed bg-[#F5EFEB] p-3 rounded border border-border-beige">
              <span className="font-semibold block text-foreground mb-1">Latest Update</span>
              {complaint.status === "ESCALATED" 
                ? "Checking Anna Nagar outdoor terminals. ETA tomorrow 14:00." 
                : complaint.status === "CLOSED" || complaint.status === "RESOLVED"
                ? `Ticket resolved and marked closed${complaint.resolved_by ? ` by ${complaint.resolved_by}` : ""}.`
                : "Awaiting local line feedback."}
            </div>
          </div>

          {/* AI triage values */}
          <div className="bg-[#F5EFEB] border border-border-beige p-6 rounded shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-serif font-semibold text-accent flex items-center gap-1.5">
              <AlertOctagon size={16} /> Triage Readouts
            </h3>
            <div className="divide-y divide-border-beige">
              <div className="py-2 flex justify-between">
                <span className="font-mono text-plum uppercase">Priority</span>
                <span className="font-semibold text-accent font-mono">{complexity}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
