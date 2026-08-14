"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Settings, Shield, LogOut } from "lucide-react";

export default function ClientSettingsPage() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-4xl w-full mx-auto">
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
          <Settings size={28} className="text-accent" />
          System Settings
        </h1>
        <p className="text-sm text-plum">Console settings, session details, and operator configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-card-bg border border-border-beige rounded shadow-sm space-y-4">
          <h2 className="text-base font-serif font-semibold">Triage Configuration</h2>
          <div className="divide-y divide-border-beige text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="font-mono text-plum uppercase">Auto-assign limit</span>
              <span className="font-medium">15 Tickets / Agent</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="font-mono text-plum uppercase">SLA Breach alert</span>
              <span className="font-medium">4 Hours</span>
            </div>
          </div>
        </div>

        {/* Action Panel for Logout */}
        <div className="p-6 bg-card-bg border border-border-beige rounded shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-serif font-semibold">Console Security</h2>
            <p className="text-xs text-plum mt-1">You are currently logged in as a shift supervisor.</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
          >
            <LogOut size={14} />
            Log out Session
          </button>
        </div>
      </div>
    </main>
  );
}
