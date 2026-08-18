"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Activity, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface RaisedComplaint {
  id: string;
  ticket_number: string;
  complaint1: string;
  category: string;
  status: string;
  created_at: string;
  priority_scores?: {
    complexity: string;
  } | null;
}

export default function CustomerDashboard() {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState<RaisedComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:8000/api/v1/complaints/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load complaints");
        return res.json();
      })
      .then(data => {
        setComplaints(data);
      })
      .catch(err => {
        console.error("Error loading dashboard complaints:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // Compute status metrics dynamically
  const openCount = complaints.filter(c => c.status === "OPEN" || c.status === "IN_PROGRESS" || c.status === "ESCALATED").length;
  const closedCount = complaints.filter(c => c.status === "CLOSED" || c.status === "RESOLVED").length;
  const totalCount = complaints.length;

  const openPct = totalCount > 0 ? (openCount / totalCount) * 100 : 0;
  const closedPct = totalCount > 0 ? (closedCount / totalCount) * 100 : 0;

  const recentComplaints = complaints.slice(0, 3);

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
                <div className="h-full bg-red-500 transition-all" style={{ width: `${openPct}%` }} title={`${openCount} Active`}></div>
                <div className="h-full bg-accent transition-all" style={{ width: `${closedPct}%` }} title={`${closedCount} Resolved`}></div>
              </>
            ) : (
              <div className="h-full w-full bg-border-beige"></div>
            )}
          </div>
          <div className="flex items-center gap-6 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-red-600 font-semibold">
              <Activity size={12} className="text-red-500" /> {openCount} ACTIVE
            </span>
            <span className="flex items-center gap-1.5 text-accent font-semibold">
              <CheckCircle size={12} className="text-accent" /> {closedCount} RESOLVED / CLOSED
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
          {loading ? (
            <div className="p-12 text-center text-plum text-xs">
              Loading recent complaints...
            </div>
          ) : recentComplaints.length > 0 ? (
            recentComplaints.map(complaint => {
              const complexity = complaint.priority_scores?.complexity || "LOW";
              const dateStr = complaint.created_at 
                ? new Date(complaint.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })
                : "Recent";

              return (
                <Link 
                  key={complaint.id} 
                  href={`/customer/my-complaints/${complaint.id}`} 
                  className="block p-6 flex items-start justify-between gap-4 hover:bg-background/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono text-plum">{complaint.ticket_number || complaint.id.substring(0, 8)}</span>
                      <span className="text-xs font-mono font-medium text-accent uppercase">{complaint.category || "General"}</span>
                      <span className="text-xs font-mono text-plum flex items-center gap-1">
                        <Clock size={12} className="text-amber-500 mr-1" /> {complexity.toUpperCase()} &middot; {dateStr}
                      </span>
                    </div>
                    <h3 className="text-base font-serif font-medium capitalize">{complaint.complaint1}</h3>
                  </div>
                  <span className={`text-xs font-mono font-medium px-3 py-1 rounded border ${
                    complaint.status === "OPEN" 
                      ? "bg-red-50 text-red-700 border-red-200" 
                      : complaint.status === "IN_PROGRESS"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}>
                    {complaint.status}
                  </span>
                </Link>
              );
            })
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
