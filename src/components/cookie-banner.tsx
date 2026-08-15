"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { ShieldCheck, X } from "lucide-react";

export default function CookieBanner() {
  const { user, acceptCookieConsent } = useAuth();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner only if user is logged in and hasn't consented yet
    if (user && user.cookieConsent === false) {
      const consentCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("telu_cookie_consent="));
      if (!consentCookie) {
        setTimeout(() => setShowBanner(true), 1000);
      }
    } else {
      setTimeout(() => setShowBanner(false), 0);
    }
  }, [user]);

  const handleAccept = async () => {
    await acceptCookieConsent(true);
    // Write local cookie fallback
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
    document.cookie = `telu_cookie_consent=true; expires=${expires}; path=/; SameSite=Lax`;
    setShowBanner(false);
  };

  const handleDecline = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md bg-card-bg/95 backdrop-blur-md border border-border-beige p-6 rounded shadow-xl z-50 flex flex-col gap-4 font-sans animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <span className="h-10 w-10 rounded-full bg-accent-light flex items-center justify-center text-accent shrink-0">
          <ShieldCheck size={20} />
        </span>
        <div className="space-y-1">
          <h4 className="text-sm font-serif font-semibold text-foreground">Cookie Consent Policy</h4>
          <p className="text-xs text-plum leading-relaxed">
            We use secure session cookies to store your profile settings locally on your client browser, minimizing database traffic for a premium, fast experience.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDecline}
          className="text-plum/50 hover:text-plum p-1 rounded-full cursor-pointer transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={handleDecline}
          className="px-3.5 py-2 text-xs font-medium text-plum hover:text-foreground cursor-pointer transition-colors"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="px-4 py-2 text-xs font-semibold bg-[#1E0A2D] hover:bg-[#2F1442] text-white rounded cursor-pointer transition-all active:scale-95"
        >
          Accept Cookies
        </button>
      </div>
    </div>
  );
}
