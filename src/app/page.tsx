"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [animationStep, setAnimationStep] = useState(0);

  // Sequential 1-second splash animation sequence:
  // - 100ms: Fade in "Telu" Logo
  // - 450ms: Fade in "Establishing secure channel..." subtext
  // - 1100ms: Smoothly fade out everything
  // - 1450ms: Redirect to next auth stage
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStep(1), 100);
    const timer2 = setTimeout(() => setAnimationStep(2), 450);
    const timer3 = setTimeout(() => setAnimationStep(3), 1100);

    const redirectTimer = setTimeout(() => {
      if (!loading) {
        if (user) {
          if (user.role.startsWith("client")) {
            router.replace("/client/dashboard");
          } else {
            router.replace("/customer/dashboard");
          }
        } else {
          router.replace("/auth");
        }
      }
    }, 1450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(redirectTimer);
    };
  }, [user, loading, router]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-background text-foreground transition-opacity duration-300">
      <div className={`flex flex-col items-center gap-4 transition-all duration-500 transform ${animationStep === 3 ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
        {/* Telu Logo */}
        <div 
          className={`text-3xl font-serif tracking-tight text-accent transition-all duration-700 transform ${
            animationStep >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          Telu
        </div>
        
        {/* Subtext message */}
        <div 
          className={`text-xs font-mono text-plum/60 transition-all duration-700 transform ${
            animationStep >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          Establishing secure channel...
        </div>
      </div>
    </div>
  );
}
