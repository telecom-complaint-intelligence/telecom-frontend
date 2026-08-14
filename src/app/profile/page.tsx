"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <header className="border-b border-border-beige bg-card-bg px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-white text-xs font-serif">T</span>
          <span className="text-xl font-serif tracking-tight font-semibold">Telu</span>
        </div>
        <Link href="/" className="text-sm font-mono text-accent hover:underline">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:p-12 space-y-6">
        <div className="border-b border-border-beige pb-4">
          <h1 className="text-3xl font-serif tracking-tight">Your Profile</h1>
          <p className="text-sm text-plum">Account details and settings.</p>
        </div>

        <div className="p-6 bg-card-bg border border-border-beige rounded space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-mono uppercase text-plum">Email Address</p>
              <p className="font-medium mt-1">{user?.email || "Not authenticated"}</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-plum">Role</p>
              <p className="font-medium mt-1 font-mono text-accent">{user?.role || "Guest"}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
