"use client";

import React, { useState } from "react";
import { AlertOctagon, TrendingUp, AlertTriangle } from "lucide-react";

interface HighRiskTicket {
  id: string;
  customer: string;
  issue: string;
  risk: number;
  priority: "Urgent" | "High";
  trigger: string;
  status: string;
}

export default function HighRiskPage() {
  const initialTickets: HighRiskTicket[] = [
    { id: "CMP-1031", customer: "Meena K.", issue: "Double charge disputation on statement", risk: 91, priority: "Urgent", trigger: "3rd Billing dispute in 60 days", status: "Open" },
    { id: "CMP-1029", customer: "Suresh V.", issue: "Tower signal drops persistently in Madurai", risk: 86, priority: "Urgent", trigger: "Outage detected on cell cell tower MDU-04", status: "Open" },
    { id: "CMP-1027", customer: "Lakshmi N.", issue: "Technician appointment missed twice", risk: 82, priority: "High", trigger: "Repeated dispatch failures", status: "Pending" },
    { id: "CMP-1025", customer: "Arjun Raman", issue: "Slow internet connection in Anna Nagar", risk: 78, priority: "High", trigger: "Customer reported work impact", status: "In Progress" },
  ];

  const [tickets, setTickets] = useState<HighRiskTicket[]>(
    [...initialTickets].sort((a, b) => b.risk - a.risk)
  );

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto">
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
          <AlertOctagon size={28} className="text-accent" />
          High Risk Queue
        </h1>
        <p className="text-sm text-plum">System-flagged accounts with high escalation probability or potential churn triggers.</p>
      </div>

      {/* KPI metric section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm">
          <p className="text-xs font-mono uppercase text-plum">Risk &gt; 80%</p>
          <p className="text-3xl font-serif font-semibold text-foreground">3</p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm">
          <p className="text-xs font-mono uppercase text-plum">Risk 70-79%</p>
          <p className="text-3xl font-serif font-semibold text-foreground">1</p>
        </div>
        <div className="p-4 bg-[#F5EFEB] border border-border-beige rounded space-y-1 shadow-sm">
          <p className="text-xs font-mono uppercase text-accent flex items-center gap-1">
            <TrendingUp size={12} /> Auto-Escalated
          </p>
          <p className="text-3xl font-serif font-semibold text-accent">4</p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm">
          <p className="text-xs font-mono uppercase text-plum">Mean Response</p>
          <p className="text-3xl font-serif font-semibold text-foreground">1.8h</p>
        </div>
      </div>

      {/* Risk Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-semibold">Triage Alerts</h2>
        <div className="space-y-3">
          {tickets.map(t => (
            <div
              key={t.id}
              className="p-6 bg-card-bg border border-border-beige rounded flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-sm hover:border-plum transition-all"
            >
              <div className="flex items-center gap-6">
                <div className="text-center shrink-0">
                  <span className="text-2xl font-serif font-bold text-accent">{t.risk}%</span>
                  <span className="text-[10px] font-mono text-plum block uppercase mt-0.5">Escalation</span>
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-bold text-accent">{t.id}</span>
                    <span className="text-xs text-plum font-semibold">{t.customer}</span>
                  </div>
                  <h3 className="text-base font-serif font-medium text-foreground">{t.issue}</h3>
                  <p className="text-xs text-red-600 font-mono flex items-center gap-1">
                    <AlertTriangle size={12} /> Trigger: {t.trigger}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-border-beige pt-3 lg:pt-0">
                <span className="text-xs font-mono text-plum">{t.status.toUpperCase()}</span>
                <button className="px-3.5 py-1.5 bg-[#1E0A2D] text-white text-xs font-medium rounded hover:bg-[#2F1442] transition-colors cursor-pointer">
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
