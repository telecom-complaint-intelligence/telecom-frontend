"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

interface Ticket {
  id: string;
  ticket_number: string;
  complaint1: string;
  category: string;
  status: string;
  priority_scores?: {
    complexity: string;
  } | null;
}

export default function ClientDashboard() {
  const { token, user, getOperators } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [operatorCount, setOperatorCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // 1. Fetch complaints
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
        setTickets(data);
      })
      .catch(err => {
        console.error("Dashboard load error:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2. Fetch operators count
    getOperators()
      .then(ops => {
        if (ops) setOperatorCount(ops.length);
      })
      .catch(err => {
        console.error("Error loading operators count:", err);
      });
  }, [token, getOperators]);

  // Compute stats dynamically
  const activeTickets = tickets.filter(t => t.status !== "CLOSED" && t.status !== "RESOLVED");
  const urgentCount = activeTickets.filter(t => {
    const complexity = t.priority_scores?.complexity || "LOW";
    return complexity === "HIGH" || complexity === "CRITICAL";
  }).length;

  const latestActiveQueue = activeTickets.slice(-5).reverse();

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto font-sans">
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal">Triage Console</h1>
        <p className="text-sm text-plum">Automated triage queue with live priority & sentiment triggers.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm animate-fade-in">
          <p className="text-xs font-mono uppercase text-plum flex items-center gap-1.5">
            <CheckCircle size={12} className="text-accent" /> Active Complaints
          </p>
          <p className="text-3xl font-serif font-semibold text-foreground">
            {loading ? "..." : activeTickets.length}
          </p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm animate-fade-in">
          <p className="text-xs font-mono uppercase text-plum flex items-center gap-1.5">
            <AlertCircle size={12} className="text-red-500" /> Urgent Tickets
          </p>
          <p className="text-3xl font-serif font-semibold text-foreground">
            {loading ? "..." : urgentCount}
          </p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm animate-fade-in">
          <p className="text-xs font-mono uppercase text-plum flex items-center gap-1.5">
            <Clock size={12} className="text-plum" /> Online Operators
          </p>
          <p className="text-3xl font-serif font-semibold text-foreground">
            {loading ? "..." : operatorCount}
          </p>
        </div>
      </div>

      {/* Triage Queue Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <h2 className="text-lg font-serif font-semibold">Triage Queue (Latest Active)</h2>
          <Link href="/client/complaints" className="text-xs font-mono text-accent hover:underline">
            View all tickets &rarr;
          </Link>
        </div>
        
        <div className="bg-card-bg border border-border-beige rounded overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F5EFEB] border-b border-border-beige">
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">ID</th>
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Category</th>
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Complaint Description</th>
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Complexity</th>
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-plum text-xs">
                    Loading triage console queue...
                  </td>
                </tr>
              ) : latestActiveQueue.length > 0 ? (
                latestActiveQueue.map((ticket) => {
                  const complexity = ticket.priority_scores?.complexity || "LOW";
                  return (
                    <tr key={ticket.id} className="hover:bg-background/40 transition-colors">
                      <td className="p-4 font-mono font-medium text-accent">
                        <Link href={`/client/complaints/${ticket.id}`} className="hover:underline">
                          {ticket.ticket_number || ticket.id.substring(0, 8)}
                        </Link>
                      </td>
                      <td className="p-4 font-medium uppercase text-xs font-mono text-plum">{ticket.category || "General"}</td>
                      <td className="p-4 text-plum font-serif truncate max-w-xs capitalize">
                        <Link href={`/client/complaints/${ticket.id}`} className="hover:underline text-foreground">
                          {ticket.complaint1}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                          complexity === "CRITICAL" ? "bg-red-100 text-red-700" :
                          complexity === "HIGH" ? "bg-amber-100 text-amber-700" :
                          complexity === "MEDIUM" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {complexity}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded border ${
                          ticket.status === "OPEN" 
                            ? "bg-red-50 text-red-700 border-red-100" 
                            : ticket.status === "IN_PROGRESS"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-purple-50 text-accent border-purple-100"
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-plum font-serif text-sm bg-card-bg">
                    No active complaints in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
