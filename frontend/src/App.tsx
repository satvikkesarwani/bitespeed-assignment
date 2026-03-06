import React, { useState } from 'react';
import axios from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Link as LinkIcon, Mail, Phone, Users } from 'lucide-react';
import { cn } from "@/lib/utils";
import './index.css';

interface ContactResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

const countries = [
  { name: "Afghanistan", code: "+93" },
  { name: "Albania", code: "+355" },
  { name: "Algeria", code: "+213" },
  { name: "Andorra", code: "+376" },
  { name: "Angola", code: "+244" },
  { name: "Argentina", code: "+54" },
  { name: "Australia", code: "+61" },
  { name: "Austria", code: "+43" },
  { name: "Bahrain", code: "+973" },
  { name: "Bangladesh", code: "+880" },
  { name: "Belgium", code: "+32" },
  { name: "Bhutan", code: "+975" },
  { name: "Brazil", code: "+55" },
  { name: "Canada", code: "+1" },
  { name: "China", code: "+86" },
  { name: "Denmark", code: "+45" },
  { name: "Egypt", code: "+20" },
  { name: "Finland", code: "+358" },
  { name: "France", code: "+33" },
  { name: "Germany", code: "+49" },
  { name: "Greece", code: "+30" },
  { name: "Hong Kong", code: "+852" },
  { name: "Iceland", code: "+354" },
  { name: "India", code: "+91" },
  { name: "Indonesia", code: "+62" },
  { name: "Ireland", code: "+353" },
  { name: "Israel", code: "+972" },
  { name: "Italy", code: "+39" },
  { name: "Japan", code: "+81" },
  { name: "Jordan", code: "+962" },
  { name: "Kuwait", code: "+965" },
  { name: "Malaysia", code: "+60" },
  { name: "Maldives", code: "+960" },
  { name: "Mexico", code: "+52" },
  { name: "Netherlands", code: "+31" },
  { name: "New Zealand", code: "+64" },
  { name: "Norway", code: "+47" },
  { name: "Oman", code: "+968" },
  { name: "Pakistan", code: "+92" },
  { name: "Philippines", code: "+63" },
  { name: "Portugal", code: "+351" },
  { name: "Qatar", code: "+974" },
  { name: "Russia", code: "+7" },
  { name: "Saudi Arabia", code: "+966" },
  { name: "Singapore", code: "+65" },
  { name: "South Africa", code: "+27" },
  { name: "South Korea", code: "+82" },
  { name: "Spain", code: "+34" },
  { name: "Sri Lanka", code: "+94" },
  { name: "Sweden", code: "+46" },
  { name: "Switzerland", code: "+41" },
  { name: "Thailand", code: "+66" },
  { name: "Turkey", code: "+90" },
  { name: "UAE", code: "+971" },
  { name: "United Kingdom", code: "+44" },
  { name: "USA", code: "+1" },
  { name: "Vietnam", code: "+84" },
];

export default function App() {
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContactResponse | null>(null);
  const [error, setError] = useState('');

  // Strict Validation Logic: Both email and phone must be present and valid
  const isEmailValid = email.toLowerCase().endsWith('@gmail.com');
  const numericPhone = phone.replace(/\D/g, '');
  const isPhoneValid = numericPhone.length === 10;

  // Identify Contact button is ONLY enabled if BOTH are correctly filled
  const canSubmit = isEmailValid && isPhoneValid;

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Send combined phone number - backend will normalize further but we send sanitized digits
      const combinedPhone = phone ? `${countryCode}${numericPhone}` : null;

      // --- DIAGNOSTIC LOGGING ---
      const meta = import.meta as any;
      const isProd = meta.env?.PROD || window.location.hostname !== 'localhost';
      const apiUrl = isProd ? '/identify' : 'http://localhost:3000/identify';

      console.log("[DEBUG] Env Detection:", {
        hostname: window.location.hostname,
        isProd,
        apiUrl,
        mode: meta.env?.MODE
      });
      console.log("[DEBUG] Request Payload:", { email, phoneNumber: combinedPhone });

      const response = await axios.post(apiUrl, {
        email: email || null,
        phoneNumber: combinedPhone
      });
      console.log("[DEBUG] Server Response Success:", response.data);
      setResult(response.data);
    } catch (err: any) {
      console.error("[DEBUG] Request Failed:", err);
      const detailedError = err.response
        ? `Server Error (${err.response.status}): ${JSON.stringify(err.response.data)}`
        : `Network Error: ${err.message}. Check if backend is running on EC2.`;
      setError(detailedError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">FluxKart Identity</h1>
          <p className="mt-2 text-slate-500">Bitespeed Backend Task: Identity Reconciliation</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <form className="space-y-6" onSubmit={handleIdentify}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 block text-left">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className={cn(
                      "block w-full pl-10 pr-3 py-2 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all sm:text-sm shadow-sm",
                      email !== '' && !isEmailValid ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    )}
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {email !== '' && !isEmailValid && (
                  <p className="text-[10px] text-red-500 font-medium text-left">Email must end with @gmail.com</p>
                )}
                {email === '' && (
                  <p className="text-[10px] text-slate-400 font-medium text-left">Email is required</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-slate-700 block text-left">Phone Number</label>
                <div className="flex gap-2">
                  <div className="w-28 shrink-0">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-full border-slate-300 bg-white shadow-sm">
                        <SelectValue placeholder="+91" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((c) => (
                          <SelectItem key={c.name} value={c.code}>
                            <div className="flex justify-between w-full gap-2">
                              <span className="truncate">{c.name}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{c.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone size={18} />
                    </div>
                    <input
                      id="phone"
                      type="text"
                      maxLength={10}
                      className={cn(
                        "block w-full pl-10 pr-3 py-2 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all sm:text-sm shadow-sm",
                        phone !== '' && !isPhoneValid ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                      )}
                      placeholder="9794182032"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setPhone(val);
                      }}
                    />
                  </div>
                </div>
                {phone !== '' && !isPhoneValid && (
                  <p className="text-[10px] text-red-500 font-medium text-left">Enter exactly 10 digits ({numericPhone.length}/10)</p>
                )}
                {phone === '' && (
                  <p className="text-[10px] text-slate-400 font-medium text-left">10-digit phone number is required</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full relative z-10 flex items-center justify-center py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-500 text-white font-semibold rounded-lg transition-all shadow-md active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Identify Contact
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Result Area */}
        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <LinkIcon size={16} className="text-blue-600" />
                Consolidated Profile
              </h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                Primary #{result.contact.primaryContactId}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linked Emails</p>
                <div className="flex flex-wrap gap-2">
                  {result.contact.emails.map((e, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linked Phone Numbers</p>
                <div className="flex flex-wrap gap-2">
                  {result.contact.phoneNumbers.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secondary Identifiers</p>
                <div className="flex flex-wrap gap-2">
                  {result.contact.secondaryContactIds.length > 0 ? (
                    result.contact.secondaryContactIds.map((id, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded text-xs font-medium">
                        #{id}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic font-normal">No secondary records found</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-slate-400 text-xs">
          Built for Bitespeed Identity Challenge
        </footer>
      </div>
    </main>
  );
}
