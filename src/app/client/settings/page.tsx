"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Settings, LogOut, Check, Save, Pencil, X } from "lucide-react";

export default function ClientSettingsPage() {
  const { logout, user, updateProfile } = useAuth();
  const router = useRouter();

  const isMasterAdmin = user?.role === "client" && !user?.department;

  // Personal Info Edit toggles
  const [isEditing, setIsEditing] = useState(false);

  // Profile fields
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("");
  const [zipcode, setZipcode] = useState("");

  // Temporary holding states for editing
  const [tempPhone, setTempPhone] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const [tempCity, setTempCity] = useState("");
  const [tempStateVal, setTempStateVal] = useState("");
  const [tempCountry, setTempCountry] = useState("");
  const [tempZipcode, setTempZipcode] = useState("");

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(false);

  // Sync state when user context is loaded
  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setStateVal(user.stateVal || "");
      setCountry(user.country || "");
      setZipcode(user.zipcode || "");
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const startEditing = () => {
    setTempPhone(phone);
    setTempAddress(address);
    setTempCity(city);
    setTempStateVal(stateVal);
    setTempCountry(country);
    setTempZipcode(zipcode);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError(false);

    try {
      const ok = await updateProfile({
        phone: tempPhone,
        address: tempAddress,
        city: tempCity,
        stateVal: tempStateVal,
        country: tempCountry,
        zipcode: tempZipcode,
      });

      if (ok) {
        setPhone(tempPhone);
        setAddress(tempAddress);
        setCity(tempCity);
        setStateVal(tempStateVal);
        setCountry(tempCountry);
        setZipcode(tempZipcode);
        setIsEditing(false);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(true);
      }
    } catch (err) {
      setProfileError(true);
    }
  };

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-5xl w-full mx-auto font-sans">
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal flex items-center gap-2">
          <Settings size={28} className="text-accent" />
          System Settings
        </h1>
        <p className="text-sm text-plum">Configure operator profiles and active security credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Client Profile details and edit toggle */}
        <div className="lg:col-span-2 p-6 bg-card-bg border border-border-beige rounded shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border-beige pb-3">
            <h2 className="text-lg font-serif font-semibold">Client Profile Details</h2>
            {!isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="p-1.5 border border-border-beige hover:bg-[#F5EFEB] text-plum hover:text-foreground rounded transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Pencil size={12} /> Edit Profile
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="p-3 bg-green-50 text-green-700 text-xs rounded border border-green-200 flex items-center gap-1.5">
              <Check size={14} /> Profile details saved successfully!
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              Failed to update profile details. Please try again.
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum block uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={user?.name || "Client Operator"}
                    disabled
                    className="w-full px-4 py-2.5 bg-background border border-[#EBE6E0] rounded text-sm text-plum/50 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum block uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2.5 bg-background border border-[#EBE6E0] rounded text-sm text-plum/50 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum block uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum block uppercase tracking-wider">Zipcode / Postal Code</label>
                  <input
                    type="text"
                    value={tempZipcode}
                    onChange={(e) => setTempZipcode(e.target.value)}
                    placeholder="600001"
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-mono text-plum block uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    placeholder="123 Operational Lane"
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum block uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    value={tempCity}
                    onChange={(e) => setTempCity(e.target.value)}
                    placeholder="Chennai"
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum block uppercase tracking-wider">State / Province</label>
                  <input
                    type="text"
                    value={tempStateVal}
                    onChange={(e) => setTempStateVal(e.target.value)}
                    placeholder="Tamil Nadu"
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-mono text-plum block uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    value={tempCountry}
                    onChange={(e) => setTempCountry(e.target.value)}
                    placeholder="India"
                    className="w-full px-4 py-2.5 bg-card-bg border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent hover:opacity-90 text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save size={14} /> Save Profile
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-border-beige hover:bg-[#F5EFEB] text-plum text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="divide-y divide-[#EBE6E0] text-sm">
              <div className="py-3.5 grid grid-cols-3">
                <span className="font-mono text-xs text-plum uppercase tracking-wider">Full Name</span>
                <span className="col-span-2 text-foreground font-semibold">
                  {user ? (user.name || "Client Operator") : <span className="animate-pulse font-normal">Loading...</span>}
                </span>
              </div>
              <div className="py-3.5 grid grid-cols-3">
                <span className="font-mono text-xs text-plum uppercase tracking-wider">Email Address</span>
                <span className="col-span-2 text-foreground font-mono">
                  {user ? (user.email || "-") : <span className="animate-pulse font-normal">Loading...</span>}
                </span>
              </div>
              <div className="py-3.5 grid grid-cols-3">
                <span className="font-mono text-xs text-plum uppercase tracking-wider">Phone Number</span>
                <span className="col-span-2 text-foreground">
                  {user ? (phone || "-") : <span className="animate-pulse font-normal">Loading...</span>}
                </span>
              </div>
              <div className="py-3.5 grid grid-cols-3">
                <span className="font-mono text-xs text-plum uppercase tracking-wider">Street Address</span>
                <span className="col-span-2 text-foreground">
                  {user ? (address || "-") : <span className="animate-pulse font-normal">Loading...</span>}
                </span>
              </div>
              <div className="py-3.5 grid grid-cols-3">
                <span className="font-mono text-xs text-plum uppercase tracking-wider">City</span>
                <span className="col-span-2 text-foreground">
                  {user ? (city || "-") : <span className="animate-pulse font-normal">Loading...</span>}
                </span>
              </div>
              <div className="py-3.5 grid grid-cols-3">
                <span className="font-mono text-xs text-plum uppercase tracking-wider">State / Province</span>
                <span className="col-span-2 text-foreground">
                  {user ? (stateVal || "-") : <span className="animate-pulse font-normal">Loading...</span>}
                </span>
              </div>
              <div className="py-3.5 grid grid-cols-3">
                <span className="font-mono text-xs text-plum uppercase tracking-wider">Country</span>
                <span className="col-span-2 text-foreground">
                  {user ? (country || "-") : <span className="animate-pulse font-normal">Loading...</span>}
                </span>
              </div>
              <div className="py-3.5 grid grid-cols-3">
                <span className="font-mono text-xs text-plum uppercase tracking-wider">Zipcode</span>
                <span className="col-span-2 text-foreground font-mono">
                  {user ? (zipcode || "-") : <span className="animate-pulse font-normal">Loading...</span>}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Console Security & Logout */}
        <div className="p-6 bg-card-bg border border-border-beige rounded shadow-sm space-y-4 flex flex-col justify-between h-fit">
          <div>
            <h2 className="text-base font-serif font-semibold border-b border-border-beige pb-3">Console Security</h2>
            <p className="text-xs text-plum mt-3 leading-relaxed">
              {user ? (
                <>
                  Logged in as <span className="font-semibold text-foreground">{isMasterAdmin ? "Master Client Admin" : (user.department ? `${user.department.toUpperCase()} OPS` : user.role.toUpperCase())}</span>.
                </>
              ) : (
                <span className="animate-pulse">Loading Auth...</span>
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            type="button"
            className="w-full py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
          >
            <LogOut size={14} />
            Log out Session
          </button>
        </div>
      </div>
    </main>
  );
}
