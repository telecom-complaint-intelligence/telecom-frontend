"use client";

import React, { useState, useEffect } from "react";
import { Check, LogOut, Save, Pencil, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout, updateProfile, updateServiceDetails } = useAuth();
  const router = useRouter();

  // Personal Info Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "-");
  const [email, setEmail] = useState(user?.email || "-");
  const [phone, setPhone] = useState(user?.phone || "-");
  const [address, setAddress] = useState(user?.address || "-");
  const [city, setCity] = useState(user?.city || "-");
  const [stateVal, setStateVal] = useState(user?.stateVal || "-");
  const [country, setCountry] = useState(user?.country || "-");
  const [zipcode, setZipcode] = useState(user?.zipcode || "-");
  const [language, setLanguage] = useState("English");

  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempAddress, setTempAddress] = useState("");
  const [tempCity, setTempCity] = useState("");
  const [tempStateVal, setTempStateVal] = useState("");
  const [tempCountry, setTempCountry] = useState("");
  const [tempZipcode, setTempZipcode] = useState("");
  const [tempLanguage, setTempLanguage] = useState(language);

  // Service Details Edit states
  const [isEditingService, setIsEditingService] = useState(false);
  const [accountRef, setAccountRef] = useState(user?.accountRef || "-");
  const [billCycle, setBillCycle] = useState(user?.billCycle || "-");
  const [activePlan, setActivePlan] = useState(user?.activePlan || "-");
  const [connectionStatus, setConnectionStatus] = useState(user?.connectionStatus || "-");

  const [tempAccountRef, setTempAccountRef] = useState("");
  const [tempBillCycle, setTempBillCycle] = useState("");
  const [tempActivePlan, setTempActivePlan] = useState("");
  const [tempConnectionStatus, setTempConnectionStatus] = useState("");
  const [tempPlanUsage, setTempPlanUsage] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [isServiceSaved, setIsServiceSaved] = useState(false);

  // Sync state when user context is loaded
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setName(user.name || "-");
        setEmail(user.email || "-");
        setPhone(user.phone || "-");
        setAddress(user.address || "-");
        setCity(user.city || "-");
        setStateVal(user.stateVal || "-");
        setCountry(user.country || "-");
        setZipcode(user.zipcode || "-");
        setAccountRef(user.accountRef || "-");
        setBillCycle(user.billCycle || "-");
        setActivePlan(user.activePlan || "-");
        setConnectionStatus(user.connectionStatus || "-");
      }, 0);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const startEdit = () => {
    setTempName(name === "-" ? "" : name);
    setTempEmail(email === "-" ? "" : email);
    setTempPhone(phone === "-" ? "" : phone);
    setTempAddress(address === "-" ? "" : address);
    setTempCity(city === "-" ? "" : city);
    setTempStateVal(stateVal === "-" ? "" : stateVal);
    setTempCountry(country === "-" ? "" : country);
    setTempZipcode(zipcode === "-" ? "" : zipcode);
    setTempLanguage(language);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateProfile({
      name: tempName,
      phone: tempPhone,
      address: tempAddress,
      city: tempCity,
      stateVal: tempStateVal,
      country: tempCountry,
      zipcode: tempZipcode,
      planUsage: user?.planUsage || "self"
    });

    if (success) {
      setName(tempName || "-");
      setPhone(tempPhone || "-");
      setAddress(tempAddress || "-");
      setCity(tempCity || "-");
      setStateVal(tempStateVal || "-");
      setCountry(tempCountry || "-");
      setZipcode(tempZipcode || "-");
      setLanguage(tempLanguage);
      setIsEditing(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const startEditService = () => {
    setTempAccountRef(accountRef === "-" ? "" : accountRef);
    setTempBillCycle(billCycle === "-" ? "" : billCycle);
    setTempActivePlan(activePlan === "-" ? "" : activePlan);
    setTempConnectionStatus(connectionStatus === "-" ? "" : connectionStatus);
    setTempPlanUsage(user?.planUsage || "");
    setIsEditingService(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updateServiceDetails({
      accountRef: tempAccountRef,
      billCycle: tempBillCycle,
      activePlan: tempActivePlan,
      connectionStatus: tempConnectionStatus,
      planUsage: tempPlanUsage
    });

    if (success) {
      setAccountRef(tempAccountRef || "-");
      setBillCycle(tempBillCycle || "-");
      setActivePlan(tempActivePlan || "-");
      setConnectionStatus(tempConnectionStatus || "-");
      setIsEditingService(false);
      setIsServiceSaved(true);
      setTimeout(() => setIsServiceSaved(false), 2000);
    }
  };

  // Format Member Since date
  const getMemberSince = () => {
    if (!user || !user.createdAt) {
      const d = new Date();
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    try {
      const d = new Date(user.createdAt);
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      const d = new Date();
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
  };

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-5xl w-full mx-auto font-sans animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal">Profile Settings</h1>
        <p className="text-sm text-plum">Manage your personal information and view your service details.</p>
      </div>

      {/* Identity Card */}
      <div className="p-6 bg-card-bg border border-border-beige rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profilePicture}
              alt="Profile"
              className="h-16 w-16 rounded-full object-cover border border-border-beige"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-accent-light flex items-center justify-center text-accent text-2xl font-serif uppercase">
              {name && name !== "-" ? name.split(" ").filter(Boolean).map(n => n[0]).join("").substring(0, 2) : "-"}
            </div>
          )}
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-semibold">{name}</h2>
            <p className="text-xs font-mono text-plum">
              {user?.id || "-"} &middot; Member since {getMemberSince()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-mono font-medium px-3 py-1 bg-accent-light text-accent rounded border border-purple-200 uppercase">
            PLAN: {user?.planUsage ? String(user.planUsage).toUpperCase() : "-"}
          </span>
          <span className="text-xs font-mono font-medium px-3 py-1 bg-green-50 text-green-700 rounded border border-green-200">
            ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Personal Information Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border-beige flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold">Personal Information</h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="p-2 text-plum hover:text-accent hover:bg-accent-light rounded-full transition-all cursor-pointer"
                  aria-label="Edit personal details"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum uppercase" htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum uppercase" htmlFor="emailAddress">Email Address</label>
                  <input
                    id="emailAddress"
                    type="email"
                    required
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum uppercase" htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    type="text"
                    required
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum uppercase" htmlFor="streetAddress">Street Address</label>
                  <input
                    id="streetAddress"
                    type="text"
                    required
                    value={tempAddress}
                    onChange={(e) => setTempAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-plum uppercase" htmlFor="city">City</label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={tempCity}
                      onChange={(e) => setTempCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-plum uppercase" htmlFor="stateVal">State</label>
                    <input
                      id="stateVal"
                      type="text"
                      required
                      value={tempStateVal}
                      onChange={(e) => setTempStateVal(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-plum uppercase" htmlFor="country">Country</label>
                    <input
                      id="country"
                      type="text"
                      required
                      value={tempCountry}
                      onChange={(e) => setTempCountry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum uppercase" htmlFor="zipcode">Zipcode</label>
                  <input
                    id="zipcode"
                    type="text"
                    required
                    value={tempZipcode}
                    onChange={(e) => setTempZipcode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>


                <div className="space-y-1">
                  <label className="text-xs font-mono text-plum uppercase" htmlFor="language">Default Language</label>
                  <input
                    id="language"
                    type="text"
                    required
                    value={tempLanguage}
                    onChange={(e) => setTempLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border-beige">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Save size={14} />
                    Save Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 border border-border-beige hover:bg-[#F5EFEB] text-plum text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-border-beige px-6 text-sm">
                <div className="py-4 grid grid-cols-3 gap-4">
                  <span className="font-mono text-xs text-plum uppercase">Full Name</span>
                  <span className="col-span-2 font-medium">{name}</span>
                </div>
                <div className="py-4 grid grid-cols-3 gap-4">
                  <span className="font-mono text-xs text-plum uppercase">Email Address</span>
                  <span className="col-span-2 font-medium flex items-center gap-2">
                    {email}
                    {user?.emailVerified ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded flex items-center gap-1">
                        <Check size={10} /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-300 rounded flex items-center gap-1">
                        <X size={10} /> Not Verified
                      </span>
                    )}
                  </span>
                </div>
                <div className="py-4 grid grid-cols-3 gap-4">
                  <span className="font-mono text-xs text-plum uppercase">Phone Number</span>
                  <span className="col-span-2 font-medium flex items-center gap-2">
                    {phone}
                  </span>
                </div>
                <div className="py-4 grid grid-cols-3 gap-4">
                  <span className="font-mono text-xs text-plum uppercase">Street Address</span>
                  <span className="col-span-2 font-medium">{address}</span>
                </div>
                <div className="py-4 grid grid-cols-3 gap-4">
                  <span className="font-mono text-xs text-plum uppercase">City, State, Country</span>
                  <span className="col-span-2 font-medium">{city}, {stateVal}, {country}</span>
                </div>
                <div className="py-4 grid grid-cols-3 gap-4">
                  <span className="font-mono text-xs text-plum uppercase">Zipcode</span>
                  <span className="col-span-2 font-medium">{zipcode}</span>
                </div>
                <div className="py-4 grid grid-cols-3 gap-4">
                  <span className="font-mono text-xs text-plum uppercase">Default Language</span>
                  <span className="col-span-2 font-medium">{language}</span>
                </div>
              </div>
            )}
            {isSaved && !isEditing && (
              <div className="p-4 bg-green-50 border-t border-green-100 text-green-700 text-xs text-center font-medium animate-fade-in">
                ✓ Personal details updated successfully
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Service Details & Session */}
        <div className="space-y-6">
          <div className="bg-card-bg border border-border-beige rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border-beige flex items-center justify-between">
              <h3 className="text-sm font-serif font-semibold">Service Details</h3>
              {!isEditingService && (
                <button
                  type="button"
                  onClick={startEditService}
                  className="p-1.5 text-plum hover:text-accent hover:bg-accent-light rounded-full transition-all cursor-pointer"
                  aria-label="Edit service details"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>

            {isEditingService ? (
              <form onSubmit={handleSaveService} className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-plum uppercase" htmlFor="accountRef">Account Ref</label>
                  <input
                    id="accountRef"
                    type="text"
                    required
                    placeholder="e.g. 98XXXX4821"
                    value={tempAccountRef}
                    onChange={(e) => setTempAccountRef(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border-beige rounded text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-plum uppercase" htmlFor="billCycle">Bill Cycle</label>
                  <input
                    id="billCycle"
                    type="text"
                    required
                    placeholder="e.g. 5th of every month"
                    value={tempBillCycle}
                    onChange={(e) => setTempBillCycle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border-beige rounded text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-plum uppercase" htmlFor="activePlan">Active Plan</label>
                  <input
                    id="activePlan"
                    type="text"
                    required
                    placeholder="e.g. Fibre 100 Mbps (Self)"
                    value={tempActivePlan}
                    onChange={(e) => setTempActivePlan(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border-beige rounded text-xs focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-plum uppercase" htmlFor="connectionStatus">Connection Status</label>
                  <select
                    id="connectionStatus"
                    value={tempConnectionStatus}
                    onChange={(e) => setTempConnectionStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border-beige rounded text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="">-</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-plum uppercase" htmlFor="planUsage">Plan Usage</label>
                  <select
                    id="planUsage"
                    value={tempPlanUsage}
                    onChange={(e) => setTempPlanUsage(e.target.value)}
                    className="w-full px-3 py-1.5 bg-background border border-border-beige rounded text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="">-</option>
                    <option value="self">Self</option>
                    <option value="shop">Shop</option>
                    <option value="organization">Organization</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border-beige">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-[10px] font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Save size={10} />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingService(false)}
                    className="px-3.5 py-1.5 border border-border-beige hover:bg-[#F5EFEB] text-plum text-[10px] font-semibold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <X size={10} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-border-beige text-xs px-4">
                <div className="py-2.5 flex justify-between">
                  <span className="font-mono text-plum uppercase">Account Ref</span>
                  <span className="font-medium font-mono text-accent">{accountRef}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-mono text-plum uppercase">Bill Cycle</span>
                  <span className="font-medium">{billCycle}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-mono text-plum uppercase">Active Plan</span>
                  <span className="font-medium">{activePlan}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="font-mono text-plum uppercase">Connection</span>
                  <span className={`font-medium ${connectionStatus === "Active" ? "text-green-600" : "text-amber-600"}`}>
                    {connectionStatus}
                  </span>
                </div>
              </div>
            )}
            {isServiceSaved && !isEditingService && (
              <div className="p-2.5 bg-green-50 border-t border-green-100 text-green-700 text-[10px] text-center font-medium animate-fade-in">
                ✓ Service details updated successfully
              </div>
            )}
          </div>

          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-semibold border-b border-border-beige pb-2">Account Session</h3>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
            >
              <LogOut size={14} />
              Log out
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
