"use client";

import React, { useState } from "react";
import { Search, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Complaint {
  id: string;
  customer: string;
  description: string;
  category: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  time: string;
}

export default function ClientComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const updateStatus = (id: string, nextStatus: "In Progress" | "Resolved") => {
    setComplaints(prev =>
      prev.map(c => (c.id === id ? { ...c, status: nextStatus } : c))
    );
  };

  const filtered = complaints.filter(c =>
    c.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto font-sans">
      <div className="border-b border-border-beige pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-normal">Complaints Triage</h1>
          <p className="text-sm text-plum">Review incoming tickets, escalate high-risk cases, and assign resolutions.</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex bg-card-bg p-4 border border-border-beige rounded shadow-sm justify-between items-center gap-4 animate-fade-in">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-3 text-plum" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div className="text-xs font-mono text-plum">{filtered.length} active tickets found</div>
      </div>

      {/* Queue list */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(c => (
            <div
              key={c.id}
              className={`p-6 bg-card-bg border rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm transition-all ${
                c.priority === "Urgent" && c.status !== "Resolved"
                  ? "border-red-200 bg-red-50/10"
                  : "border-border-beige hover:border-plum"
              }`}
            >
              <Link href={`/client/complaints/${c.id}`} className="space-y-2 flex-1 min-w-0 hover:opacity-90 block">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono font-bold text-accent">{c.id}</span>
                  <span className="text-xs text-plum font-mono">Received {c.time}</span>
                </div>
                <h3 className="text-base font-serif font-medium text-foreground">{c.description}</h3>
                <p className="text-xs text-plum">Customer: <span className="font-semibold text-foreground">{c.customer}</span></p>
              </Link>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border-beige pt-3 md:pt-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                      c.status === "Resolved"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-purple-100 text-accent"
                    }`}
                  >
                    {c.status.toUpperCase()}
                  </span>
                </div>

                {c.status !== "Resolved" && (
                  <div className="flex gap-2">
                    {c.status === "Open" && (
                      <button
                        onClick={() => updateStatus(c.id, "In Progress")}
                        className="px-3 py-1.5 bg-[#1E0A2D] text-white text-xs font-medium rounded hover:bg-[#2F1442] transition-colors cursor-pointer"
                      >
                        Process
                      </button>
                    )}
                    <button
                      onClick={() => updateStatus(c.id, "Resolved")}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={12} />
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-card-bg border border-border-beige rounded shadow-sm text-plum font-serif text-sm flex flex-col items-center justify-center gap-2 animate-fade-in">
            <AlertCircle className="h-6 w-6 text-plum/60" />
            <span>No active tickets found.</span>
          </div>
        )}
      </div>
    </main>
  );
}
