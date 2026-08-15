"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Activity, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface RaisedComplaint {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<RaisedComplaint[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("telu_raised_complaints");
    if (stored) {
      setTimeout(() => setComplaints(JSON.parse(stored)), 0);
    }
  }, []);

  // Compute status metrics dynamically
  const openCount = complaints.filter(c => c.status === "OPEN").length;
  const pendingCount = complaints.filter(c => c.status === "PENDING").length;
  const resolvedCount = complaints.filter(c => c.status === "RESOLVED").length;
  const totalCount = complaints.length;

  const openPct = totalCount > 0 ? (openCount / totalCount) * 100 : 0;
  const pendingPct = totalCount > 0 ? (pendingCount / totalCount) * 100 : 0;
  const resolvedPct = totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0;

  const recentComplaints = complaints.slice(-3).reverse();

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-5xl w-full mx-auto">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif tracking-tight font-medium">
            Hello, {user?.name || "-"}
          </h1>
          <p className="text-sm text-plum">
            {totalCount > 0 
              ? `You have ${totalCount} active tickets registered in your dashboard tracker.`
              : "Welcome to your telecom triage workspace."}
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
            <p className="text-xs text-plum/70 mt-0.5">Where all your complaints stand today</p>
          </div>
          <span className="text-xs font-serif italic text-plum">Total Tickets: {totalCount}</span>
        </div>
        <div className="space-y-3">
          <div className="w-full h-2.5 rounded bg-border-beige flex overflow-hidden">
            {totalCount > 0 ? (
              <>
                <div className="h-full bg-red-500 transition-all" style={{ width: `${openPct}%` }} title={`${openCount} Open`}></div>
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${pendingPct}%` }} title={`${pendingCount} Pending`}></div>
                <div className="h-full bg-accent transition-all" style={{ width: `${resolvedPct}%` }} title={`${resolvedCount} Resolved`}></div>
              </>
            ) : (
              <div className="h-full w-full bg-border-beige"></div>
            )}
          </div>
          <div className="flex items-center gap-6 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-red-600 font-semibold">
              <Activity size={12} className="text-red-500" /> {openCount} OPEN
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <Clock size={12} className="text-amber-500" /> {pendingCount} PENDING
            </span>
            <span className="flex items-center gap-1.5 text-accent font-semibold">
              <CheckCircle size={12} className="text-accent" /> {resolvedCount} RESOLVED
            </span>
          </div>
        </div>
      </div>

      {/* Recent complaints table */}
      <div className="bg-card-bg border border-border-beige rounded shadow-sm">
        <div className="px-6 py-5 border-b border-border-beige flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-semibold">Recent complaints</h2>
            <p className="text-xs text-plum">Your most recent tickets</p>
          </div>
          {totalCount > 0 && (
            <Link href="/customer/my-complaints" className="text-xs font-mono text-accent hover:underline cursor-pointer">
              View all {totalCount} →
            </Link>
          )}
        </div>

        <div className="divide-y divide-border-beige">
          {recentComplaints.length > 0 ? (
            recentComplaints.map(complaint => (
              <Link 
                key={complaint.id} 
                href={`/customer/my-complaints/${complaint.id}`} 
                className="block p-6 flex items-start justify-between gap-4 hover:bg-background/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono text-plum">{complaint.id}</span>
                    <span className="text-xs font-mono font-medium text-accent">{complaint.category.toUpperCase()}</span>
                    <span className="text-xs font-mono text-plum flex items-center gap-1">
                      <Clock size={12} className="text-amber-500" /> {complaint.severity.toUpperCase()} &middot; RAISED {complaint.createdAt}
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-medium">{complaint.title}</h3>
                </div>
                <span className={`text-xs font-mono font-medium px-3 py-1 rounded border ${
                  complaint.status === "OPEN" 
                    ? "bg-red-50 text-red-700 border-red-200" 
                    : complaint.status === "PENDING"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-purple-50 text-accent border-purple-200"
                }`}>
                  {complaint.status}
                </span>
              </Link>
            ))
          ) : (
            <div className="p-12 text-center text-plum font-serif italic text-sm">
              No complaints raised yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
