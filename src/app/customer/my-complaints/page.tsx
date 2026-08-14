"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Clock, Activity, CheckCircle, HelpCircle } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  category: string;
  date: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "Open" | "Pending" | "In Progress" | "Resolved" | "Closed";
  description: string;
}

export default function MyComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const complaints: Complaint[] = [
    { id: "CMP1025", title: "Slow internet connection", category: "BROADBAND", date: "Aug 11, 2026", priority: "High", status: "Open", description: "Speeds drop below 10Mbps every evening." },
    { id: "CMP1024", title: "Frequent call drops", category: "NETWORK", date: "Aug 10, 2026", priority: "Medium", status: "Pending", description: "Dropped calls occurring inside Anna Nagar office." },
    { id: "CMP1019", title: "Double billing error on invoice", category: "BILLING", date: "Jul 28, 2026", priority: "Low", status: "Resolved", description: "Charged twice on credit card statement." },
    { id: "CMP1012", title: "SIM Card upgrade activation issue", category: "SIM", date: "Jul 15, 2026", priority: "High", status: "Closed", description: "Upgraded 5G card not receiving signal." },
  ];

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-5xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-beige pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-normal">My complaints</h1>
          <p className="text-sm text-plum">Track resolution history and active ticket statuses.</p>
        </div>
        <Link
          href="/customer/raise-complaint"
          className="px-4 py-2.5 bg-accent text-white text-sm font-medium rounded hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
        >
          ＋ Raise complaint
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card-bg p-4 border border-border-beige rounded shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-3.5 text-plum" />
          <input
            type="text"
            placeholder="Search by ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {["All", "Open", "Pending", "In Progress", "Resolved", "Closed"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-[#1E0A2D] text-white"
                  : "bg-background border border-border-beige text-plum hover:text-foreground"
              }`}
            >
              {status.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-border-beige rounded bg-card-bg">
            <p className="text-sm text-plum font-serif">No complaints found matching selection.</p>
          </div>
        ) : (
          filtered.map((complaint) => (
            <Link
              key={complaint.id}
              href={`/customer/my-complaints/${complaint.id}`}
              className="block p-6 bg-card-bg border border-border-beige rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-plum transition-all shadow-sm cursor-pointer"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono text-plum bg-[#F5EFEB] px-2 py-0.5 rounded">
                    {complaint.id}
                  </span>
                  <span className="text-xs font-mono font-semibold text-accent">
                    {complaint.category}
                  </span>
                  <span className="text-xs text-plum font-mono">
                    Filed {complaint.date}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-medium">{complaint.title}</h3>
                <p className="text-xs text-plum leading-relaxed">{complaint.description}</p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border-beige pt-3 md:pt-0">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-mono font-medium ${
                    complaint.status === "Resolved"
                      ? "bg-purple-100 text-accent"
                      : complaint.status === "Closed"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {complaint.status.toUpperCase()}
                </span>
                <span className="text-xs font-mono font-medium text-plum bg-background px-2.5 py-1 border border-border-beige rounded">
                  {complaint.priority}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
