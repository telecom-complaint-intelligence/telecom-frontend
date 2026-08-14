"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Activity, CheckCircle, Clock } from "lucide-react";

interface Ticket {
  id: string;
  customer: string;
  issue: string;
  category: string;
  priority: "Urgent" | "High" | "Medium";
  status: "Open" | "In Progress";
}

export default function ClientDashboard() {
  const mockTickets: Ticket[] = [
    { id: "CMP-1025", customer: "Arjun Raman", issue: "Slow internet connection in Anna Nagar", category: "Broadband", priority: "High", status: "In Progress" },
    { id: "CMP-1031", customer: "Meena K.", issue: "Double charge disputation on August statement", category: "Billing", priority: "Urgent", status: "Open" },
    { id: "CMP-1029", customer: "Suresh V.", issue: "Tower signal drops persistently in mornings", category: "Network", priority: "Urgent", status: "Open" },
  ];

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto">
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal">Triage Console</h1>
        <p className="text-sm text-plum">Automated triage queue with live priority & sentiment triggers.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm">
          <p className="text-xs font-mono uppercase text-plum flex items-center gap-1.5">
            <CheckCircle size={12} className="text-accent" /> Active Complaints
          </p>
          <p className="text-3xl font-serif font-semibold text-foreground">84</p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm">
          <p className="text-xs font-mono uppercase text-plum flex items-center gap-1.5">
            <AlertCircle size={12} className="text-red-500" /> Urgent Tickets
          </p>
          <p className="text-3xl font-serif font-semibold text-accent">23</p>
        </div>
        <div className="p-4 bg-card-bg border border-border-beige rounded space-y-1 shadow-sm">
          <p className="text-xs font-mono uppercase text-plum flex items-center gap-1.5">
            <Clock size={12} className="text-plum" /> Online Operators
          </p>
          <p className="text-3xl font-serif font-semibold text-foreground">14</p>
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
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Category</th>
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Priority</th>
                <th className="p-4 font-mono text-xs text-plum uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-beige">
              {mockTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-background/40 transition-colors">
                  <td className="p-4 font-mono font-medium text-accent">
                    <Link href={`/client/complaints/${ticket.id}`} className="hover:underline">
                      {ticket.id}
                    </Link>
                  </td>
                  <td className="p-4 font-medium">{ticket.customer}</td>
                  <td className="p-4 text-plum font-serif">
                    <Link href={`/client/complaints/${ticket.id}`} className="hover:underline">
                      {ticket.issue}
                    </Link>
                  </td>
                  <td className="p-4 text-xs font-mono font-medium">{ticket.category}</td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                        ticket.priority === "Urgent"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono text-plum">{ticket.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
