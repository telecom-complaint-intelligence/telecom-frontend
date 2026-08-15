"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { Users, User, X, Plus, Building, Send, ShieldCheck, Search, Pencil, Trash2, Check } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface Operator {
  id: string;
  name: string;
  email: string;
  department: string;
  status: string;
}

export default function TeamsPage() {
  const {
    inviteClient,
    getDepartments,
    createDepartment,
    getOperators,
    updateDepartment,
    deleteDepartment,
    updateOperator,
    deleteOperator,
    user
  } = useAuth();

  // Determine if Master Admin (client role with no department mapping)
  const isMasterAdmin = user?.role === "client" && !user?.department;

  // Modal toggle state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [tempPass, setTempPass] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [newDeptName, setNewDeptName] = useState("");

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");

  // Edit states for operators and departments
  const [editingOperatorId, setEditingOperatorId] = useState<string | null>(null);
  const [editOpDeptId, setEditOpDeptId] = useState("");
  
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState("");

  const [departments, setDepartments] = useState<{ id: string; name: string; }[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Load departments
  const loadDepts = React.useCallback(async () => {
    const data = await getDepartments();
    setDepartments(data);
    if (data.length > 0) {
      setSelectedDeptId(prev => prev || data[0].id);
    }
  }, [getDepartments]);

  // Load operators
  const loadOperatorsList = React.useCallback(async () => {
    const data = await getOperators();
    setOperators(data);
  }, [getOperators]);

  useEffect(() => {
    if (user) {
      loadDepts();
      loadOperatorsList();
    }
  }, [user, loadDepts, loadOperatorsList]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !tempPass || !selectedDeptId) return;
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const ok = await inviteClient(email, tempPass, selectedDeptId);
      if (ok) {
        setSuccessMsg(`✓ Invitation successfully registered for ${email}! An activation link has been dispatched.`);
        setEmail("");
        setTempPass("");
        await loadOperatorsList();
      } else {
        setErrorMsg("Failed to invite client. Email may already be registered or invalid.");
      }
    } catch (err) {
      setErrorMsg("An error occurred while sending invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const ok = await createDepartment(newDeptName.trim());
      if (ok) {
        setNewDeptName("");
        await loadDepts();
      } else {
        setErrorMsg("Failed to create department. Name may already exist.");
      }
    } catch (err) {
      setErrorMsg("Error creating department.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDeptName = async (deptId: string) => {
    if (!editDeptName.trim()) return;
    try {
      const ok = await updateDepartment(deptId, editDeptName.trim());
      if (ok) {
        setEditingDeptId(null);
        await loadDepts();
        await loadOperatorsList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDeptObj = async (deptId: string) => {
    if (!confirm("Are you sure you want to delete this department? Associated operators will be unmapped.")) return;
    try {
      const ok = await deleteDepartment(deptId);
      if (ok) {
        await loadDepts();
        await loadOperatorsList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOperatorDept = async (opId: string) => {
    try {
      const ok = await updateOperator(opId, editOpDeptId || null);
      if (ok) {
        setEditingOperatorId(null);
        await loadOperatorsList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOperatorObj = async (opId: string) => {
    if (!confirm("Are you sure you want to archive/delete this operator from the team?")) return;
    try {
      const ok = await deleteOperator(opId);
      if (ok) {
        await loadOperatorsList();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSuccessMsg("");
    setErrorMsg("");
  };

  // Filter & Search Logic
  const filteredOperators = operators.filter(op => {
    const matchesSearch = 
      op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.department.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDept = 
      selectedDeptFilter === "ALL" || 
      op.department.toLowerCase() === selectedDeptFilter.toLowerCase();
      
    return matchesSearch && matchesDept;
  });

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-6xl w-full mx-auto relative font-sans">
      <div className="border-b border-border-beige pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
            <Users size={28} className="text-accent" />
            Teams & Operators
          </h1>
          <p className="text-sm text-plum">View operational departments, search team members, and invite client staff.</p>
        </div>
        {isMasterAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="px-4 py-2.5 border border-border-beige hover:bg-[#F5EFEB] text-plum text-sm font-semibold rounded flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Building size={16} /> Manage Departments
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-accent hover:opacity-90 text-white text-sm font-medium rounded flex items-center gap-2 transition-opacity cursor-pointer shadow-sm"
            >
              <Plus size={16} /> Invite Client Staff
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Strip */}
      <div className="flex flex-col md:flex-row bg-card-bg p-4 border border-border-beige rounded shadow-sm justify-between items-start md:items-center gap-4 animate-fade-in">
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3 top-3 text-plum" />
          <input
            type="text"
            placeholder="Search operators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-mono text-plum mr-1">Filter Department:</span>
          <button
            onClick={() => setSelectedDeptFilter("ALL")}
            className={`text-[10px] font-mono font-medium px-3 py-1 rounded-full border transition-all cursor-pointer ${
              selectedDeptFilter === "ALL"
                ? "bg-accent text-white border-accent shadow-sm"
                : "bg-accent-light text-accent border-purple-200 hover:bg-[#F5EFEB]"
            }`}
          >
            ALL
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptFilter(dept.name)}
              className={`text-[10px] font-mono font-medium px-3 py-1 rounded-full border transition-all cursor-pointer ${
                selectedDeptFilter.toLowerCase() === dept.name.toLowerCase()
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "bg-accent-light text-accent border-purple-200 hover:bg-[#F5EFEB]"
              }`}
            >
              {dept.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Full Width Operator cards */}
      <div className="space-y-6">
        <h2 className="text-lg font-serif font-semibold">Active Operators & Team Members</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOperators.length > 0 ? (
            filteredOperators.map((op, idx) => (
              <div key={idx} className="p-6 bg-card-bg border border-border-beige rounded shadow-sm space-y-4 hover:border-plum transition-all animate-fade-in relative group">
                {/* Master Admin Controls */}
                {isMasterAdmin && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingOperatorId(op.id);
                        const match = departments.find(d => d.name === op.department);
                        setEditOpDeptId(match ? match.id : "");
                      }}
                      className="p-1 border border-border-beige hover:bg-[#F5EFEB] text-plum hover:text-accent rounded cursor-pointer"
                      title="Edit Department"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteOperatorObj(op.id)}
                      className="p-1 border border-red-100 hover:bg-red-50 text-red-500 hover:text-red-700 rounded cursor-pointer"
                      title="Delete Operator"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

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
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-mono text-plum uppercase">Department</span>
                    {editingOperatorId === op.id ? (
                      <div className="flex items-center gap-1">
                        <select
                          value={editOpDeptId}
                          onChange={(e) => setEditOpDeptId(e.target.value)}
                          className="px-2 py-1 bg-background border border-border-beige rounded text-xs focus:outline-none focus:border-accent cursor-pointer"
                        >
                          <option value="">Unmapped</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateOperatorDept(op.id)}
                          className="p-1 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded cursor-pointer"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={() => setEditingOperatorId(null)}
                          className="p-1 border border-border-beige hover:bg-[#F5EFEB] text-plum rounded cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold">{op.department}</span>
                    )}
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="font-mono text-plum uppercase">Status</span>
                    <span
                      className={`font-semibold font-mono text-[10px] px-2 py-0.5 rounded ${
                        op.status === "Active"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {op.status === "Active" ? "VERIFIED" : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center bg-card-bg border border-border-beige rounded shadow-sm text-plum font-serif text-sm flex flex-col items-center justify-center gap-2 animate-fade-in">
              <Users size={24} className="text-plum/60" />
              <span>No operators match your criteria.</span>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
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
              <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200 flex items-start gap-2">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <p>{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                <p>{errorMsg}</p>
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
                  className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
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
                  className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-plum block">Department Mapping</label>
                {departments.length > 0 ? (
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-red-500 font-semibold p-2 bg-red-50 border border-red-100 rounded">
                    Please create a department first before inviting staff.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || departments.length === 0}
                className="w-full py-3 bg-accent text-white rounded text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={14} /> {loading ? "Inviting..." : "Send Invitation Code"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-background border border-border-beige p-6 rounded shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-beige pb-3">
              <h2 className="text-lg font-serif font-semibold text-foreground">Manage Operations Departments</h2>
              <button
                type="button"
                onClick={() => {
                  setIsDeptModalOpen(false);
                  setErrorMsg("");
                  setEditingDeptId(null);
                }}
                className="text-plum hover:text-foreground p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                <p>{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleCreateDept} className="flex gap-2">
              <input
                type="text"
                required
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g. Network Triage"
                className="flex-grow px-4 py-2 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={loading || !newDeptName.trim()}
                className="px-4 py-2 bg-accent hover:opacity-90 text-white text-xs font-semibold rounded transition-opacity cursor-pointer disabled:opacity-50"
              >
                Add
              </button>
            </form>

            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-mono text-plum uppercase">Existing Departments</h3>
              <div className="max-h-48 overflow-y-auto divide-y divide-border-beige border border-border-beige rounded">
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <div key={dept.id} className="p-3 text-sm flex items-center justify-between bg-card-bg group/dept">
                      {editingDeptId === dept.id ? (
                        <div className="flex items-center gap-1.5 flex-grow">
                          <input
                            type="text"
                            value={editDeptName}
                            onChange={(e) => setEditDeptName(e.target.value)}
                            className="flex-grow px-2 py-1 bg-background border border-border-beige rounded text-xs focus:outline-none"
                          />
                          <button
                            onClick={() => handleUpdateDeptName(dept.id)}
                            className="p-1 bg-green-50 border border-green-200 text-green-700 rounded cursor-pointer"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingDeptId(null)}
                            className="p-1 border border-border-beige rounded cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-medium text-foreground">{dept.name}</span>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover/dept:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDeptId(dept.id);
                                setEditDeptName(dept.name);
                              }}
                              className="p-1 border border-border-beige text-plum hover:text-accent rounded cursor-pointer"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDeptObj(dept.id)}
                              className="p-1 border border-red-100 text-red-500 hover:text-red-700 rounded cursor-pointer"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-plum text-center py-4">No operational departments configured yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
