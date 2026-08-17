"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useRef } from "react";
import { Search, Check, AlertCircle, Filter, ChevronDown, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

interface Complaint {
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

export default function ClientComplaintsPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Advanced Filtering & Sorting States
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedComplexities, setSelectedComplexities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchTicketsList = React.useCallback(() => {
    if (!token) return;
    setLoading(true);
    fetch("http://localhost:8000/api/v1/complaints", {
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

  useEffect(() => {
    fetchTicketsList();
  }, [fetchTicketsList]);

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

  const updateStatus = async (id: string, nextStatus: "IN_PROGRESS" | "RESOLVED") => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/complaints/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (response.ok) {
        fetchTicketsList();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Build filter options based on raw data
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
      const desc = c.complaint1 || "";
      const tNum = c.ticket_number || "";
      const cat = c.category || "";
      
      const matchesSearch = 
        desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.toLowerCase().includes(searchTerm.toLowerCase());

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
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto font-sans relative">
      <div className="border-b border-border-beige pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-normal">Complaints Triage</h1>
          <p className="text-sm text-plum">Review incoming tickets, escalate high-risk cases, and assign resolutions.</p>
        </div>
      </div>

      {/* Advanced Filters and Search Bar */}
      <div className="flex flex-wrap gap-3 items-center bg-card-bg p-4 border border-border-beige rounded shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-3 text-plum" />
          <input
            type="text"
            placeholder="Search by ID, category, details..."
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
                      <span className="font-mono text-plum text-[11px]">{status.replace("_", " ")}</span>
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
                        <span className="truncate text-plum capitalize text-[11px]">{cat.toLowerCase()}</span>
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
          <span>SORT BY: {sortBy.toUpperCase()}</span>
        </button>

        <div className="text-xs font-mono text-plum ml-auto">{loading ? "..." : filtered.length} active tickets found</div>
      </div>

      {/* Queue list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-plum text-sm animate-pulse">
            Loading triage tickets...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map(c => {
            const complexity = c.priority_scores?.complexity || "LOW";
            const isUrgent = complexity === "HIGH" || complexity === "CRITICAL";
            const dateStr = c.created_at
              ? new Date(c.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                })
              : "Recent";

            return (
              <div
                key={c.id}
                className={`p-6 bg-card-bg border rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm transition-all ${
                  isUrgent && c.status !== "RESOLVED" && c.status !== "CLOSED"
                    ? "border-red-200 bg-red-50/10"
                    : "border-border-beige hover:border-plum"
                }`}
              >
                <Link href={`/client/complaints/${c.id}`} className="space-y-2 flex-1 min-w-0 hover:opacity-90 block">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono bg-[#F5EFEB] px-2 py-0.5 rounded font-bold text-accent">
                      {c.ticket_number || c.id.substring(0, 8)}
                    </span>
                    <span className="text-xs text-plum font-mono">Received {dateStr}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                      complexity === "CRITICAL" ? "bg-red-100 text-red-700" :
                      complexity === "HIGH" ? "bg-amber-100 text-amber-700" :
                      complexity === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {complexity}
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-medium text-foreground capitalize">{c.complaint1}</h3>
                  <p className="text-xs text-accent uppercase font-mono">{c.category || "General Support"}</p>
                </Link>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border-beige pt-3 md:pt-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                        c.status === "RESOLVED" || c.status === "CLOSED"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : c.status === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-purple-100 text-accent"
                      }`}
                    >
                      {c.status.toUpperCase()}
                    </span>
                  </div>

                  {c.status !== "RESOLVED" && c.status !== "CLOSED" && (
                    <div className="flex gap-2">
                      {c.status === "OPEN" && (
                        <button
                          onClick={() => updateStatus(c.id, "IN_PROGRESS")}
                          className="px-3 py-1.5 bg-[#1E0A2D] text-white text-xs font-medium rounded hover:bg-[#2F1442] transition-colors cursor-pointer"
                        >
                          Process
                        </button>
                      )}
                      <button
                        onClick={() => updateStatus(c.id, "RESOLVED")}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
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
