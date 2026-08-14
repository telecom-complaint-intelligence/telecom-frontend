"use client";

import React, { useState } from "react";
import { Bell, AlertOctagon, RefreshCw, Layers } from "lucide-react";

interface AlertLog {
  id: string;
  title: string;
  category: "SLA" | "System" | "Triage";
  message: string;
  time: string;
}

export default function ClientNotificationsPage() {
  const [logs, setLogs] = useState<AlertLog[]>([
    { id: "1", title: "SLA breached for CMP-1031", category: "SLA", message: "Urgent billing dispute has been unassigned for 14 hours.", time: "10 mins ago" },
    { id: "2", title: "Outage detected at tower MDU-04", category: "System", message: "Madurai cell tower MDU-04 reporting 41 linked complaints.", time: "1 hour ago" },
    { id: "3", title: "Operator workload overload", category: "System", message: "Vinoth K. is currently managing 19 tickets (limit is 15).", time: "2 hours ago" },
    { id: "4", title: "Triage classification confidence warning", category: "Triage", message: "CMP-1044 categorized as Network with 64% confidence.", time: "4 hours ago" },
  ]);

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto">
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
          <Bell size={28} className="text-accent" />
          Console Alerts
        </h1>
        <p className="text-sm text-plum">Real-time system alarms, SLA deadlines, and routing reports.</p>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`p-6 bg-card-bg border rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm ${
              log.category === "SLA" ? "border-red-200 bg-red-50/10" : "border-border-beige"
            }`}
          >
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                    log.category === "SLA"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : log.category === "System"
                      ? "bg-slate-100 text-slate-700 border border-slate-200"
                      : "bg-purple-100 text-accent border border-purple-200"
                  }`}
                >
                  {log.category.toUpperCase()}
                </span>
                <span className="text-xs text-plum font-mono">{log.time}</span>
              </div>
              <h3 className="text-base font-serif font-medium text-foreground">{log.title}</h3>
              <p className="text-xs text-plum leading-relaxed">{log.message}</p>
            </div>

            <button className="text-xs font-mono text-accent hover:underline shrink-0">
              Acknowledge →
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
