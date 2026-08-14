"use client";

import React from "react";
import Link from "next/link";
import { Plus, Activity, Clock, CheckCircle } from "lucide-react";

export default function CustomerDashboard() {
  return (
    <main className="p-6 md:p-12 space-y-8 max-w-5xl w-full mx-auto">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif tracking-tight font-medium">
            Hello, Arjun
          </h1>
          <p className="text-sm text-plum">
            Two of your complaints moved this week. The broadband one is with a field engineer now.
          </p>
        </div>
        <Link
          href="/customer/raise-complaint"
          className="px-4 py-2.5 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-sm font-medium rounded flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus size={16} /> Raise complaint
        </Link>
      </div>

      {/* Status Overview Card */}
      <div className="bg-card-bg border border-border-beige p-6 rounded space-y-4 shadow-sm">
        <div className="flex justify-between items-baseline">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-wider text-plum">Status overview</h2>
            <p className="text-xs text-plum/70 mt-0.5">Where all 12 complaints stand today</p>
          </div>
          <span className="text-xs font-serif italic text-plum">Broadband: 6 of 12 tickets</span>
        </div>
        <div className="space-y-3">
          <div className="w-full h-2.5 rounded bg-border-beige flex overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: "25%" }} title="3 Open"></div>
            <div className="h-full bg-amber-500" style={{ width: "17%" }} title="2 Pending"></div>
            <div className="h-full bg-accent" style={{ width: "58%" }} title="7 Resolved"></div>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-red-600 font-semibold">
              <Activity size={12} className="text-red-500" /> 3 OPEN
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <Clock size={12} className="text-amber-500" /> 2 PENDING
            </span>
            <span className="flex items-center gap-1.5 text-accent font-semibold">
              <CheckCircle size={12} className="text-accent" /> 7 RESOLVED
            </span>
          </div>
        </div>
      </div>

      {/* Recent complaints table (Full Width) */}
      <div className="bg-card-bg border border-border-beige rounded shadow-sm">
        <div className="px-6 py-5 border-b border-border-beige flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-semibold">Recent complaints</h2>
            <p className="text-xs text-plum">Your three most recent tickets</p>
          </div>
          <Link href="/customer/my-complaints" className="text-xs font-mono text-accent hover:underline cursor-pointer">
            View all 12 →
          </Link>
        </div>

        <div className="divide-y divide-border-beige">
          {/* Item 1 */}
          <Link href="/customer/my-complaints/CMP1025" className="block p-6 flex items-start justify-between gap-4 hover:bg-background/40 transition-colors">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono text-plum">CMP1025</span>
                <span className="text-xs font-mono font-medium text-accent">BROADBAND</span>
                <span className="text-xs font-mono text-plum flex items-center gap-1">
                  <Clock size={12} className="text-amber-500" /> HIGH &middot; RAISED 09 AUG
                </span>
              </div>
              <h3 className="text-base font-serif font-medium">Slow internet connection</h3>
            </div>
            <span className="text-xs font-mono font-medium px-3 py-1 rounded bg-red-50 text-red-700 border border-red-200">
              OPEN
            </span>
          </Link>

          {/* Item 2 */}
          <Link href="/customer/my-complaints/CMP1024" className="block p-6 flex items-start justify-between gap-4 hover:bg-background/40 transition-colors">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono text-plum">CMP1024</span>
                <span className="text-xs font-mono font-medium text-accent">NETWORK</span>
                <span className="text-xs font-mono text-plum flex items-center gap-1">
                  <Activity size={12} className="text-purple-500" /> MEDIUM &middot; RAISED 06 AUG
                </span>
              </div>
              <h3 className="text-base font-serif font-medium">Frequent call drops</h3>
            </div>
            <span className="text-xs font-mono font-medium px-3 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
              PENDING
            </span>
          </Link>

          {/* Item 3 */}
          <Link href="/customer/my-complaints/CMP1019" className="block p-6 flex items-start justify-between gap-4 hover:bg-background/40 transition-colors">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono text-plum">CMP1019</span>
                <span className="text-xs font-mono font-medium text-accent">BILLING</span>
                <span className="text-xs font-mono text-plum flex items-center gap-1">
                  <CheckCircle size={12} className="text-slate-400" /> LOW &middot; RAISED 28 JUL
                </span>
              </div>
              <h3 className="text-base font-serif font-medium">Billing issue</h3>
            </div>
            <span className="text-xs font-mono font-medium px-3 py-1 rounded bg-purple-50 text-accent border border-purple-200">
              RESOLVED
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
