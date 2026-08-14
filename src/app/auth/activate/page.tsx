"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

function ActivationForm() {
  const { activateClientAccount } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email") || "";
  const department = searchParams.get("dept") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await activateClientAccount(email, password, department);
      router.push("/client/dashboard");
    } catch (err) {
      setError("Activation failed. Please check the link or contact your administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-card-bg border border-border-beige rounded shadow-sm space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-serif tracking-tight">Activate Account</h1>
        <p className="text-sm text-plum">
          Complete the activation for your <span className="font-semibold text-accent">client-{department.toLowerCase()}</span> role.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleActivate} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-plum">Email Address</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 bg-background border border-border-beige rounded text-sm text-plum/70 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-plum">Department</label>
          <input
            type="text"
            value={department}
            disabled
            className="w-full px-4 py-3 bg-background border border-border-beige rounded text-sm text-plum/70 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-plum" htmlFor="new-pass">
            Set Password
          </label>
          <input
            id="new-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-plum" htmlFor="confirm-pass">
            Confirm Password
          </label>
          <input
            id="confirm-pass"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 bg-accent text-white font-medium text-sm rounded hover:opacity-90 transition-opacity"
        >
          {loading ? "Activating..." : "Activate Client Account"}
        </button>
      </form>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground items-center justify-center p-8">
      <Suspense fallback={<div className="text-sm font-mono text-plum animate-pulse">Loading invitation details...</div>}>
        <ActivationForm />
      </Suspense>
    </div>
  );
}
