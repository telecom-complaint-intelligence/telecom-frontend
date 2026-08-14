"use client";

import React, { useState } from "react";
import { Bell, CheckCircle, AlertTriangle, MessageSquare, Info } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "update" | "alert" | "system" | "resolved";
  unread: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", title: "Field engineer assigned to CMP1025", message: "Vinoth K. is scheduled to investigate the junction box outside your home.", time: "Today, 09:12", type: "update", unread: true },
    { id: "2", title: "Your complaint needs a reply", message: "CMP1020 - Operator has requested confirmation of your router serial number.", time: "Today, 08:34", type: "alert", unread: true },
    { id: "3", title: "SIM activation success", message: "CMP1021 - Your new 5G eSIM is activated. Please test it and close the ticket.", time: "Yesterday", type: "resolved", unread: false },
    { id: "4", title: "Scheduled Network Maintenance", message: "Outages expected in Madurai between 1 AM and 4 AM on Aug 18.", time: "Aug 11, 2026", type: "system", unread: false },
  ]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const filtered = notifications.filter(n => filter === "all" || n.unread);

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-4xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-beige pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
            <Bell size={24} className="text-accent" />
            Notifications
          </h1>
          <p className="text-sm text-plum">
            {unreadCount > 0 ? `You have ${unreadCount} unread update(s).` : "You are completely up to date."}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-xs font-mono text-accent hover:underline cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-beige text-sm">
        <button
          onClick={() => setFilter("all")}
          className={`pb-3 px-4 font-mono font-medium border-b-2 transition-all cursor-pointer ${
            filter === "all" ? "border-accent text-foreground" : "border-transparent text-plum hover:text-foreground"
          }`}
        >
          ALL ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`pb-3 px-4 font-mono font-medium border-b-2 transition-all cursor-pointer ${
            filter === "unread" ? "border-accent text-foreground" : "border-transparent text-plum hover:text-foreground"
          }`}
        >
          UNREAD ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-card-bg border border-border-beige rounded">
            <p className="text-sm text-plum font-serif">No notifications to show here.</p>
          </div>
        ) : (
          filtered.map((n) => {
            const Icon = {
              update: MessageSquare,
              alert: AlertTriangle,
              system: Info,
              resolved: CheckCircle,
            }[n.type];

            return (
              <div
                key={n.id}
                onClick={() => handleToggleRead(n.id)}
                className={`p-4 bg-card-bg border rounded flex items-start gap-4 transition-all cursor-pointer shadow-sm ${
                  n.unread ? "border-accent bg-accent-light/10" : "border-border-beige hover:border-plum"
                }`}
              >
                <div
                  className={`p-2.5 rounded shrink-0 ${
                    n.unread ? "bg-accent-light text-accent" : "bg-[#F5EFEB] text-plum"
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className={`text-sm ${n.unread ? "font-semibold text-foreground" : "text-plum"}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] font-mono text-plum/70 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-plum leading-relaxed">{n.message}</p>
                </div>

                {n.unread && (
                  <span className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2"></span>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
