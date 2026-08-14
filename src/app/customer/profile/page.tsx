"use client";

import React, { useState } from "react";
import { Check, LogOut, Save, Pencil, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { logout } = useAuth();
  const router = useRouter();

  // Mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form states for editable personal data
  const [name, setName] = useState("Arjun Raman");
  const [email, setEmail] = useState("arjun.r@mail.com");
  const [phone, setPhone] = useState("+91 90XXXX 4821");
  const [address, setAddress] = useState("14/3 Kamarajar Salai");
  const [city, setCity] = useState("Madurai");
  const [stateVal, setStateVal] = useState("Tamil Nadu");
  const [country, setCountry] = useState("India");
  const [language, setLanguage] = useState("English");

  // Temporary form states for editing (so cancel rolls back)
  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempAddress, setTempAddress] = useState(address);
  const [tempCity, setTempCity] = useState(city);
  const [tempStateVal, setTempStateVal] = useState(stateVal);
  const [tempCountry, setTempCountry] = useState(country);
  const [tempLanguage, setTempLanguage] = useState(language);

  const [isSaved, setIsSaved] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const startEdit = () => {
    setTempName(name);
    setTempEmail(email);
    setTempPhone(phone);
    setTempAddress(address);
    setTempCity(city);
    setTempStateVal(stateVal);
    setTempCountry(country);
    setTempLanguage(language);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setName(tempName);
    setEmail(tempEmail);
    setPhone(tempPhone);
    setAddress(tempAddress);
    setCity(tempCity);
    setStateVal(tempStateVal);
    setCountry(tempCountry);
    setLanguage(tempLanguage);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-5xl w-full mx-auto font-sans">
      {/* Page Header */}
      <div className="border-b border-border-beige pb-6 space-y-1">
        <h1 className="text-3xl font-serif font-normal">Profile Settings</h1>
        <p className="text-sm text-plum">Manage your personal information and view your service details.</p>
      </div>

      {/* Identity Card */}
      <div className="p-6 bg-card-bg border border-border-beige rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent-light flex items-center justify-center text-accent text-3xl font-serif">
            AR
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-semibold">{name}</h2>
            <p className="text-xs font-mono text-plum">CUST-88214 &middot; Member since Mar 2024</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-mono font-medium px-3 py-1 bg-accent-light text-accent rounded border border-purple-200">
            FIBRE 100 MBPS
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
                    <label className="text-xs font-mono text-plum uppercase" htmlFor="state">State</label>
                    <input
                      id="state"
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
                  <label className="text-xs font-mono text-plum uppercase" htmlFor="defaultLanguage">Default Language</label>
                  <select
                    id="defaultLanguage"
                    value={tempLanguage}
                    onChange={(e) => setTempLanguage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border-beige rounded text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-border-beige flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save size={14} />
                    Save Changes
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
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded flex items-center gap-1">
                      <Check size={10} /> Verified
                    </span>
                  </span>
                </div>
                <div className="py-4 grid grid-cols-3 gap-4">
                  <span className="font-mono text-xs text-plum uppercase">Phone Number</span>
                  <span className="col-span-2 font-medium flex items-center gap-2">
                    {phone}
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded flex items-center gap-1">
                      <Check size={10} /> Verified
                    </span>
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
                  <span className="font-mono text-xs text-plum uppercase">Default Language</span>
                  <span className="col-span-2 font-medium">{language}</span>
                </div>
              </div>
            )}
            {isSaved && !isEditing && (
              <div className="p-4 bg-green-50 border-t border-green-100 text-green-700 text-xs text-center font-medium animate-fade-in">
                ✓ Profile details updated successfully
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Service Details & Session */}
        <div className="space-y-6">
          <div className="bg-card-bg border border-border-beige p-6 rounded shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-semibold border-b border-border-beige pb-2">Service Details</h3>
            <div className="divide-y divide-border-beige text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="font-mono text-plum uppercase">Account Ref</span>
                <span className="font-medium font-mono text-accent">90XXXX4821</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-mono text-plum uppercase">Bill Cycle</span>
                <span className="font-medium">5th of every month</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-mono text-plum uppercase">Active Plan</span>
                <span className="font-medium">Fibre 100 Mbps</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-mono text-plum uppercase">Connection</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
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
