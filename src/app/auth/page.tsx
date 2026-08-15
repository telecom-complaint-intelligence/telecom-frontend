"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Script from "next/script";
import { Eye, EyeOff } from "lucide-react";

// Extend global window interface to satisfy TypeScript check for Google Identity SDK
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

export default function AuthPage() {
  const router = useRouter();
  const { login, signup, members } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password criteria validators
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasValidLength = password.length >= 8 && password.length <= 15;
  const passwordsMatch = password === confirmPassword;

  const isPasswordValid = hasUpper && hasLower && hasNumber && hasSpecial && hasValidLength;
  const isSubmitDisabled = isSignUp 
    ? (!email.trim() || !password || !confirmPassword || !isPasswordValid || !passwordsMatch)
    : (!email.trim() || !password);

  // Delayed entrance triggers for left/right panels
  const [logoVisible] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // Typing animation parameters
  const fullText = "An AI-powered triage console built for Telu subscribers and network operators to automatically classify, prioritize, and resolve connectivity and billing issues in real time.";
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    // 400ms (0.4s): Header begins loading
    const headerTimer = setTimeout(() => setHeaderVisible(true), 400);

    // 1400ms (1.4s): Copyright footer begins loading (after header's 1-sec animation is complete)
    const footerTimer = setTimeout(() => setFooterVisible(true), 1400);

    // 600ms (0.6s): Typing starts
    const typingTimer = setTimeout(() => setTypingStarted(true), 600);

    // 600ms (0.6s): Right panel sign-in form begins loading
    const formTimer = setTimeout(() => setFormVisible(true), 600);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(footerTimer);
      clearTimeout(typingTimer);
      clearTimeout(formTimer);
    };
  }, []);

  useEffect(() => {
    if (!typingStarted) return;
    let idx = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.substring(0, idx + 1));
      idx++;
      if (idx >= fullText.length) {
        clearInterval(interval);
      }
    }, 36); // Typing interval (36ms per character, increased by 40% from 60ms)
    return () => clearInterval(interval);
  }, [typingStarted]);

  const [googleInitialized, setGoogleInitialized] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isPlaceholder = !clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID");

  // Initialize the real Google OAuth button
  const initializeGoogleSSO = () => {
    if (typeof window !== "undefined" && window.google && clientId && !isPlaceholder) {
      try {
        // Create the Token Client for OAuth2 access tokens requesting profile, addresses, and phone scopes
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/user.addresses.read https://www.googleapis.com/auth/user.phonenumbers.read",
          prompt: "consent",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setError("Google sign-in authorization failed.");
              return;
            }
            
            setLoading(true);
            setError("");
            try {
              // Send the real access_token to the backend
              const role = await login("", "customer", undefined, "google_oauth_access_token_flow", tokenResponse.access_token);
              if (rememberMe) {
                localStorage.setItem("telu_remember", "true");
              }
              if (role && role.startsWith("client")) {
                router.push("/client/dashboard");
              } else {
                router.push("/customer/dashboard");
              }
            } catch (err: unknown) {
              setError("Authentication failed on backend server.");
            } finally {
              setLoading(false);
            }
          },
        });

        // Save tokenClient to a global window reference for click dispatching
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any)._teluTokenClient = tokenClient;
        
        setTimeout(() => setGoogleInitialized(true), 0);
      } catch (err) {
        console.warn("Failed to initialize Google Sign-In SDK:", err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.google && !googleInitialized) {
      initializeGoogleSSO();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleInitialized]);

  // Load remember-me preferences
  useEffect(() => {
    const isRemembered = localStorage.getItem("telu_remember") === "true";
    if (isRemembered) {
      setTimeout(() => setRememberMe(true), 0);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up creates only customer accounts
        await signup(email, password);
        if (rememberMe) {
          localStorage.setItem("telu_remember", "true");
        }
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        // Credentials login captures role from backend
        const role = await login(email, "customer", password);
        if (rememberMe) {
          localStorage.setItem("telu_remember", "true");
        }
        
        if (role && role.startsWith("client")) {
          router.push("/client/dashboard");
        } else {
          router.push("/customer/dashboard");
        }
      }
    } catch (err: unknown) {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setLoading(true);
    setError("");
    
    // Simulate OAuth backend check:
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

  const handleGoogleClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any)._teluTokenClient) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)._teluTokenClient.requestAccessToken();
    } else {
      handleOAuth("Google");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Load Google Identity Services SDK Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initializeGoogleSSO}
        strategy="afterInteractive"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between p-16 bg-[#F5EFEB] border-r border-border-beige">
          {logoVisible ? (
            <div className="flex items-center gap-2 pl-2 animate-fade-in [animation-duration:1000ms]">
              <Image
                src="/TELU-LOGO.png"
                alt="Telu Logo"
                width={180}
                height={52}
                priority
                className="h-12 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="h-12" />
          )}

          <div className="space-y-6">
            {headerVisible ? (
              <h1 className="text-4xl font-serif font-light leading-tight animate-fade-in [animation-duration:1000ms]">
                Telecom triage, <br />
                <span className="font-normal italic text-accent">reimagined</span>.
              </h1>
            ) : (
              <div className="h-[96px]" />
            )}
            <p className="text-plum max-w-md text-base leading-relaxed font-sans min-h-[120px]">
              {typedText}
              {typingStarted && (
                <span className="text-accent font-bold animate-cursor-blink ml-0.5 text-lg">|</span>
              )}
            </p>
          </div>

          {footerVisible ? (
            <div className="text-[11px] font-mono text-plum/70 pl-2 animate-fade-in [animation-duration:1000ms]">
              © {new Date().getFullYear()} Telu Technologies Inc.
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>

        {/* Right Panel */}
        <div className="flex items-center justify-center p-8 bg-card-bg">
          {formVisible ? (
            <div className="w-full max-w-md space-y-8 animate-fade-in [animation-duration:1000ms]">
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-light text-foreground">
                  {isSignUp ? "Create your account" : "Welcome back"}
                </h2>
                <p className="text-plum text-sm">
                  {isSignUp ? "Already have an account?" : "New to Telu?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                    }}
                    className="font-medium text-accent hover:opacity-80 underline cursor-pointer transition-colors"
                  >
                    {isSignUp ? "Sign In" : "Create Account"}
                  </button>
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-plum uppercase tracking-wider">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-plum transition-colors"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-plum uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onPaste={(e) => e.preventDefault()}
                      onCopy={(e) => e.preventDefault()}
                      className="w-full pl-4 pr-10 py-3 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-plum transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-plum/60 hover:text-plum transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <>
                    <div className="text-[10px] space-y-1 bg-background p-3 border border-[#EBE6E0] rounded text-plum/85 font-sans leading-normal">
                      <p className="font-semibold text-plum uppercase text-[9px] tracking-wider mb-1.5">Password Requirements:</p>
                      <ul className="space-y-1">
                        <li className={hasValidLength ? "text-green-600 font-medium" : "text-plum/60"}>
                          {hasValidLength ? "✓" : "○"} 8 to 15 characters
                        </li>
                        <li className={hasUpper ? "text-green-600 font-medium" : "text-plum/60"}>
                          {hasUpper ? "✓" : "○"} At least one uppercase letter
                        </li>
                        <li className={hasLower ? "text-green-600 font-medium" : "text-plum/60"}>
                          {hasLower ? "✓" : "○"} At least one lowercase letter
                        </li>
                        <li className={hasNumber ? "text-green-600 font-medium" : "text-plum/60"}>
                          {hasNumber ? "✓" : "○"} At least one number
                        </li>
                        <li className={hasSpecial ? "text-green-600 font-medium" : "text-plum/60"}>
                          {hasSpecial ? "✓" : "○"} At least one special character
                        </li>
                      </ul>
                    </div>

                    {isPasswordValid && (
                      <div className="space-y-1.5 animate-fade-in">
                        <label className="text-xs font-mono text-plum uppercase tracking-wider">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onPaste={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            className="w-full pl-4 pr-10 py-3 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-plum transition-colors"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-plum/60 hover:text-plum transition-colors cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        </div>
                        {confirmPassword && (
                          <p className={`text-[10px] font-semibold ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                            {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => {
                        setRememberMe(e.target.checked);
                        if (!e.target.checked) {
                          localStorage.removeItem("telu_remember");
                        }
                      }}
                      className="w-4 h-4 rounded border-border-beige accent-plum focus:ring-plum"
                    />
                    <span className="text-xs text-plum font-sans">
                      Remember me on this device
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || isSubmitDisabled}
                  className="w-full py-3 bg-foreground text-background font-medium text-sm rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Authenticating..." : isSignUp ? "Create Customer Account" : "Sign In"}
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border-beige"></div>
                <span className="flex-shrink mx-4 text-xs font-mono text-plum uppercase">or continue with</span>
                <div className="flex-grow border-t border-border-beige"></div>
              </div>

              <div className="flex flex-col gap-4 items-center w-full">
                {!isPlaceholder ? (
                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    className="w-full px-4 py-3 border border-border-beige hover:bg-card-bg text-sm rounded flex items-center justify-center gap-3 font-medium transition-all shadow-sm active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.92 3.04C6.27 7.42 8.91 5.04 12 5.04z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.57l3.77 2.92c2.2-2.03 3.68-5.01 3.68-8.64z"/>
                      <path fill="#FBBC05" d="M5.31 10.6C5.06 11.27 4.9 12 4.9 12s.16.73.41 1.4l-3.92 3.04C.54 14.73 0 13.43 0 12s.54-2.73 1.39-4.44l3.92 3.04z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.77-2.92c-1.05.7-2.4 1.12-4.19 1.12-3.09 0-5.73-2.38-6.69-5.56l-3.92 3.04C3.37 20.35 7.35 23 12 23z"/>
                    </svg>
                    Sign in with Google
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                      type="button"
                      onClick={() => handleOAuth("Google")}
                      className="px-4 py-2 border border-border-beige hover:bg-card-bg text-sm rounded flex items-center justify-center gap-2"
                    >
                      Google (Simulated)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOAuth("Microsoft")}
                      className="px-4 py-2 border border-border-beige hover:bg-card-bg text-sm rounded flex items-center justify-center gap-2"
                    >
                      Microsoft (Simulated)
                    </button>
                  </div>
                )}
              </div>

              {isPlaceholder && (
                <p className="text-[11px] text-plum/70 text-center italic leading-relaxed">
                  Notice: Google SSO is running in mock mode. Enter your client email (e.g. admin@telu.com) to test client dashboards.
                </p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-md h-[400px]" />
          )}
        </div>
      </div>
    </div>
  );
}
