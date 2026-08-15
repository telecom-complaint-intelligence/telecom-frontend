"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Image from "next/image";

export default function AuthPage() {
  const { login, signup, members } = useAuth();
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up creates only customer accounts
        await signup(email);
        if (rememberMe) {
          localStorage.setItem("telu_remember", "true");
        }
        router.push("/auth/setup-profile");
      } else {
        // Credentials login is only for customers
        await login(email, "customer");
        if (rememberMe) {
          localStorage.setItem("telu_remember", "true");
        }
        router.push("/customer/dashboard");
      }
    } catch (err: unknown) {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setLoading(true);
    
    // Simulate OAuth backend check:
    // If the email entered in the text box matches a registered client, we use that.
    // Otherwise, we use a generic mock email.
    const oauthEmail = email.trim() || `oauth.${provider.toLowerCase()}User@example.com`;
    
    // Determine the role based on the invitation/membership directory
    const existingMember = members.find(m => m.email.toLowerCase() === oauthEmail.toLowerCase());
    const role = existingMember ? existingMember.role : "customer";

    await login(oauthEmail, role);
    
    if (role.startsWith("client")) {
      router.push("/client/dashboard");
    } else {
      router.push("/customer/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between p-16 bg-[#F5EFEB] border-r border-border-beige">
          <div className="flex items-center gap-2 pl-2">
            <Image
              src="/TELU-LOGO.png"
              alt="Telu Logo"
              width={180}
              height={52}
              priority
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-serif font-light leading-tight">
              Telecom triage, <br />
              <span className="font-normal italic text-accent">reimagined</span>.
            </h1>
            <p className="text-plum max-w-md text-base leading-relaxed">
              An AI-powered triage console built for Telu subscribers and network operators to automatically classify, prioritize, and resolve connectivity and billing issues in real time.
            </p>
          </div>

          <div className="text-xs text-plum/60">
            © {new Date().getFullYear()} Telu Technology. All rights reserved.
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-serif font-normal tracking-tight">
                {isSignUp ? "Create account" : "Welcome back"}
              </h2>
              <p className="text-sm text-plum">
                {isSignUp
                  ? "Open a new customer account to register issues"
                  : "Access your dashboard to check resolution flow"}
              </p>
            </div>

            {/* Toggle tabs */}
            <div className="flex border-b border-border-beige">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
                className={`flex-1 pb-3 text-center text-sm font-medium border-b-2 transition-all ${
                  !isSignUp
                    ? "border-accent text-foreground"
                    : "border-transparent text-plum hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError("");
                }}
                className={`flex-1 pb-3 text-center text-sm font-medium border-b-2 transition-all ${
                  isSignUp
                    ? "border-accent text-foreground"
                    : "border-transparent text-plum hover:text-foreground"
                }`}
              >
                Sign Up (Customer)
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-plum" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-plum" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                  required={!isSignUp}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border-beige text-accent focus:ring-accent"
                />
                <label htmlFor="remember" className="text-xs text-plum cursor-pointer">
                  Remember me on this device
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-foreground text-background font-medium text-sm rounded hover:opacity-90 transition-opacity"
              >
                {loading ? "Authenticating..." : isSignUp ? "Create Customer Account" : "Sign In"}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border-beige"></div>
              <span className="flex-shrink mx-4 text-xs font-mono text-plum uppercase">or continue with</span>
              <div className="flex-grow border-t border-border-beige"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOAuth("Google")}
                className="px-4 py-2 border border-border-beige hover:bg-card-bg text-sm rounded flex items-center justify-center gap-2"
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("Microsoft")}
                className="px-4 py-2 border border-border-beige hover:bg-card-bg text-sm rounded flex items-center justify-center gap-2"
              >
                Microsoft
              </button>
            </div>

            <p className="text-[11px] text-plum text-center italic">
              Tip: Enter an invited client email (e.g. admin@telu.com) in the Email field before clicking OAuth to simulate client staff login, otherwise it defaults to customer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
