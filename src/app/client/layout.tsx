"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FileText, AlertOctagon, BarChart3, Users, Bell, Settings, User } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { href: "/client/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/client/complaints", label: "Complaints", icon: FileText },
    { href: "/client/high-risk", label: "High Risk", icon: AlertOctagon },
    { href: "/client/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/client/teams", label: "Teams", icon: Users },
    { href: "/client/notifications", label: "Notifications", icon: Bell },
    { href: "/client/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border-beige bg-card-bg flex flex-col justify-between p-6 shrink-0 h-full">
        <div className="space-y-8">
          <div className="flex items-center gap-2 pl-2">
            <Image
              src="/TELU-LOGO.png"
              alt="Telu Logo"
              width={140}
              height={40}
              priority
              className="h-10 w-auto object-contain"
            />
            <span className="text-[10px] font-mono uppercase bg-accent-light text-accent px-1.5 py-0.5 rounded">OPS</span>
          </div>

          <nav className="space-y-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-plum mb-3">Operations</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded transition-colors ${
                    isActive
                      ? "bg-accent-light text-accent font-semibold"
                      : "text-plum hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="text-xs text-plum font-mono border-t border-border-beige pt-4">
            SHIFT CONSOLE<br />
            0 OPERATORS ONLINE
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-border-beige bg-card-bg px-8 py-4 flex items-center justify-between shrink-0">
          <span className="text-xs font-mono uppercase tracking-wider text-plum">Console Triage</span>
          <div className="flex items-center gap-4">
            <span className="h-8 w-8 rounded-full bg-accent-light flex items-center justify-center text-accent">
              <User size={16} />
            </span>
            <div className="text-left leading-none hidden sm:block">
              {user ? (
                <>
                  <span className="text-sm font-semibold block">{user.name || user.email.split("@")[0].toUpperCase()}</span>
                  <span className="text-[9px] font-mono text-plum/70 block mt-0.5">
                    ID: {user.id ? user.id.replace("CUST-", "OPS-") : "-"}
                  </span>
                  <span className="text-[9px] font-mono text-plum block uppercase mt-0.5">
                    {user.role === "client"
                      ? (user.department ? `${user.department.toUpperCase()} OPS` : "MASTER ADMIN")
                      : user.role.toUpperCase()}
                  </span>
                </>
              ) : (
                <span className="text-xs text-plum font-mono animate-pulse">Loading Auth...</span>
              )}
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
