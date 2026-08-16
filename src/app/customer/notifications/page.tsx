"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, MessageSquare, Info } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "update" | "alert" | "system" | "resolved";
  unread: boolean;
}

interface TicketDetail {
  id: string;
  ticket_number: string;
  category?: string;
  timestamp?: string;
  status: string;
  response?: string;
  ai_analysis?: {
    negativity_score?: number;
  };
  priority_scores?: {
    complexity?: string;
  };
}

export default function NotificationsPage() {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchTicketsAndBuildNotifications = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/complaints/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error("Failed to fetch tickets");
        const tickets = await response.json();

        // Read read IDs from localStorage
        const readIds = JSON.parse(localStorage.getItem("telu_read_notifications") || "[]");

        const generated: Notification[] = [];

        tickets.forEach((ticket: TicketDetail) => {
          const dateStr = ticket.timestamp ? new Date(ticket.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }) : "Recent";

          // 1. Registration notification
          const regId = `reg-${ticket.id}`;
          generated.push({
            id: regId,
            title: `Complaint Registered: ${ticket.ticket_number}`,
            message: `Your ticket for category "${ticket.category || 'General'}" has been successfully logged.`,
            time: dateStr,
            type: "system",
            unread: !readIds.includes(regId)
          });

          // 2. AI Triage notification
          const triageId = `triage-${ticket.id}`;
          const isHighlyNegative = (ticket.ai_analysis?.negativity_score ?? 0) > 0.6;
          const comp = ticket.priority_scores?.complexity || "LOW";
          generated.push({
            id: triageId,
            title: `AI Triage Completed: ${ticket.ticket_number}`,
            message: `Triage complete. Sentiment: ${isHighlyNegative ? 'Highly Negative' : 'Neutral / Positive'}. Complexity assigned: ${comp}.`,
            time: dateStr,
            type: comp === "CRITICAL" || comp === "HIGH" ? "alert" : "update",
            unread: !readIds.includes(triageId)
          });

          // 3. Resolution notification (if resolved or closed)
          if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
            const resId = `res-${ticket.id}`;
            generated.push({
              id: resId,
              title: `Complaint Resolved: ${ticket.ticket_number}`,
              message: `The reported issue is resolved. Resolution action: ${ticket.response || "No action details provided."}`,
              time: dateStr,
              type: "resolved",
              unread: !readIds.includes(resId)
            });
          }
        });

        // Add dynamic network maintenance notification if user has a city
        if (user?.city) {
          const maintenanceId = `maintenance-${user.city}`;
          generated.push({
            id: maintenanceId,
            title: `Scheduled Network Maintenance`,
            message: `Service upgrades scheduled in ${user.city} between 1 AM and 4 AM next Tuesday. Expect brief outages.`,
            time: "System Alert",
            type: "system",
            unread: !readIds.includes(maintenanceId)
          });
        }

        // Sort: show unread first
        generated.sort((a, b) => {
          if (a.unread && !b.unread) return -1;
          if (!a.unread && b.unread) return 1;
          return 0;
        });

        setNotifications(generated);
      } catch (err) {
        console.error("Error building notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketsAndBuildNotifications();
  }, [token, user]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem("telu_read_notifications", JSON.stringify(allIds));
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem("telu_read_notifications") || "[]");
    let newReadIds = [];
    
    const clicked = notifications.find(n => n.id === id);
    if (clicked?.unread) {
      newReadIds = [...readIds, id];
    } else {
      newReadIds = readIds.filter((item: string) => item !== id);
    }
    
    localStorage.setItem("telu_read_notifications", JSON.stringify(newReadIds));
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
        {loading ? (
          <div className="text-center py-16 bg-card-bg border border-border-beige rounded animate-pulse">
            <p className="text-sm text-plum font-serif">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
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
