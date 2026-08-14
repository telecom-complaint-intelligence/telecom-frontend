"use client";

import React, { useState } from "react";
import { Users, User, Copy, X, Plus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function TeamsPage() {
  const { members, inviteMember } = useAuth();
  
  // Modal toggle state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
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

    setSuccessMsg(`Invitation registered! Copy and send the link below:`);
    setEmail("");
    setTempPass("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSuccessMsg("");
    setGeneratedLink("");
  };

  // Static initial operators list
  const defaultOperators = [
    { name: "Arjun Kumar", email: "admin@telu.com", department: "Operations", load: 8, status: "Online" },
    { name: "Priya Sharma", email: "support.billing@telu.com", department: "Billing", load: 5, status: "Online" },
    { name: "Nithya B.", email: "support.network@telu.com", department: "Network", load: 6, status: "Busy" },
  ];

  // Dynamic active/pending members list from Auth context
  const dynamicMembers = members.filter(m => !defaultOperators.some(op => op.email === m.email));

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto relative">
      <div className="border-b border-border-beige pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
            <Users size={28} className="text-accent" />
            Teams & Operators
          </h1>
          <p className="text-sm text-plum">View agent workloads, shifts, and register new client staff.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-accent hover:opacity-90 text-white text-sm font-medium rounded flex items-center gap-2 transition-opacity cursor-pointer shadow-sm"
        >
          <Plus size={16} /> Invite Staff
        </button>
      </div>

      {/* Grid: Full Width Operator & Workload cards */}
      <div className="space-y-6">
        <h2 className="text-lg font-serif font-semibold">Active Operators & Workloads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* List hardcoded default operators */}
          {defaultOperators.map((op, idx) => {
            const loadPercentage = Math.min(100, Math.round((op.load / 15) * 100));
            return (
              <div key={idx} className="p-6 bg-card-bg border border-border-beige rounded shadow-sm space-y-4 hover:border-plum transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent-light flex items-center justify-center text-accent">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{op.name}</h3>
                    <p className="text-xs text-plum font-mono">{op.email}</p>
                  </div>
                </div>

                <div className="divide-y divide-border-beige text-xs pt-2">
                  <div className="py-2.5 flex justify-between">
                    <span className="font-mono text-plum uppercase">Department</span>
                    <span className="font-semibold">{op.department}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="font-mono text-plum uppercase">Status</span>
                    <span className="font-semibold font-mono text-[10px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded">
                      ONLINE
                    </span>
                  </div>
                  <div className="py-2.5 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-mono text-plum uppercase">Workload</span>
                      <span className="font-mono text-[11px]">{op.load} / 15 Tickets ({loadPercentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded bg-border-beige overflow-hidden">
                      <div
                        className={`h-full ${
                          loadPercentage >= 80 ? "bg-red-500" : loadPercentage >= 50 ? "bg-amber-500" : "bg-accent"
                        }`}
                        style={{ width: `${loadPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* List invited members from state */}
          {dynamicMembers.map((member, idx) => (
            <div key={idx} className="p-6 bg-card-bg border border-border-beige rounded shadow-sm space-y-4 hover:border-plum transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent-light flex items-center justify-center text-accent font-serif">
                  {member.email.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{member.email}</h3>
                  <p className="text-xs text-plum font-mono">Invited Account</p>
                </div>
              </div>

              <div className="divide-y divide-border-beige text-xs pt-2">
                <div className="py-2.5 flex justify-between">
                  <span className="font-mono text-plum uppercase">Department</span>
                  <span className="font-semibold">{member.department}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-mono text-plum uppercase">Status</span>
                  <span
                    className={`font-semibold font-mono text-[10px] px-2 py-0.5 rounded ${
                      member.status === "Active"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {member.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-background border border-border-beige p-6 rounded shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-beige pb-3">
              <h2 className="text-lg font-serif font-semibold text-foreground">Invite Client Staff</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-plum hover:text-foreground p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-purple-50 text-accent text-xs rounded border border-purple-200 break-all space-y-2">
                <p className="font-semibold">{successMsg}</p>
                {generatedLink && (
                  <div className="mt-1">
                    <span className="font-mono text-[10px] block bg-white p-2 rounded border border-border-beige select-all">
                      {generatedLink}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLink);
                        alert("Activation link copied to clipboard!");
                      }}
                      className="text-[11px] underline text-accent font-semibold mt-1 flex items-center gap-1 cursor-pointer"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-plum block">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@telu.com"
                  className="w-full px-4 py-2 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-plum block">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={tempPass}
                  onChange={(e) => setTempPass(e.target.value)}
                  placeholder="TempPass123!"
                  className="w-full px-4 py-2 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-plum block">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                >
                  <option value="Operations">Operations</option>
                  <option value="Billing">Billing</option>
                  <option value="Network">Network</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-accent text-white rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Register & Generate Link
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
