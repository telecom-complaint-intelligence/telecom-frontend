"use client";

import React, { useState, useEffect } from "react";
import { AlertOctagon, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

interface HighRiskTicket {
  id: string;
  ticket_number: string;
  complaint1: string;
  status: string;
  complexity: string;
  negativity_score: number;
  trigger: string;
}

export default function HighRiskPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<HighRiskTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [kpiHighRisk, setKpiHighRisk] = useState(0);
  const [kpiMedRisk, setKpiMedRisk] = useState(0);
  const [kpiEscalated, setKpiEscalated] = useState(0);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8000/api/v1/complaints", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load complaints");
        return res.json();
      })
      .then(data => {
        // Filter and map high risk tickets
        const allTickets = data as Array<{
          id: string;
          ticket_number: string;
          complaint1: string;
          status: string;
          priority_scores?: { complexity: string } | null;
          ai_analysis?: { negativity_score: number } | null;
        }>;

        const mapped: HighRiskTicket[] = allTickets
          .map(t => {
            const complexity = t.priority_scores?.complexity || "LOW";
            const negativity = t.ai_analysis?.negativity_score ?? 0.0;
            
            // Determine primary risk trigger
            let trigger = "General Review";
            if (t.status === "ESCALATED") {
              trigger = "Customer Feedback Escalation";
            } else if (complexity === "CRITICAL" || complexity === "HIGH") {
              trigger = "Critical/High Priority Triage";
            } else if (negativity > 0.7) {
              trigger = "Highly Negative Customer Sentiment";
            }

            return {
              id: t.id,
              ticket_number: t.ticket_number,
              complaint1: t.complaint1,
              status: t.status,
              complexity: complexity,
              negativity_score: negativity,
              trigger: trigger
            };
          })
          // Display only active tickets strictly with HIGH or CRITICAL severity
          .filter(t => 
            t.status !== "CLOSED" && 
            t.status !== "RESOLVED" && 
            (t.complexity === "CRITICAL" || t.complexity === "HIGH")
          );

        setTickets(mapped);

        // Count metrics
        setKpiHighRisk(mapped.filter(t => t.negativity_score >= 0.8).length);
        setKpiMedRisk(mapped.filter(t => t.negativity_score >= 0.7 && t.negativity_score < 0.8).length);
        setKpiEscalated(mapped.filter(t => t.status === "ESCALATED").length);
      })
      .catch(err => {
        console.error("High risk page load error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto font-sans">
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
          <AlertOctagon size={28} className="text-accent" />
          High Risk Queue
        </h1>
        <p className="text-sm text-plum">System-flagged accounts with high escalation probability or potential churn triggers.</p>
      </div>

      {/* KPI metric section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm animate-fade-in">
          <p className="text-xs font-mono uppercase text-plum">Risk &gt; 80%</p>
          <p className="text-3xl font-serif font-semibold text-foreground">
            {loading ? "..." : kpiHighRisk}
          </p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm animate-fade-in">
          <p className="text-xs font-mono uppercase text-plum">Risk 70-79%</p>
          <p className="text-3xl font-serif font-semibold text-foreground">
            {loading ? "..." : kpiMedRisk}
          </p>
        </div>
        <div className="p-4 bg-[#F5EFEB] border border-border-beige rounded space-y-1 shadow-sm animate-fade-in">
          <p className="text-xs font-mono uppercase text-accent flex items-center gap-1">
            <TrendingUp size={12} /> Auto-Escalated
          </p>
          <p className="text-3xl font-serif font-semibold text-accent">
            {loading ? "..." : kpiEscalated}
          </p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm animate-fade-in">
          <p className="text-xs font-mono uppercase text-plum">Mean Response</p>
          <p className="text-3xl font-serif font-semibold text-foreground">-</p>
        </div>
      </div>

      {/* Risk Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-semibold">Triage Alerts</h2>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-plum text-sm animate-pulse">
              Loading high risk alerts...
            </div>
          ) : tickets.length > 0 ? (
            tickets.map(t => {
              const riskPct = Math.round(t.negativity_score * 100);
              return (
                <Link
                  key={t.id}
                  href={`/client/complaints/${t.id}`}
                  className="p-6 bg-card-bg border border-border-beige rounded flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-sm hover:border-plum transition-all block cursor-pointer text-current hover:no-underline"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-center shrink-0">
                      <span className="text-2xl font-serif font-bold text-accent">{riskPct}%</span>
                      <span className="text-[10px] font-mono text-plum block uppercase mt-0.5">Negativity</span>
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-mono font-bold text-accent">
                          {t.ticket_number || t.id.substring(0, 8)}
                        </span>
                        <span className="text-xs text-plum font-mono uppercase font-bold bg-gray-100 px-2 py-0.5 rounded">
                          {t.complexity}
                        </span>
                      </div>
                      <h3 className="text-base font-serif font-medium text-foreground capitalize">{t.complaint1}</h3>
                      <p className="text-xs text-red-600 font-mono flex items-center gap-1 font-semibold">
                        <AlertTriangle size={12} className="text-red-500" /> Trigger: {t.trigger}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-border-beige pt-3 lg:pt-0">
                    <span className="text-xs font-mono text-plum font-bold">{t.status}</span>
                    <span
                      className="px-3.5 py-1.5 bg-[#1E0A2D] text-white text-xs font-medium rounded hover:bg-[#2F1442] transition-colors cursor-pointer"
                    >
                      Take Action
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-12 text-center bg-card-bg border border-border-beige rounded shadow-sm text-plum font-serif text-sm flex flex-col items-center justify-center gap-2 animate-fade-in">
              <AlertOctagon className="h-6 w-6 text-plum/60" />
              <span>No high risk triage alerts currently active.</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
