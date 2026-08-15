"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Home, ListTodo, Plus, Bell, User, LogOut } from "lucide-react";
import Image from "next/image";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/customer/dashboard", label: "Dashboard", mobileLabel: "Dashboard", icon: Home },
    { href: "/customer/my-complaints", label: "My complaints", mobileLabel: "Complaints", icon: ListTodo },
    { href: "/customer/raise-complaint", label: "Raise complaint", mobileLabel: "Raise", icon: Plus, isAction: true },
    { href: "/customer/notifications", label: "Notifications", mobileLabel: "Alerts", icon: Bell },
    { href: "/customer/profile", label: "Profile", mobileLabel: "Profile", icon: User },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 border-r border-border-beige bg-card-bg flex-col justify-between p-6 shrink-0 h-full">
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
          </div>

          <nav className="space-y-1">
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
          <div className="text-[11px] text-plum font-mono border-t border-border-beige pt-4 uppercase leading-relaxed">
            ACCOUNT: {user?.accountRef || "-"}<br />
            PLAN: {user?.planUsage ? String(user.planUsage).toUpperCase() : "-"} · {user?.city || "-"}
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header (hidden on mobile) */}
        <header className="hidden md:flex border-b border-border-beige bg-card-bg px-6 md:px-8 py-4 items-center justify-between shrink-0">
          <span className="text-xs font-mono uppercase tracking-wider text-plum">Customer Portal</span>
          <div className="flex items-center gap-4">
            {user?.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profilePicture}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover border border-border-beige"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-accent-light flex items-center justify-center text-accent">
                <User size={16} />
              </span>
            )}
            <div className="text-left leading-none hidden sm:block">
              <span className="text-sm font-medium block">{user?.name || "-"}</span>
              <span className="text-[10px] font-mono text-plum">
                {user?.id || "-"}
              </span>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card-bg flex items-center justify-around px-4 z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isAction) {
            // Action item (Raise Complaint) prominently in the center (enlarged, thick border, no shadow)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center h-16 w-16 rounded-full bg-[#1E0A2D] text-white -translate-y-5 hover:scale-105 active:scale-95 transition-all border-6 border-background"
                aria-label={item.label}
              >
                <Icon size={24} />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 w-12 h-12 transition-colors ${
                isActive ? "text-accent" : "text-plum hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-[9px] font-mono font-medium tracking-tight leading-none">
                {item.mobileLabel}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
