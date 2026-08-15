"use client";

import React, { useState } from "react";
import { Bell } from "lucide-react";

interface AlertLog {
  id: string;
  title: string;
  category: "SLA" | "System" | "Triage";
  message: string;
  time: string;
}

export default function ClientNotificationsPage() {
  const [logs] = useState<AlertLog[]>([]);

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto font-sans">
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
          <Bell size={28} className="text-accent" />
          Console Alerts
        </h1>
        <p className="text-sm text-plum">Real-time system alarms, SLA deadlines, and routing reports.</p>
      </div>

      <div className="space-y-4">
        {logs.length > 0 ? (
          logs.map((log) => (
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
          ))
        ) : (
          <div className="p-12 text-center bg-card-bg border border-border-beige rounded shadow-sm text-plum font-serif text-sm flex flex-col items-center justify-center gap-2 animate-fade-in">
            <Bell size={24} className="text-plum/60" />
            <span>No alerts or system notifications active at this time.</span>
          </div>
        )}
      </div>
    </main>
  );
}
