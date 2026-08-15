"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { X } from "lucide-react";

interface MembersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembersSidebar: React.FC<MembersSidebarProps> = ({ isOpen, onClose }) => {
  const { members, inviteMember } = useAuth();
  const [email, setEmail] = useState("");
  const [tempPass, setTempPass] = useState("");
  const [department, setDepartment] = useState("Operations");
  const [generatedLink, setGeneratedLink] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !tempPass || !department) return;

    inviteMember(email, tempPass, department);

    // Build the invitation activation link
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/auth/activate?email=${encodeURIComponent(email)}&dept=${encodeURIComponent(department)}`;
    setGeneratedLink(link);

    setSuccessMsg(`Invitation registered! Send the link below to activate the account.`);
    setEmail("");
    setTempPass("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      <div className="w-full max-w-md h-full bg-background border-l border-border-beige flex flex-col p-6 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border-beige pb-4 mb-6">
          <h2 className="text-xl font-serif font-semibold text-foreground">Members & Staff</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-plum hover:text-foreground p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Invitation Form */}
        <div className="bg-[#F5EFEB] border border-border-beige p-4 rounded mb-6 space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-accent">Invite Client Staff</h3>
          
          {successMsg && (
            <div className="p-3 bg-purple-50 text-accent text-xs rounded border border-purple-200 break-all space-y-2">
              <p>{successMsg}</p>
              {generatedLink && (
                <div className="mt-1">
                  <span className="font-mono text-[11px] block bg-white p-2 rounded border border-border-beige select-all">
                    {generatedLink}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      alert("Activation link copied to clipboard!");
                    }}
                    className="text-[11px] underline text-accent font-semibold mt-1 cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-plum block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@telu.com"
                className="w-full px-3 py-2 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-plum block mb-1">Temporary Password</label>
              <input
                type="text"
                required
                value={tempPass}
                onChange={(e) => setTempPass(e.target.value)}
                placeholder="TempPass123!"
                className="w-full px-3 py-2 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-plum block mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
              >
                <option value="Operations">Operations</option>
                <option value="Billing">Billing</option>
                <option value="Network">Network</option>
                <option value="Support">Support</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-accent text-white rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Register & Generate Link
            </button>
          </form>
        </div>

        {/* Members List */}
        <div className="flex-1 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-plum">Existing Members</h3>
          <div className="space-y-3">
            {members.map((member, idx) => (
              <div
                key={idx}
                className="p-3 bg-card-bg border border-border-beige rounded flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{member.email}</p>
                  <p className="text-xs text-plum font-mono">
                    {member.department} · {member.role}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                    member.status === "Active"
                      ? "bg-purple-100 text-accent"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
