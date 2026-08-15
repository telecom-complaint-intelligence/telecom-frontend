"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function ActivationContainer() {
  const { activateClient } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("Invitation token is missing. Please check the link sent in your email.");
      return;
    }

    const performActivation = async () => {
      try {
        const success = await activateClient(token);
        if (success) {
          setStatus("success");
          setTimeout(() => {
            router.push("/auth");
          }, 3500);
        } else {
          setStatus("error");
          setErrorMsg("This invitation link is invalid or has expired. Please contact your system administrator.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg("Failed to connect to the authentication server. Please try again later.");
      }
    };

    performActivation();
  }, [token, activateClient, router]);

  return (
    <div className="w-full max-w-md p-8 bg-card-bg border border-border-beige rounded shadow-sm flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
      {status === "verifying" && (
        <div className="space-y-4">
          <Loader2 className="h-12 w-12 text-[#6C5CE7] animate-spin mx-auto" />
          <h2 className="text-xl font-serif">Verifying Invitation...</h2>
          <p className="text-sm text-plum">
            Please wait while we validate your activation token with the security server.
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto animate-bounce" />
          <h2 className="text-xl font-serif text-green-900">Account Activated!</h2>
          <p className="text-sm text-plum">
            Your client operations account has been successfully configured.
          </p>
          <p className="text-xs text-plum/70 bg-[#FDFBF7] p-3 border border-[#EBE6E0] rounded">
            You will be automatically redirected to the sign-in page to log in using your Google account.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <XCircle className="h-12 w-12 text-red-600 mx-auto" />
          <h2 className="text-xl font-serif text-red-950">Activation Failed</h2>
          <p className="text-sm text-red-700 leading-relaxed">{errorMsg}</p>
          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="px-6 py-2 bg-[#1E0A2D] text-white text-xs font-semibold rounded hover:bg-[#2F1442] transition-colors cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default function ActivatePage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground items-center justify-center p-8">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-plum animate-spin" />
          <span className="text-sm font-mono text-plum">Loading activation portal...</span>
        </div>
      }>
        <ActivationContainer />
      </Suspense>
    </div>
  );
}
