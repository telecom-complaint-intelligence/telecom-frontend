"use client";

import React from "react";
import { BarChart3, TrendingUp, Compass, Users } from "lucide-react";

export default function AnalyticsPage() {
  const categories = [
    { name: "Broadband", count: 412, pct: 33, avg: "7.1h" },
    { name: "Network", count: 338, pct: 27, avg: "5.8h" },
    { name: "Billing", count: 249, pct: 20, avg: "9.4h" },
    { name: "SIM / Mobile", count: 149, pct: 12, avg: "3.2h" },
    { name: "Service Requests", count: 100, pct: 8, avg: "2.0d" },
  ];

  const regions = [
    { name: "Madurai", count: 431, pct: 34, status: "Active Hotspot" },
    { name: "Chennai", count: 356, pct: 28, status: "Stable" },
    { name: "Coimbatore", count: 218, pct: 18, status: "Stable" },
    { name: "Trichy", count: 147, pct: 12, status: "Stable" },
  ];

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto">
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
          <BarChart3 size={28} className="text-accent" />
          System Analytics
        </h1>
        <p className="text-sm text-plum">Comprehensive performance metrics, category distributions, and regional hotspots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left span 2: Category Mix & Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg border border-border-beige rounded shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-serif font-semibold">Complaints by Category</h2>
            <div className="space-y-4">
              {categories.map((c, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{c.name}</span>
                    <span className="font-mono text-plum">{c.count} complaints ({c.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded bg-border-beige overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${c.pct}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-plum/70">
                    <span>Average Resolution: {c.avg}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Hotspots */}
        <div className="space-y-6">
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-6">
            <h2 className="text-lg font-serif font-semibold flex items-center gap-2">
              <Compass size={18} className="text-accent" />
              Regional Hotspots
            </h2>
            <div className="divide-y divide-border-beige text-xs">
              {regions.map((r, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm text-foreground">{r.name}</p>
                    <p className="font-mono text-plum mt-0.5">{r.count} complaints ({r.pct}%)</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-medium ${
                      r.status === "Active Hotspot"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {r.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F5EFEB] border border-border-beige p-6 rounded space-y-4 text-xs">
            <h3 className="text-sm font-serif font-semibold text-accent flex items-center gap-1.5">
              <TrendingUp size={16} /> Resolution Efficiency
            </h3>
            <p className="text-plum leading-relaxed">
              Average response time across all shifts is currently <span className="font-semibold text-foreground">6.4 hours</span>. Broadband and Billing support teams represent 74% of unresolved queues over 24 hours.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
