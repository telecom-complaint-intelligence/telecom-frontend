"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, ShieldAlert, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface ComplaintDetail {
  id: string;
  ticket_number: string;
  user_id?: string | null;
  complaint1: string;
  complaint2: string | null;
  response: string | null;
  status: string;
  category: string;
  created_at: string;
  resolved_by?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  response_timestamp?: string | null;
  follow_up_timestamp?: string | null;
  closing_time_stamp?: string | null;
  complaint_address?: {
    city?: string;
    phone?: string;
  } | null;
  ai_analysis?: {
    negativity_score: number;
    sentiment_score: number;
    confidence_score?: number | null;
    solution_high?: string | null;
    diagnosis: string | null;
    root_cause: string | null;
    risk_level: string | null;
  } | null;
  priority_scores?: {
    complexity: string;
    total_complexity_score: number;
  } | null;
}

export default function ClientComplaintIntelligencePage() {
  const { token, user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolution Modal States (GitHub style confirmation)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

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

  const updateStatus = async (nextStatus: "IN_PROGRESS" | "ESCALATED" | "RESOLVED", resolvedBy?: string) => {
    if (!token) return;
    try {
      const payload: { status: string; resolved_by?: string } = { status: nextStatus };
      if (resolvedBy) {
        payload.resolved_by = resolvedBy;
      }
      const response = await fetch(`http://localhost:8000/api/v1/complaints/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        fetchComplaintDetails();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleConfirmResolve = async () => {
    const targetMatch = user?.id || "OPS-ADMIN";
    if (confirmInput !== targetMatch) return;
    await updateStatus("RESOLVED", targetMatch);
    setIsResolveModalOpen(false);
    setConfirmInput("");
  };

  if (loading) {
    return (
      <main className="p-6 md:p-12 text-center text-sm text-plum max-w-7xl w-full mx-auto font-sans">
        Loading ticket intelligence...
      </main>
    );
  }

  if (!complaint) {
    return (
      <main className="p-6 md:p-12 text-center text-sm text-plum max-w-7xl w-full mx-auto font-sans">
        Ticket not found.
      </main>
    );
  }

  const complexity = complaint.priority_scores?.complexity || "LOW";
  const targetMatch = user?.id
    ? user.id.startsWith("CUST-")
      ? user.id.replace("CUST-", "OPS-")
      : user.id
    : "OPS-ADMIN";

  // Helper to format date strings cleanly
  const formatTime = (dateStr?: string | null, fallback: string = "Recent") => {
    if (!dateStr) return fallback;
    try {
      const isoStr = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : `${dateStr}Z`;
      return new Date(isoStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return fallback;
    }
  };

  // Build a timeline of dynamic actions that actually exist
  const events = [
    {
      title: "Complaint Registered",
      desc: `Customer raised a complaint: "${complaint.complaint1}"`,
      time: formatTime(complaint.created_at),
      tag: "Customer"
    }
  ];

  if (complaint.response) {
    events.push({
      title: "AI Recommendation Offered",
      desc: complaint.response,
      time: formatTime(complaint.response_timestamp, "Initial Triage"),
      tag: "System"
    });
  }

  if (complaint.complaint2) {
    events.push({
      title: "Customer Follow-Up Reported",
      desc: complaint.complaint2,
      time: formatTime(complaint.follow_up_timestamp, "Follow-up"),
      tag: "Customer"
    });
  }

  if (complaint.status === "RESOLVED" || complaint.status === "CLOSED") {
    const isOps = complaint.resolved_by?.startsWith("OPS-") || complaint.resolved_by?.startsWith("ADMIN");
    events.push({
      title: complaint.status === "CLOSED" && !isOps ? "Complaint Closed" : "Complaint Resolved",
      desc: complaint.status === "CLOSED" && !isOps
        ? `Ticket marked as closed by Customer (${complaint.resolved_by || "User"}). Reason: "${complaint.complaint2 || "No reason provided"}"`
        : `Ticket marked as resolved in operations database${complaint.resolved_by ? ` by ${complaint.resolved_by}` : ""}.`,
      time: formatTime(complaint.closing_time_stamp, "Closed"),
      tag: isOps ? "Operator" : "Customer"
    });
  }

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-7xl w-full mx-auto font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-plum uppercase">
        <Link href="/client/complaints" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft size={12} /> Complaints
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{complaint.ticket_number || id.substring(0, 8)}</span>
      </div>

      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border-beige pb-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-plum uppercase block">CMP ID: {id}</span>
          <h1 className="text-2xl font-serif font-bold capitalize">{complaint.complaint1}</h1>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {complaint.status === "OPEN" && (
            <button
              onClick={() => updateStatus("IN_PROGRESS")}
              className="px-4 py-2 border border-border-beige hover:bg-card-bg text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer"
            >
              Process Ticket
            </button>
          )}
          {complaint.status !== "ESCALATED" && complaint.status !== "RESOLVED" && complaint.status !== "CLOSED" && (
            <button
              onClick={() => updateStatus("ESCALATED")}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert size={12} /> Escalate
            </button>
          )}
          {complaint.status !== "RESOLVED" && complaint.status !== "CLOSED" && (
            <button
              onClick={() => {
                setIsResolveModalOpen(true);
                setConfirmInput("");
              }}
              className="px-4 py-2 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle size={12} /> Resolve complaint
            </button>
          )}
        </div>
      </div>

      {/* Detailed Triage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Customer details & statement */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Customer profile card */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige flex items-center justify-between gap-4">
              <h2 className="text-base font-serif font-semibold">Customer Account</h2>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${
                complexity === "CRITICAL" || complexity === "HIGH" ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-100 text-gray-700 border-gray-200"
              }`}>
                {complexity} ESCALATION RISK
              </span>
            </div>
            
            <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border-beige border-b border-border-beige text-xs">
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Customer Name</span>
                <p className="font-medium text-foreground">{complaint.customer_name || "Valued Customer"}</p>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Account Identifier</span>
                <p className="font-medium font-mono text-accent">{complaint.user_id || "Anonymous Client"}</p>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Contact Phone</span>
                <p className="font-medium">{complaint.customer_phone || complaint.complaint_address?.phone || "Not Provided"}</p>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Region Location</span>
                <p className="font-medium">{complaint.complaint_address?.city || "Tamil Nadu, India"}</p>
              </div>
            </dl>
          </div>

          {/* Ticket Statement Description */}
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-plum">Complaint Statement</h2>
            <div className="p-4 bg-background border-l-2 border-border-beige rounded text-sm text-plum font-serif leading-relaxed capitalize">
              {complaint.complaint1}
            </div>
            {complaint.complaint2 && (
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-plum uppercase block">Follow-up Symptoms reported</span>
                <div className="p-4 bg-background border-l-2 border-border-beige rounded text-sm text-plum font-serif leading-relaxed capitalize">
                  {complaint.complaint2}
                </div>
              </div>
            )}
          </div>

          {/* AI Recommended Resolution Card */}
          {complaint.response && (
            <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-4 animate-fade-in">
              <h2 className="text-sm font-mono uppercase tracking-wider text-plum flex items-center gap-1.5 font-bold">
                ✨ AI Suggested Resolution
              </h2>
              <div className="p-4 bg-[#F5EFEB] border-l-2 border-purple-500 rounded text-sm text-plum font-serif leading-relaxed">
                {complaint.response}
              </div>
              {complaint.ai_analysis?.solution_high && (
                <div className="space-y-2 border-t border-border-beige pt-4">
                  <span className="text-[10px] font-mono text-plum uppercase block">Escalated Action Plan</span>
                  <div className="p-4 bg-red-50/50 border-l-2 border-red-500 rounded text-sm text-plum font-serif leading-relaxed">
                    {complaint.ai_analysis.solution_high}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Event Triage Feed */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige">
              <h2 className="text-base font-serif font-semibold">Triage Feed</h2>
            </div>
            <div className="p-6 space-y-6 relative before:absolute before:left-[27px] before:top-6 before:bottom-6 before:w-px before:bg-border-beige">
              {events.map((e, idx) => (
                <div key={idx} className="relative pl-10 flex items-start gap-3 text-sm">
                  <span className={`absolute left-[3px] top-1.5 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${
                    e.tag === "System"
                      ? "bg-purple-100 text-accent border border-purple-200"
                      : e.tag === "Operator"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-[#F5EFEB] border border-border-beige text-accent"
                  }`}>
                    {e.tag.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-baseline gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{e.title}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 rounded bg-[#F5EFEB] text-plum">
                          {e.tag}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-plum/70">{e.time}</span>
                    </div>
                    <p className="text-plum leading-relaxed text-xs capitalize">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Intel */}
        <div className="space-y-6">
          
          {/* Triage Intel summary */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige">
              <h2 className="text-base font-serif font-semibold">Triage Intel</h2>
            </div>
            
            <div className="grid grid-cols-2 divide-x divide-border-beige border-b border-border-beige text-center">
              <div className="p-5 space-y-1">
                <span className="text-3xl font-serif font-bold text-red-600">
                  {complaint.ai_analysis?.negativity_score ? `${(complaint.ai_analysis.negativity_score * 100).toFixed(0)}%` : "N/A"}
                </span>
                <span className="text-[10px] font-mono text-plum uppercase block">Escalation Risk</span>
              </div>
              <div className="p-5 space-y-1">
                <span className="text-3xl font-serif font-bold text-green-600">
                  {complaint.ai_analysis?.confidence_score ? `${(complaint.ai_analysis.confidence_score * 100).toFixed(0)}%` : "N/A"}
                </span>
                <span className="text-[10px] font-mono text-plum uppercase block">Confidence</span>
              </div>
            </div>

            <dl className="p-5 space-y-3 text-xs divide-y divide-border-beige">
              <div className="pb-3 flex justify-between">
                <span className="font-mono text-plum uppercase">Detected Category</span>
                <span className="font-semibold text-foreground capitalize">{complaint.category || "General"}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="font-mono text-plum uppercase">Sentiment analysis</span>
                <span className={`font-semibold uppercase ${
                  complaint.ai_analysis?.risk_level === "CRITICAL" || complaint.ai_analysis?.risk_level === "HIGH" ? "text-red-600" : "text-amber-600"
                }`}>
                  {complaint.ai_analysis?.risk_level || "NEUTRAL"}
                </span>
              </div>
              <div className="py-3 flex justify-between font-mono text-[10px]">
                <span className="text-plum uppercase">SLA Target</span>
                <span className="font-semibold text-foreground uppercase">{complexity === "CRITICAL" ? "2 Hours" : complexity === "HIGH" ? "4 Hours" : "8 Hours"}</span>
              </div>
              {(complaint.status === "RESOLVED" || complaint.status === "CLOSED") && complaint.resolved_by && (
                <div className="py-3 flex justify-between font-mono text-[10px] border-t border-border-beige pt-3">
                  <span className="text-plum uppercase">Resolved By</span>
                  <span className="font-semibold text-foreground font-mono">{complaint.resolved_by.replace("CUST-", "OPS-")}</span>
                </div>
              )}
            </dl>
          </div>

          {/* AI diagnosis & root cause */}
          <div className="bg-[#1E0A2D] text-white border border-[#2F1442] rounded shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-accent">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider">Triage Diagnosis</span>
            </div>
            {complaint.ai_analysis?.diagnosis ? (
              <div className="space-y-3">
                <p className="text-xs text-[#C4D4DC] leading-relaxed font-serif">
                  <b>Diagnosis:</b> {complaint.ai_analysis.diagnosis}
                </p>
                {complaint.ai_analysis.root_cause && (
                  <p className="text-xs text-[#C4D4DC] leading-relaxed border-t border-[#2F1442] pt-2 font-serif">
                    <b>Root Cause:</b> {complaint.ai_analysis.root_cause}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#C4D4DC] leading-relaxed">
                Triage Diagnosis data is not available. Please verify connection to the AI service.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Resolution Confirmation Modal */}
      {isResolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-background border border-border-beige p-6 rounded shadow-2xl space-y-4">
            <div className="border-b border-border-beige pb-3">
              <h2 className="text-lg font-serif font-semibold text-foreground">Confirm Complaint Resolution</h2>
              <p className="text-xs text-plum mt-1">
                To confirm, please type your staff ID <strong className="text-foreground font-mono select-none">&quot;{targetMatch}&quot;</strong> in the box below:
              </p>
            </div>

            <div className="space-y-1">
              <input
                type="text"
                required
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={targetMatch}
                className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setIsResolveModalOpen(false);
                  setConfirmInput("");
                }}
                className="px-4 py-2 border border-border-beige hover:bg-[#F5EFEB] text-plum text-xs font-semibold rounded cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                disabled={confirmInput !== targetMatch}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm & Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
