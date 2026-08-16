"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Clock, Activity, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface Complaint {
  id: string;
  ticket_number: string;
  complaint1: string;
  category: string;
  created_at: string;
  status: string;
  priority_scores?: {
    complexity: string;
  };
}

export default function MyComplaintsPage() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
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
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const filtered = complaints.filter(c => {
    const title = c.complaint1 || "";
    const tNum = c.ticket_number || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || tNum.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "All") return matchesSearch;
    return matchesSearch && c.status.toLowerCase() === filterStatus.toLowerCase();
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
          {["All", "Open", "In_Progress", "Resolved", "Closed"].map((status) => (
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
              {status.toUpperCase().replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <span className="text-sm text-plum">Loading tickets...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-border-beige rounded bg-card-bg">
            <p className="text-sm text-plum font-serif">No complaints found matching selection.</p>
          </div>
        ) : (
          filtered.map((complaint) => {
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
                className="block p-6 bg-card-bg border border-border-beige rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-plum transition-all shadow-sm cursor-pointer"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono text-plum bg-[#F5EFEB] px-2 py-0.5 rounded">
                      {complaint.ticket_number || complaint.id.substring(0, 8)}
                    </span>
                    <span className="text-xs font-mono font-semibold text-accent uppercase">
                      {complaint.category || "General"}
                    </span>
                    <span className="text-xs font-mono text-plum flex items-center gap-1.5">
                      {complaint.status === "OPEN" ? (
                        <Activity size={12} className="text-red-500 animate-pulse" />
                      ) : complaint.status === "IN_PROGRESS" ? (
                        <Clock size={12} className="text-amber-500" />
                      ) : (
                        <CheckCircle size={12} className="text-green-600" />
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        complexity === "CRITICAL" ? "bg-red-100 text-red-700" :
                        complexity === "HIGH" ? "bg-amber-100 text-amber-700" :
                        complexity === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {complexity}
                      </span>
                      &middot; {dateStr}
                    </span>
                  </div>
                  <h2 className="text-lg font-serif font-medium text-foreground capitalize">{complaint.complaint1}</h2>
                </div>

                <span className={`text-xs font-mono font-medium px-3 py-1 rounded border shrink-0 ${
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
        )}
      </div>
    </main>
  );
}
