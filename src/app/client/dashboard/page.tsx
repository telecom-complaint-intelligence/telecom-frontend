"use client";

import React, { useState } from "react";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

interface Ticket {
  id: string;
  customer: string;
  issue: string;
  category: string;
  priority: "Urgent" | "High" | "Medium";
  status: "Open" | "In Progress";
}

export default function ClientDashboard() {
  const [tickets] = useState<Ticket[]>([]);

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
          <p className="text-3xl font-serif font-semibold text-foreground">0</p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm animate-fade-in">
          <p className="text-xs font-mono uppercase text-plum flex items-center gap-1.5">
            <AlertCircle size={12} className="text-plum" /> Urgent Tickets
          </p>
          <p className="text-3xl font-serif font-semibold text-foreground">-</p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm animate-fade-in">
          <p className="text-xs font-mono uppercase text-plum flex items-center gap-1.5">
            <Clock size={12} className="text-plum" /> Online Operators
          </p>
          <p className="text-3xl font-serif font-semibold text-foreground">0</p>
        </div>
      </div>

      {/* Triage Queue Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-semibold">Triage Queue</h2>
        <div className="bg-card-bg border border-border-beige rounded overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#F5EFEB] border-b border-border-beige">
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">ID</th>
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Customer</th>
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Complaint Description</th>
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-background/40 transition-colors">
                    <td className="p-4 font-mono font-medium text-accent">
                      <span className="hover:underline">{ticket.id}</span>
                    </td>
                    <td className="p-4 font-medium">{ticket.customer}</td>
                    <td className="p-4 text-plum font-serif">
                      <span className="hover:underline">{ticket.issue}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-plum">{ticket.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-plum font-serif text-sm bg-card-bg">
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
