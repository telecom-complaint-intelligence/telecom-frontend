"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
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
  }, [user, loading, router]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="text-xl font-serif tracking-tight text-accent animate-pulse">Telu</div>
        <div className="text-sm font-sans text-plum/60">Establishing secure channel...</div>
      </div>
    </div>
  );
}
