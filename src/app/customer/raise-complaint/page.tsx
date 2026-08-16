
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, Info, HelpCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function RaiseComplaintPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [title, setTitle] = useState("");
  const [behalfOf, setBehalfOf] = useState("self");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("India");
  const [zipcode, setZipcode] = useState("");
  const [contactMethod, setContactMethod] = useState("sms");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        complaint: title,
        filling_on_behalf_of: behalfOf === "others",
        ...(behalfOf === "others" ? {
          address,
          city: city || "Madurai",
          state: stateVal,
          country: country || "India",
          zipcode,
        } : {})
      };

      const response = await fetch("http://localhost:8000/api/v1/complaints/me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to submit complaint");
      }

      const data = await response.json();
      router.push(`/customer/raise-complaint/submitting?id=${data.id}`);
    } catch (err) {
      console.error(err);
      alert("Error submitting complaint. Please check connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user && (user.isProfileComplete === false || user.emailVerified === false)) {
    const isUnverified = user.emailVerified === false;
    return (
      <main className="p-6 md:p-12 space-y-8 max-w-md w-full mx-auto text-center font-sans pt-16">
        <div className="bg-card-bg border border-border-beige p-8 rounded shadow-sm space-y-6">
          <div className="flex justify-center">
            <span className="h-14 w-14 rounded-full bg-accent-light flex items-center justify-center text-accent">
              <HelpCircle size={28} />
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-serif font-semibold">
              {isUnverified 
                ? "Verify your email to raise the complaint"
                : "Complete your profile setup to raise the complaint"}
            </h1>
            <p className="text-xs text-plum leading-relaxed">
              {isUnverified
                ? "Before raising tickets, your registered email address must be verified. We will send an OTP confirmation link to verify your account."
                : "Before raising tickets, you must configure your billing name, service location, and usage plan preferences."}
            </p>
          </div>
          {isUnverified ? (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded text-[11px] text-amber-700 font-medium">
              An OTP link has been sent to your email. Please click it to complete verification.
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/auth/setup-profile")}
              className="w-full py-3 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-xs font-semibold rounded cursor-pointer transition-colors"
            >
              Start Onboarding Setup
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-12 space-y-8 max-w-5xl w-full mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-serif font-normal">Raise a complaint</h1>
        <p className="text-sm text-plum">
          Describe your issue in detail. Our automated console will analyse and route your complaint to the correct team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left form inputs */}
        <div className="lg:col-span-2 bg-card-bg border border-border-beige rounded p-6 space-y-6 shadow-sm">
          {/* Filing Behalf */}
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-plum block">Filing on behalf of?</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "self", label: "Self", value: "Filing for my own registered line" },
                { id: "others", label: "Someone else", value: "Filing for a family member or neighbour" }
              ].map((option) => (
                <label
                  key={option.id}
                  className={`p-4 border rounded flex flex-col gap-1 cursor-pointer transition-all ${
                    behalfOf === option.id
                      ? "border-accent bg-accent-light text-accent"
                      : "border-border-beige hover:border-plum text-plum"
                  }`}
                >
                  <input
                    type="radio"
                    name="behalfOf"
                    value={option.id}
                    checked={behalfOf === option.id}
                    onChange={(e) => setBehalfOf(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold block">{option.label}</span>
                  <span className="text-[11px] font-mono text-plum/70 block">{option.value}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title input */}
          <div className="space-y-2 border-t border-border-beige pt-4">
            <label className="text-xs font-mono uppercase tracking-wider text-plum block" htmlFor="title">
              Complaint Summary
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Internet very slow every evening"
              className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
            />
          </div>

          {/* Location Address (triggered only for others) */}
          {behalfOf === "others" && (
            <div className="space-y-4 animate-fade-in border-t border-border-beige pt-4">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-plum block" htmlFor="address">
                  Street Address
                </label>
                <textarea
                  id="address"
                  required
                  placeholder="Enter street name, house number, etc."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-plum block" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    placeholder="Madurai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-plum block" htmlFor="state">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    required
                    placeholder="Tamil Nadu"
                    value={stateVal}
                    onChange={(e) => setStateVal(e.target.value)}
                    className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-plum block" htmlFor="country">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    required
                    placeholder="India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-plum block" htmlFor="zipcode">
                    Zipcode
                  </label>
                  <input
                    id="zipcode"
                    type="text"
                    required
                    placeholder="625020"
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="w-full px-4 py-3 bg-card-bg border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-4 border-t border-border-beige pt-6">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-sm font-medium rounded transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Send size={14} />
              {loading ? "Submitting..." : "Submit complaint"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/customer/dashboard")}
              className="px-6 py-3 border border-border-beige hover:bg-background/40 text-sm text-plum rounded flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              Cancel
            </button>
          </div>
        </div>

        {/* Right sidebar details */}
        <div className="space-y-6">
          <div className="bg-card-bg border border-border-beige p-6 rounded space-y-4 text-xs">
            <h3 className="text-sm font-serif font-semibold flex items-center gap-1.5">
              <HelpCircle size={16} /> Filing Account
            </h3>
            <div className="divide-y divide-border-beige">
              <div className="py-2 flex justify-between">
                <span className="font-mono text-plum uppercase">Owner</span>
                <span className="font-medium text-foreground">{user?.name || "Customer"}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="font-mono text-plum uppercase">Filing ID</span>
                <span className="font-medium font-mono text-accent">{user?.id || "-"}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="font-mono text-plum uppercase">Exchange</span>
                <span className="font-medium text-foreground">{user?.city ? `${user.city}` : "Madurai"}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
