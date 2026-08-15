"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, Activity, CheckCircle } from "lucide-react";

interface Complaint {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  severity: string;
  status: string;
  description: string;
}

export default function MyComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("telu_raised_complaints");
    if (stored) {
      setTimeout(() => setComplaints(JSON.parse(stored)), 0);
    }
  }, []);

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || c.status.toLowerCase() === filterStatus.toLowerCase();
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
          {["All", "Open", "Pending", "Resolved"].map((status) => (
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
                    {complaint.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-plum flex items-center gap-1">
                    {complaint.status === "OPEN" ? (
                      <Activity size={12} className="text-red-500" />
                    ) : complaint.status === "PENDING" ? (
                      <Clock size={12} className="text-amber-500" />
                    ) : (
                      <CheckCircle size={12} className="text-accent" />
                    )}
                    {complaint.severity.toUpperCase()} &middot; {complaint.createdAt}
                  </span>
                </div>
                <h2 className="text-lg font-serif font-medium text-foreground">{complaint.title}</h2>
                <p className="text-xs text-plum line-clamp-1 leading-relaxed">{complaint.description}</p>
              </div>

              <span className={`text-xs font-mono font-medium px-3 py-1 rounded border shrink-0 ${
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
        )}
      </div>
    </main>
  );
}
