"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Activity, CheckCircle, Send, Paperclip, MessageSquare, AlertOctagon, User } from "lucide-react";

interface Comment {
  author: string;
  role: "Customer" | "Operator" | "System";
  message: string;
  time: string;
}

export default function ComplaintDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([
    { author: "Arjun Raman", role: "Customer", message: "Raised this complaint with a speed test screenshot attached.", time: "11 AUG, 20:05" },
    { author: "Uplink Triage", role: "System", message: "Sorted into Broadband performance, marked high priority, escalation risk 78%.", time: "11 AUG, 20:05" },
    { author: "Vinoth K.", role: "Operator", message: "Ran a remote line test. Speeds measured at 11 Mbps against a 100 Mbps plan. Fault sits outside the premises.", time: "11 AUG, 21:30" },
    { author: "Arjun Raman", role: "Customer", message: "Thanks. Any idea how long this will take? I have client calls all week.", time: "TODAY, 08:40" },
    { author: "Vinoth K.", role: "Operator", message: "Network team is currently checking the local junction box. I expect to have a fix by tomorrow afternoon.", time: "TODAY, 09:12" },
  ]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment: Comment = {
      author: "Arjun Raman",
      role: "Customer",
      message: commentText,
      time: "Just now",
    };
    setComments([...comments, newComment]);
    setCommentText("");
  };

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto font-sans">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-plum uppercase">
        <Link href="/customer/my-complaints" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft size={12} /> My complaints
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{id}</span>
      </div>

      {/* Ticket Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-beige pb-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-plum uppercase block">COMPLAINT ID: {id}</span>
          <h1 className="text-3xl font-serif font-normal">Slow internet connection</h1>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase self-start md:self-center">
          IN PROGRESS
        </span>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tracking steps */}
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-6">
            <h2 className="text-sm font-mono uppercase tracking-wider text-plum">Resolution timeline</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative before:absolute before:left-3 md:before:left-6 before:top-4 before:right-6 before:h-0.5 before:bg-border-beige before:hidden md:before:block">
              {[
                { label: "Submitted", time: "11 AUG, 20:05", done: true },
                { label: "Analysed", time: "11 AUG, 20:05", done: true },
                { label: "Assigned", time: "11 AUG, 21:30", done: true },
                { label: "In Progress", time: "TODAY, 09:12", active: true },
              ].map((step, idx) => (
                <div key={idx} className="relative pl-6 md:pl-0 md:pt-6 space-y-1 text-xs">
                  <span
                    className={`absolute left-0 top-1 md:top-0 md:left-4 h-3 w-3 rounded-full border ring-4 ring-background ${
                      step.done
                        ? "bg-accent border-accent text-white"
                        : step.active
                        ? "bg-accent border-accent animate-pulse"
                        : "bg-background border-border-beige"
                    }`}
                  ></span>
                  <p className="font-semibold text-foreground">{step.label}</p>
                  <p className="text-[10px] text-plum font-mono">{step.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-wider text-plum">Details Reported</h2>
            <p className="text-sm text-plum font-serif leading-relaxed">
              Speeds drop to almost nothing after 7pm every day for the past week. Fine in the mornings. Restarted the router twice, no change. Wired and wifi are both affected. I work from home in the evenings and video calls keep freezing.
            </p>
          </div>

          {/* Activity feed */}
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige">
              <h2 className="text-base font-serif font-semibold">Activity Log</h2>
            </div>

            <div className="p-6 space-y-6 relative before:absolute before:left-[27px] before:top-6 before:bottom-6 before:w-px before:bg-border-beige">
              {comments.map((c, idx) => (
                <div key={idx} className="relative pl-10 flex items-start gap-3 text-sm">
                  <span className="absolute left-[3px] top-1.5 h-6 w-6 rounded-full bg-[#F5EFEB] border border-border-beige flex items-center justify-center text-[10px] font-serif font-bold text-accent">
                    {c.author.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="space-y-1 w-full">
                    <div className="flex justify-between items-baseline gap-4">
                      <span className="font-semibold text-foreground">{c.author}</span>
                      <span className="text-[10px] font-mono text-plum/70">{c.time}</span>
                    </div>
                    <p className="text-plum leading-relaxed text-xs">{c.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Composer */}
            <form onSubmit={handlePostComment} className="p-4 bg-[#F5EFEB] border-t border-border-beige space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Reply to support or add updates..."
                rows={3}
                className="w-full p-3 bg-card-bg border border-border-beige rounded text-xs focus:outline-none focus:border-accent resize-none"
              />
              <div className="flex justify-between items-center">
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
                  <Send size={12} /> Post Comment
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right column */}
        <div className="space-y-6">
          
          {/* Operator assignment */}
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-semibold">Assigned Engineer</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent-light text-accent flex items-center justify-center text-sm font-serif">
                VK
              </div>
              <div>
                <p className="text-sm font-semibold">Vinoth K.</p>
                <p className="text-xs text-plum">Madurai Operations Support</p>
              </div>
            </div>
            <div className="text-xs text-plum leading-relaxed bg-[#F5EFEB] p-3 rounded border border-border-beige">
              <span className="font-semibold block text-foreground mb-1">Latest Update</span>
              Checking Anna Nagar outdoor terminals. ETA tomorrow 14:00.
            </div>
          </div>

          {/* AI triage values */}
          <div className="bg-[#F5EFEB] border border-border-beige p-6 rounded shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-serif font-semibold text-accent flex items-center gap-1.5">
              <AlertOctagon size={16} /> Triage Readouts
            </h3>
            <div className="divide-y divide-border-beige">
              <div className="py-2 flex justify-between">
                <span className="font-mono text-plum uppercase">Sentiment</span>
                <span className="font-semibold text-red-600">Highly Negative</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="font-mono text-plum uppercase">Escalation Risk</span>
                <span className="font-semibold text-red-600">78%</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="font-mono text-plum uppercase">Priority</span>
                <span className="font-semibold text-accent font-mono">HIGH</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
