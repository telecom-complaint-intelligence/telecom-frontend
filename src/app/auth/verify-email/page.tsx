"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { ShieldCheck, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const { verifyOtp, resendOtp } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Timer states
  const [resendTimer, setResendTimer] = useState(120); // 120 seconds (2 minutes)
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start countdown timer on mount
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const digits = pastedData.split("").slice(0, 6);
    const newOtp = [...otp];
    
    digits.forEach((char, idx) => {
      newOtp[idx] = char;
    });
    
    setOtp(newOtp);

    // Focus the last filled input or the final input box
    const targetFocusIndex = Math.min(digits.length, 5);
    inputRefs.current[targetFocusIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const verified = await verifyOtp(emailParam, code);
      if (verified) {
        setSuccess("Email verified successfully! Redirecting...");
        setTimeout(() => {
          router.push("/auth/setup-profile");
        }, 1500);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Invalid code. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const sent = await resendOtp(emailParam);
      if (sent) {
        setSuccess("A new verification code has been generated. Please check your inbox!");
        setResendTimer(120);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to resend code.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 font-sans selection:bg-[#EAE1D9]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#EAE1D9] via-transparent to-transparent opacity-40 pointer-events-none" />
      
      <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-md border border-[#EBE6E0] rounded shadow-sm space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-[#1E0A2D]/5 flex items-center justify-center text-[#1E0A2D] mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-serif font-semibold text-[#1E0A2D]">Verify Your Email</h2>
          <p className="text-xs text-[#6E645E]">
            We sent a verification code to <span className="font-medium text-[#1E0A2D]">{emailParam || "your email"}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-serif border border-[#D5CFC9] rounded bg-white focus:outline-none focus:border-[#1E0A2D] focus:ring-1 focus:ring-[#1E0A2D] transition-all"
                disabled={loading}
                required
              />
            ))}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-100 rounded text-green-700 text-xs flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Spam folder warning notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-100 rounded text-amber-800 text-[11px] leading-relaxed space-y-1">
            <span className="font-semibold block">⚠️ Spam Directory Warning:</span>
            <p>If you don&apos;t see the email verification message in your inbox within a minute, please check your <strong>Spam</strong> or <strong>Junk mail</strong> folders.</p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.some(digit => !digit) || otp.join("").length !== 6}
            className="w-full py-3 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-xs font-semibold rounded shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>

        {/* Resend Action */}
        <div className="flex flex-col items-center gap-4 text-center border-t border-[#EBE6E0] pt-6">
          <div className="text-xs text-[#6E645E]">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-[#1E0A2D] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Resend Code
              </button>
            ) : (
              <span>Resend code in <strong className="text-[#1E0A2D] font-mono">{resendTimer}s</strong></span>
            )}
          </div>

          <Link href="/auth" className="text-xs text-[#8B7E74] hover:text-[#1E0A2D] transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
