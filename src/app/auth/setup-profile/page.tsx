"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Save, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function SetupProfilePage() {
  const { updateProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Step 1: Contact
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2: Location
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [country, setCountry] = useState("");
  const [zipcode, setZipcode] = useState("");

  // Step 3: Plan Usage Type
  const [planUsage, setPlanUsage] = useState<"self" | "shop" | "organization">("self");

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim() || !phone.trim()) {
        alert("Please fill in contact information.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!address.trim() || !city.trim() || !stateVal.trim() || !country.trim() || !zipcode.trim()) {
        alert("Please fill in all installation location details.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      handleSubmit(e);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!name || !phone || !address || !city || !stateVal || !country || !zipcode) {
      alert("Please fill in all details before completing.");
      return;
    }

    updateProfile({
      name,
      phone,
      address,
      city,
      stateVal,
      country,
      zipcode,
      planUsage,
      isProfileComplete: true
    });

    router.push("/customer/dashboard");
  };

  const handleExit = () => {
    // Navigate away to dashboard with incomplete profile
    router.push("/customer/dashboard");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        {/* Left Side: Brand Context */}
        <div className="hidden md:flex flex-col justify-between p-16 bg-[#F5EFEB] border-r border-border-beige">
          <div className="flex items-center gap-2 pl-2">
            <Image
              src="/TELU-LOGO.png"
              alt="Telu Logo"
              width={180}
              height={52}
              priority
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="space-y-6 max-w-sm">
            <span className="text-[10px] font-mono tracking-wider uppercase text-accent font-semibold block">Onboarding Setup</span>
            <h1 className="text-3xl font-serif font-light leading-tight">Complete your profile to get started.</h1>
            <p className="text-sm text-plum leading-relaxed">
              We collect your address and contact details to ensure that any network outages or broadband troubleshooting can be automated and resolved instantly.
            </p>
          </div>

          <div className="text-xs text-plum font-mono">
            TELU CONNECT &middot; STEP {step} OF 3
          </div>
        </div>

        {/* Right Side: Multi-Step Form */}
        <div className="flex items-center justify-center p-8 bg-card-bg">
          <div className="w-full max-w-md space-y-6">
            <div className="flex justify-between items-center border-b border-border-beige pb-4">
              <div>
                <span className="text-[10px] font-mono text-accent uppercase block font-semibold">Step {step} of 3</span>
                <h2 className="text-xl font-serif font-semibold">
                  {step === 1 && "Contact Information"}
                  {step === 2 && "Installation Location"}
                  {step === 3 && "Plan Usage Type"}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleExit}
                className="text-xs text-plum hover:text-foreground font-mono cursor-pointer hover:underline"
              >
                Skip / Exit Setup
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* STEP 1: Contact Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-plum uppercase block" htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Arjun Raman"
                      className="w-full px-4 py-3 bg-background border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-plum uppercase block" htmlFor="phoneNumber">Phone Number</label>
                    <input
                      id="phoneNumber"
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 90XXXX 4821"
                      className="w-full px-4 py-3 bg-background border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Location Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-plum uppercase block" htmlFor="street">Street Address</label>
                    <textarea
                      id="street"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="14/3 Kamarajar Salai, Anna Nagar"
                      rows={2}
                      className="w-full px-4 py-3 bg-background border border-border-beige rounded focus:outline-none focus:border-accent text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-plum uppercase block" htmlFor="city">City</label>
                      <input
                        id="city"
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Madurai"
                        className="w-full px-4 py-3 bg-background border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-plum uppercase block" htmlFor="state">State</label>
                      <input
                        id="state"
                        type="text"
                        required
                        value={stateVal}
                        onChange={(e) => setStateVal(e.target.value)}
                        placeholder="Tamil Nadu"
                        className="w-full px-4 py-3 bg-background border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-plum uppercase block" htmlFor="country">Country</label>
                      <input
                        id="country"
                        type="text"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="India"
                        className="w-full px-4 py-3 bg-background border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-plum uppercase block" htmlFor="zipcode">Zipcode</label>
                      <input
                        id="zipcode"
                        type="text"
                        required
                        value={zipcode}
                        onChange={(e) => setZipcode(e.target.value)}
                        placeholder="625020"
                        className="w-full px-4 py-3 bg-background border border-border-beige rounded focus:outline-none focus:border-accent text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Plan Usage Type */}
              {step === 3 && (
                <div className="space-y-4">
                  <span className="text-xs font-mono text-plum uppercase block">Who will be using this connection?</span>
                  <div className="grid grid-cols-1 gap-3 animate-fade-in">
                    {[
                      { id: "self", title: "Self / Personal", desc: "Used in a residential house or private home connection." },
                      { id: "shop", title: "Small Shop", desc: "Used inside a small store, retail shop, or local clinic." },
                      { id: "organization", title: "Organization", desc: "Used inside a corporate office, enterprise block, or large venue." }
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`p-4 border rounded flex flex-col gap-1 cursor-pointer transition-all ${
                          planUsage === opt.id
                            ? "border-accent bg-accent-light text-accent"
                            : "border-border-beige hover:border-plum text-plum"
                        }`}
                      >
                        <input
                          type="radio"
                          name="planUsage"
                          value={opt.id}
                          checked={planUsage === opt.id}
                          onChange={(e) => setPlanUsage(e.target.value as "self" | "shop" | "organization")}
                          className="sr-only"
                        />
                        <span className="text-sm font-semibold block">{opt.title}</span>
                        <span className="text-[11px] font-mono text-plum/70 block">{opt.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex gap-3 border-t border-border-beige pt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 border border-border-beige text-plum text-xs font-semibold rounded flex items-center gap-1 cursor-pointer hover:bg-[#F5EFEB]"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => router.push("/customer/dashboard")}
                  className="px-4 py-2 text-plum hover:text-[#1E0A2D] text-xs font-semibold rounded flex items-center cursor-pointer transition-colors"
                >
                  Skip for now
                </button>

                {step < 3 ? (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1E0A2D] hover:bg-[#2F1442] text-white text-xs font-semibold rounded flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent hover:opacity-90 text-white text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <Save size={14} /> Complete Setup
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
