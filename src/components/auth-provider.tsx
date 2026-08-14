"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  email: string;
  role: string; // "customer" | "client"
  department?: string;
  isProfileComplete?: boolean;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  stateVal?: string;
  country?: string;
  zipcode?: string;
  planUsage?: "self" | "shop" | "organization";
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
  login: (email: string, role: string) => Promise<boolean>;
  signup: (email: string) => Promise<boolean>;
  logout: () => void;
  inviteMember: (email: string, tempPass: string, department: string) => void;
  activateClientAccount: (email: string, pass: string, department: string) => Promise<boolean>;
  updateProfile: (details: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial mock members load
  useEffect(() => {
    const storedUser = localStorage.getItem("telu_user");
    const storedToken = localStorage.getItem("telu_token");
    const storedMembers = localStorage.getItem("telu_members");

    const timer = setTimeout(() => {
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }

      if (storedMembers) {
        setMembers(JSON.parse(storedMembers));
      } else {
        const defaultMembers: Member[] = [
          { email: "admin@telu.com", department: "Operations", role: "client", status: "Active" },
          { email: "support.billing@telu.com", department: "Billing", role: "client", status: "Active" },
          { email: "support.network@telu.com", department: "Network", role: "client", status: "Active" },
        ];
        setMembers(defaultMembers);
        localStorage.setItem("telu_members", JSON.stringify(defaultMembers));
      }
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, role: string): Promise<boolean> => {
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockToken..." + Math.random().toString(36).substring(7);
    
    // Check if profile exists for this email
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
    localStorage.setItem("telu_user", JSON.stringify(loggedInUser));
    localStorage.setItem("telu_token", mockToken);
    return true;
  };

  const signup = async (email: string): Promise<boolean> => {
    localStorage.removeItem(`telu_profile_${email}`);
    return login(email, "customer");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("telu_user");
    localStorage.removeItem("telu_token");
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

  const updateProfile = (details: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...details, isProfileComplete: true };
    setUser(updatedUser);
    localStorage.setItem("telu_user", JSON.stringify(updatedUser));
    localStorage.setItem(`telu_profile_${user.email}`, JSON.stringify(updatedUser));
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
