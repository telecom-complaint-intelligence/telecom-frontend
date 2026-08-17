"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Clock, Activity, CheckCircle, Filter, X, ArrowUpDown, ChevronDown } from "lucide-react";
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
  } | null;
}

export default function MyComplaintsPage() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedComplexities, setSelectedComplexities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const filterRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gather unique options dynamically from fetched complaints
  const uniqueCategories = Array.from(new Set(complaints.map(c => c.category || "General"))).filter(Boolean);
  const uniqueComplexities = Array.from(new Set(complaints.map(c => c.priority_scores?.complexity || "LOW"))).filter(Boolean);
  const uniqueStatuses = ["OPEN", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"];

  const handleToggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleToggleComplexity = (complexity: string) => {
    setSelectedComplexities(prev => 
      prev.includes(complexity) ? prev.filter(c => c !== complexity) : [...prev, complexity]
    );
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setSelectedStatuses([]);
    setSelectedComplexities([]);
    setSelectedCategories([]);
    setSearchTerm("");
  };

  // Filter & Sort Logic
  const filtered = complaints
    .filter(c => {
      const title = c.complaint1 || "";
      const tNum = c.ticket_number || "";
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || tNum.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(c.status);
      const matchesComplexity = selectedComplexities.length === 0 || selectedComplexities.includes(c.priority_scores?.complexity || "LOW");
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(c.category || "General");

      return matchesSearch && matchesStatus && matchesComplexity && matchesCategory;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });

  const totalActiveFilters = selectedStatuses.length + selectedComplexities.length + selectedCategories.length;

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-5xl w-full mx-auto relative">
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
      <div className="flex flex-wrap gap-3 items-center bg-card-bg p-4 border border-border-beige rounded shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-3 text-plum" />
          <input
            type="text"
            placeholder="Search by ID or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Filter Dropdown Toggle */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 border rounded text-sm font-mono font-medium flex items-center gap-2 cursor-pointer transition-all ${
              isFilterOpen || totalActiveFilters > 0
                ? "bg-[#1E0A2D] border-[#1E0A2D] text-white"
                : "bg-background border-border-beige text-plum hover:text-foreground"
            }`}
          >
            <Filter size={14} />
            <span>FILTER</span>
            {totalActiveFilters > 0 && (
              <span className="bg-accent text-white text-[10px] h-5 px-1.5 rounded-full flex items-center justify-center font-bold">
                {totalActiveFilters}
              </span>
            )}
            <ChevronDown size={14} />
          </button>

          {/* Filter Popover */}
          {isFilterOpen && (
            <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-72 bg-card-bg border border-border-beige rounded-lg shadow-xl z-50 p-4 space-y-4 animate-fade-in text-sm text-foreground">
              <div className="flex justify-between items-center border-b border-border-beige pb-2">
                <span className="font-serif font-semibold">Filter Options</span>
                {totalActiveFilters > 0 && (
                  <button onClick={clearAllFilters} className="text-xs text-accent hover:underline font-mono">
                    Reset
                  </button>
                )}
              </div>

              {/* Status Section */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-plum uppercase block">Status</span>
                <div className="grid grid-cols-2 gap-2">
                  {uniqueStatuses.map(status => (
                    <label key={status} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => handleToggleStatus(status)}
                        className="rounded border-border-beige text-accent focus:ring-accent"
                      />
                      <span className="font-mono text-plum">{status.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Severity/Complexity Section */}
              {uniqueComplexities.length > 0 && (
                <div className="space-y-1.5 border-t border-border-beige pt-2">
                  <span className="text-[10px] font-mono text-plum uppercase block">Severity / Priority</span>
                  <div className="flex flex-wrap gap-2">
                    {uniqueComplexities.map(complexity => (
                      <label key={complexity} className="flex items-center gap-1.5 text-xs cursor-pointer bg-background px-2 py-1 rounded border border-border-beige">
                        <input
                          type="checkbox"
                          checked={selectedComplexities.includes(complexity)}
                          onChange={() => handleToggleComplexity(complexity)}
                          className="rounded text-accent focus:ring-accent"
                        />
                        <span className="font-mono text-plum">{complexity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Section */}
              {uniqueCategories.length > 0 && (
                <div className="space-y-1.5 border-t border-border-beige pt-2">
                  <span className="text-[10px] font-mono text-plum uppercase block">Category</span>
                  <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                    {uniqueCategories.map(cat => (
                      <label key={cat} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => handleToggleCategory(cat)}
                          className="rounded text-accent focus:ring-accent"
                        />
                        <span className="truncate text-plum capitalize">{cat.toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sort Toggle */}
        <button
          type="button"
          onClick={() => setSortBy(prev => prev === "newest" ? "oldest" : "newest")}
          className="px-4 py-2 bg-background border border-border-beige rounded text-sm font-mono font-medium text-plum hover:text-foreground flex items-center gap-2 cursor-pointer transition-colors"
        >
          <ArrowUpDown size={14} />
          <span>SORT: {sortBy.toUpperCase()}</span>
        </button>

        {/* Clear Filters Button (Visible outside dropdown if filters active) */}
        {totalActiveFilters > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-mono text-red-600 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            <X size={12} /> CLEAR ALL
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <span className="text-sm text-plum animate-pulse">Loading complaints...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 border border-border-beige rounded bg-card-bg">
            <p className="text-sm text-plum font-serif italic">No complaints found matching selection.</p>
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
                  <h2 className="text-lg font-serif font-medium text-foreground capitalize leading-snug">{complaint.complaint1}</h2>
                </div>

                <span className={`text-xs font-mono font-medium px-3 py-1 rounded border shrink-0 ${
                  complaint.status === "OPEN"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : complaint.status === "IN_PROGRESS"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : complaint.status === "ESCALATED"
                    ? "bg-red-50 text-red-700 border-red-200"
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
