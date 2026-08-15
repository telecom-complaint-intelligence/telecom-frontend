"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id?: string;
  email: string;
  role: string; // "customer" | "client" | "client-operations" etc.
  department?: string;
  isProfileComplete?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  profilePicture?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  stateVal?: string;
  country?: string;
  zipcode?: string;
  planUsage?: "self" | "shop" | "organization";
  cookieConsent?: boolean;
  accountRef?: string;
  billCycle?: string;
  activePlan?: string;
  connectionStatus?: string;
  createdAt?: string;
}

export interface Member {
  email: string;
  department: string;
  role: string;
  status: "Active" | "Pending";
  tempPass?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  members: Member[];
  login: (email: string, role: string, password?: string, googleIdToken?: string, googleAccessToken?: string) => Promise<string | null>;
  signup: (email: string, password?: string) => Promise<string | null>;
  logout: () => void;
  inviteMember: (email: string, tempPass: string, department: string) => void;
  activateClientAccount: (email: string, pass: string, department: string) => Promise<boolean>;
  updateProfile: (details: Partial<User>) => Promise<boolean>;
  updateServiceDetails: (details: { accountRef: string; billCycle: string; activePlan: string; connectionStatus: string; planUsage: string; }) => Promise<boolean>;
  acceptCookieConsent: (consent: boolean) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_API_URL = "http://localhost:8000/api";

// Lightweight cookie helpers
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Restore user session from browser cookies on mount
  useEffect(() => {
    const storedUser = getCookie("telu_user");
    const storedToken = getCookie("telu_token");
    const storedMembers = localStorage.getItem("telu_members");

    setTimeout(() => {
      if (storedMembers) {
        setMembers(JSON.parse(storedMembers));
      } else {
        setMembers([]);
        localStorage.setItem("telu_members", JSON.stringify([]));
      }
    }, 0);

    const checkSession = async () => {
      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const response = await fetch(`${BACKEND_API_URL}/auth/verify-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: parsedUser.email }),
          });

          if (response.ok) {
            const data = await response.json();
            const verifiedUser: User = {
              id: data.user.id,
              email: data.user.email,
              role: data.user.role,
              isProfileComplete: data.user.isProfileComplete,
              emailVerified: data.user.emailVerified,
              phoneVerified: data.user.phoneVerified,
              profilePicture: data.user.profilePicture,
              name: data.user.name,
              phone: data.user.phone,
              address: data.user.address,
              city: data.user.city,
              stateVal: data.user.stateVal,
              country: data.user.country,
              zipcode: data.user.zipcode,
              planUsage: data.user.planUsage,
              cookieConsent: data.user.cookieConsent,
              accountRef: data.user.accountRef,
              billCycle: data.user.billCycle,
              activePlan: data.user.activePlan,
              connectionStatus: data.user.connectionStatus,
              createdAt: data.user.createdAt
            };
            setTimeout(() => {
              setUser(verifiedUser);
              setToken(storedToken);
            }, 0);
            setCookie("telu_user", JSON.stringify(verifiedUser));
          } else {
            // Session no longer exists in backend DB (e.g. database truncated)
            setTimeout(() => {
              setUser(null);
              setToken(null);
            }, 0);
            deleteCookie("telu_user");
            deleteCookie("telu_token");
          }
        } catch {
          // Network unreachable, use cached cookie data offline
          setTimeout(() => {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          }, 0);
        }
      }
      setTimeout(() => {
        setLoading(false);
      }, 0);
    };

    checkSession();
  }, []);

  const login = async (email: string, role: string, password?: string, googleIdToken?: string, googleAccessToken?: string): Promise<string | null> => {
    try {
      let response;
      if (googleIdToken) {
        // Google OAuth Sign In
        response = await fetch(`${BACKEND_API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: googleIdToken, access_token: googleAccessToken }),
        });
      } else {
        // Standard JWT Credentials Login
        response = await fetch(`${BACKEND_API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: password || "password123" }),
        });
      }

      if (response) {
        if (response.ok) {
          const data = await response.json();
          const loggedInUser: User = {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            isProfileComplete: data.user.isProfileComplete,
            emailVerified: data.user.emailVerified,
            phoneVerified: data.user.phoneVerified,
            profilePicture: data.user.profilePicture,
            name: data.user.name,
            phone: data.user.phone,
            address: data.user.address,
            city: data.user.city,
            stateVal: data.user.stateVal,
            country: data.user.country,
            zipcode: data.user.zipcode,
            planUsage: data.user.planUsage,
            cookieConsent: data.user.cookieConsent,
            accountRef: data.user.accountRef,
            billCycle: data.user.billCycle,
            activePlan: data.user.activePlan,
            connectionStatus: data.user.connectionStatus,
            createdAt: data.user.createdAt
          };

          setUser(loggedInUser);
          setToken(data.token);
          setCookie("telu_user", JSON.stringify(loggedInUser));
          setCookie("telu_token", data.token);
          return loggedInUser.role;
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "Unauthorized: Invalid email or password.");
        }
      }
    } catch (err: unknown) {
      console.warn("Backend auth error:", err);
      const error = err as Error;
      if (error.message && (error.message.includes("Unauthorized") || error.message.includes("exists") || error.message.includes("Invalid") || error.message.includes("not found"))) {
        throw error;
      }
    }

    // --- FALLBACK MOCK LOGIN (if backend is down/unreachable network) ---
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockToken..." + Math.random().toString(36).substring(7);
    const storedProfile = localStorage.getItem(`telu_profile_${email}`);
    const hasProfile = storedProfile ? JSON.parse(storedProfile).isProfileComplete : (role === "client" ? true : false);

    const loggedInUser: User = { 
      email, 
      role,
      isProfileComplete: hasProfile,
      ...(storedProfile ? JSON.parse(storedProfile) : {})
    };

    setUser(loggedInUser);
    setToken(mockToken);
    setCookie("telu_user", JSON.stringify(loggedInUser));
    setCookie("telu_token", mockToken);
    return loggedInUser.role;
  };

  const signup = async (email: string, password?: string): Promise<string | null> => {
    localStorage.removeItem(`telu_profile_${email}`);
    
    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "password123" }),
      });

      if (response.ok) {
        const data = await response.json();
        const loggedInUser: User = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          isProfileComplete: data.user.isProfileComplete,
          emailVerified: data.user.emailVerified,
          phoneVerified: data.user.phoneVerified,
          cookieConsent: data.user.cookieConsent,
          createdAt: data.user.createdAt
        };

        setUser(loggedInUser);
        setToken(data.token);
        setCookie("telu_user", JSON.stringify(loggedInUser));
        setCookie("telu_token", data.token);
        return loggedInUser.role;
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Registration failed.");
      }
    } catch (err: unknown) {
      console.warn("Backend registration error:", err);
      const error = err as Error;
      if (error.message && (error.message.includes("exists") || error.message.includes("failed") || error.message.includes("Registration"))) {
        throw error;
      }
    }

    // Fallback registration (only if network is fully down)
    return login(email, "customer", password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    deleteCookie("telu_user");
    deleteCookie("telu_token");
  };

  const inviteMember = (email: string, tempPass: string, department: string) => {
    const newMember: Member = {
      email,
      department,
      role: `client-${department.toLowerCase()}`,
      status: "Pending",
      tempPass
    };
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    localStorage.setItem("telu_members", JSON.stringify(updatedMembers));
  };

  const activateClientAccount = async (email: string, pass: string, department: string): Promise<boolean> => {
    const updatedMembers = members.map(m => {
      if (m.email === email) {
        return { ...m, status: "Active" as const, tempPass: undefined };
      }
      return m;
    });

    setMembers(updatedMembers);
    localStorage.setItem("telu_members", JSON.stringify(updatedMembers));

    await login(email, `client-${department.toLowerCase()}`);
    return true;
  };

  const updateProfile = async (details: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/complete-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: details.name || user.name || "",
          phone: details.phone || user.phone || "",
          address: details.address || user.address || "",
          city: details.city || user.city || "",
          state_val: details.stateVal || user.stateVal || "",
          country: details.country || user.country || "",
          zipcode: details.zipcode || user.zipcode || "",
          plan_usage: details.planUsage || user.planUsage || "self"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = {
          ...user,
          id: data.user.id,
          name: data.user.name,
          phone: data.user.phone,
          address: data.user.address,
          city: data.user.city,
          stateVal: data.user.stateVal,
          country: data.user.country,
          zipcode: data.user.zipcode,
          planUsage: data.user.planUsage,
          isProfileComplete: data.user.isProfileComplete,
          emailVerified: data.user.emailVerified,
          phoneVerified: data.user.phoneVerified,
          profilePicture: data.user.profilePicture,
          createdAt: data.user.createdAt
        };
        setUser(updatedUser);
        setCookie("telu_user", JSON.stringify(updatedUser));
        return true;
      }
    } catch (err) {
      console.warn("Backend auth server unreachable, updating profile in local cache only:", err);
    }

    // Fallback profile update
    const updatedUser = { ...user, ...details, isProfileComplete: true };
    setUser(updatedUser);
    setCookie("telu_user", JSON.stringify(updatedUser));
    return true;
  };

  const updateServiceDetails = async (details: { accountRef: string; billCycle: string; activePlan: string; connectionStatus: string; planUsage: string; }): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/service-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          account_ref: details.accountRef,
          bill_cycle: details.billCycle,
          active_plan: details.activePlan,
          connection_status: details.connectionStatus,
          plan_usage: details.planUsage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = {
          ...user,
          accountRef: data.user.accountRef,
          billCycle: data.user.billCycle,
          activePlan: data.user.activePlan,
          connectionStatus: data.user.connectionStatus,
          planUsage: data.user.planUsage
        };
        setUser(updatedUser);
        setCookie("telu_user", JSON.stringify(updatedUser));
        return true;
      }
    } catch (err) {
      console.warn("Failed to save service details to database:", err);
    }
    return false;
  };

  const acceptCookieConsent = async (consent: boolean): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/cookie-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          consent: consent
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = {
          ...user,
          cookieConsent: data.user.cookieConsent
        };
        setUser(updatedUser);
        setCookie("telu_user", JSON.stringify(updatedUser));
        return true;
      }
    } catch (err) {
      console.warn("Failed to save cookie consent to database:", err);
    }
    return false;
  };

  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser: User = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          isProfileComplete: data.user.isProfileComplete,
          emailVerified: data.user.emailVerified,
          phoneVerified: data.user.phoneVerified,
          profilePicture: data.user.profilePicture,
          name: data.user.name,
          phone: data.user.phone,
          address: data.user.address,
          city: data.user.city,
          stateVal: data.user.stateVal,
          country: data.user.country,
          zipcode: data.user.zipcode,
          planUsage: data.user.planUsage,
          cookieConsent: data.user.cookieConsent,
          accountRef: data.user.accountRef,
          billCycle: data.user.billCycle,
          activePlan: data.user.activePlan,
          connectionStatus: data.user.connectionStatus,
          createdAt: data.user.createdAt
        };

        setUser(updatedUser);
        setCookie("telu_user", JSON.stringify(updatedUser));
        return true;
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Verification failed.");
      }
    } catch (err) {
      console.warn("OTP verification error:", err);
      throw err;
    }
  };

  const resendOtp = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        return true;
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Resending OTP failed.");
      }
    } catch (err) {
      console.warn("OTP resending error:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        members,
        login,
        signup,
        logout,
        inviteMember,
        activateClientAccount,
        updateProfile,
        updateServiceDetails,
        acceptCookieConsent,
        verifyOtp,
        resendOtp,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
