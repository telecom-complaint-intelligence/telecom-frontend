"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, ShieldAlert, CheckCircle, Send, Paperclip, User } from "lucide-react";

interface Comment {
  author: string;
  role: "Customer" | "Operator" | "System" | "Internal Note";
  message: string;
  time: string;
}

export default function ClientComplaintIntelligencePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<"reply" | "note">("reply");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    { author: "Arjun Raman", role: "Customer", message: "Raised this complaint through the portal with a speed test screenshot attached.", time: "11 AUG, 20:05" },
    { author: "Uplink Triage", role: "System", message: "Classified as Broadband performance · sentiment highly negative · priority high · escalation risk 78%. Routed to Broadband Support.", time: "11 AUG, 20:05" },
    { author: "Vinoth K.", role: "Operator", message: "Ran a remote line test. 11 Mbps against a 100 Mbps plan. Fault sits outside the premises.", time: "11 AUG, 21:30" },
    { author: "Vinoth K.", role: "Internal Note", message: "Fourth report from MDU-04 tonight. Suspect shared capacity issue at the exchange rather than individual lines.", time: "11 AUG, 21:34" },
    { author: "Arjun Raman", role: "Customer", message: "Thanks. Any idea how long this will take? I have client calls all week.", time: "TODAY, 08:40" },
  ]);

  const [triageSteps, setTriageSteps] = useState([
    { id: 1, text: "Check network availability at exchange MDU-04", done: false },
    { id: 2, text: "Verify router connectivity and line sync", done: false },
    { id: 3, text: "Check for a known outage in the area", done: false },
    { id: 4, text: "Escalate to Network Operations if unresolved", done: false },
  ]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      author: "Priya S.",
      role: activeTab === "note" ? "Internal Note" : "Operator",
      message: commentText,
      time: "Just now",
    };

    setComments([...comments, newComment]);
    setCommentText("");
  };

  const toggleTriageStep = (id: number) => {
    setTriageSteps(
      triageSteps.map(step => (step.id === id ? { ...step, done: !step.done } : step))
    );
  };

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-7xl w-full mx-auto font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-plum uppercase">
        <Link href="/client/complaints" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft size={12} /> Complaints
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{id}</span>
      </div>

      {/* Action Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border-beige pb-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-plum uppercase block">CMP ID: {id}</span>
          <h1 className="text-2xl font-serif font-bold">Slow internet connection</h1>
          <p className="text-xs text-plum font-mono flex items-center gap-1.5 mt-1 text-red-600">
            <Clock size={12} /> SLA response due in 1h 20m
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 border border-border-beige hover:bg-card-bg text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer">
            <User size={12} /> Assign agent
          </button>
          <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer">
            <ShieldAlert size={12} /> Escalate
          </button>
          <button className="px-4 py-2 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer">
            <CheckCircle size={12} /> Resolve complaint
          </button>
        </div>
      </div>

      {/* Detailed Triage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Customer details & log */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Customer profile card */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige flex items-center justify-between gap-4">
              <h2 className="text-base font-serif font-semibold">Customer Account</h2>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                HIGH ESCALATION RISK
              </span>
            </div>
            <div className="p-6 flex items-center gap-4 border-b border-border-beige">
              <div className="h-12 w-12 rounded-full bg-accent-light text-accent flex items-center justify-center text-lg font-serif">
                AR
              </div>
              <div>
                <p className="font-semibold">Arjun Raman</p>
                <p className="text-xs text-plum">CUST-88214 · Customer since Mar 2024</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border-beige border-b border-border-beige text-xs">
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Phone</span>
                <p className="font-medium">+91 90XXXX 4821</p>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Location</span>
                <p className="font-medium">Madurai (MDU-04)</p>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">Plan</span>
                <p className="font-medium">Fibre 100 Mbps</p>
              </div>
              <div className="p-4 space-y-1">
                <span className="text-[10px] font-mono text-plum uppercase block">History</span>
                <p className="font-medium text-red-600 font-semibold">3 open tickets</p>
              </div>
            </dl>
            <div className="p-4 bg-[#F5EFEB] text-xs text-plum font-serif flex items-center gap-3">
              <span className="font-bold text-foreground shrink-0">Historical Alert:</span>
              <p>6 of his last 12 complaints were broadband. Two reopened after resolution.</p>
            </div>
          </div>

          {/* Ticket Description */}
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-wider text-plum">Complaint Statement</h2>
            <div className="p-4 bg-background border-l-2 border-border-beige rounded text-sm text-plum font-serif leading-relaxed">
              Speeds drop to almost nothing after 7pm every day for the past week. Fine in the mornings. Restarted the router twice, no change. Wired and wifi are both affected. I work from home in the evenings and video calls keep freezing.
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-mono bg-background border border-border-beige px-2 py-1 rounded cursor-pointer">
                📎 speedtest-evening.png
              </span>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige">
              <h2 className="text-base font-serif font-semibold">Triage Feed</h2>
            </div>
            <div className="p-6 space-y-6 relative before:absolute before:left-[27px] before:top-6 before:bottom-6 before:w-px before:bg-border-beige">
              {comments.map((c, idx) => (
                <div
                  key={idx}
                  className={`relative pl-10 flex items-start gap-3 text-sm ${
                    c.role === "Internal Note" ? "bg-amber-50/20 p-2 rounded-lg -ml-2" : ""
                  }`}
                >
                  <span
                    className={`absolute left-[3px] top-1.5 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-serif font-bold ${
                      c.role === "Internal Note"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : c.role === "System"
                        ? "bg-purple-100 text-accent border border-purple-200"
                        : "bg-[#F5EFEB] border border-border-beige text-accent"
                    }`}
                  >
                    {c.author.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-baseline gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{c.author}</span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 rounded ${
                            c.role === "Internal Note"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-[#F5EFEB] text-plum"
                          }`}
                        >
                          {c.role}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-plum/70">{c.time}</span>
                    </div>
                    <p className="text-plum leading-relaxed text-xs">{c.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <form onSubmit={handlePostComment} className="p-4 bg-[#F5EFEB] border-t border-border-beige space-y-3">
              <div className="flex gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab("reply")}
                  className={`px-3 py-1.5 rounded-t cursor-pointer ${
                    activeTab === "reply" ? "bg-white border border-border-beige border-b-transparent" : "text-plum"
                  }`}
                >
                  Reply to Customer
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("note")}
                  className={`px-3 py-1.5 rounded-t cursor-pointer ${
                    activeTab === "note" ? "bg-white border border-border-beige border-b-transparent" : "text-plum"
                  }`}
                >
                  Internal Note
                </button>
              </div>
              <div className="bg-white p-3 border border-border-beige rounded space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    activeTab === "note"
                      ? "Write an internal note for staff..."
                      : "Write a reply to the customer..."
                  }
                  rows={3}
                  className="w-full text-xs focus:outline-none resize-none"
                />
                <div className="flex justify-between items-center border-t border-border-beige pt-2">
                  <button
                    type="button"
                    className="text-xs text-plum hover:text-foreground flex items-center gap-1.5 cursor-pointer"
                  >
                    <Paperclip size={12} /> Attach files
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={12} /> {activeTab === "note" ? "Save Note" : "Send Reply"}
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: AI & Copilot */}
        <div className="space-y-6">
          
          {/* AI analytics summary */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige">
              <h2 className="text-base font-serif font-semibold">Triage Intel</h2>
            </div>
            
            <div className="grid grid-cols-2 divide-x divide-border-beige border-b border-border-beige text-center">
              <div className="p-5 space-y-1">
                <span className="text-3xl font-serif font-bold text-red-600">78%</span>
                <span className="text-[10px] font-mono text-plum uppercase block">Escalation Risk</span>
              </div>
              <div className="p-5 space-y-1">
                <span className="text-3xl font-serif font-bold text-green-600">92%</span>
                <span className="text-[10px] font-mono text-plum uppercase block">Confidence</span>
              </div>
            </div>

            <dl className="p-5 space-y-3 text-xs divide-y divide-border-beige">
              <div className="pb-3 flex justify-between">
                <span className="font-mono text-plum uppercase">Detected Category</span>
                <span className="font-semibold text-foreground">Broadband</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="font-mono text-plum uppercase">Sentiment analysis</span>
                <span className="font-semibold text-red-600">Highly Negative</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="font-mono text-plum uppercase">SLA response time</span>
                <span className="font-semibold text-foreground">4 Hours</span>
              </div>
            </dl>
          </div>

          {/* Copilot Actionable Box */}
          <div className="bg-[#1E0A2D] text-white border border-[#2F1442] rounded shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-accent">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider">Triage Copilot</span>
            </div>
            <p className="text-xs text-[#C4D4DC] leading-relaxed">
              <b>I suggest redirecting to Network Operations.</b> This customer has a history of reopens, and a local node capacity overload is currently active at tower MDU-04. Sending a technician to the address will likely result in a wasted dispatch.
            </p>

            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-mono text-[#8494A0] uppercase">Recommended Actions</p>
              <div className="space-y-2">
                {triageSteps.map(step => (
                  <label key={step.id} className="flex items-start gap-2.5 text-xs text-[#C4D4DC] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step.done}
                      onChange={() => toggleTriageStep(step.id)}
                      className="mt-0.5 accent-accent"
                    />
                    <span className={step.done ? "line-through text-plum" : ""}>{step.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2 bg-accent hover:opacity-90 text-[#04241E] text-xs font-semibold rounded transition-opacity cursor-pointer text-center"
            >
              Apply Recommended Route
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
