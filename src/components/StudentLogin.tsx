"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Lock, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

interface StudentLoginProps {
  onLogin: (username: string, pin?: string) => { requiresPin?: boolean; error?: string } | void;
  onBackToMenu?: () => void;
}

export function StudentLogin({ onLogin, onBackToMenu }: StudentLoginProps) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPinInput, setShowPinInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = onLogin(username.trim(), pin.trim() || undefined);
      setIsLoading(false);

      if (result && result.requiresPin) {
        setShowPinInput(true);
        setErrorMessage(result.error || "This profile is locked with a private PIN. Please enter your 4-digit PIN.");
      } else if (result && result.error) {
        setErrorMessage(result.error);
      }
    }, 150);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-3 sm:p-4 z-10 select-none">
      {/* Brand Header */}
      <div className="text-center flex flex-col items-center mb-5 sm:mb-6 shrink-0">
        <div className="flex items-center justify-center gap-3 mb-2">
          {/* Patriot Mascot Logo */}
          <div className="relative w-12 h-9 sm:w-16 sm:h-11 bg-white rounded-lg flex items-center justify-center px-1 py-0.5 shadow-md shadow-white/5 border border-white/20 overflow-hidden">
            <Image
              src="/chadmath-logo.png"
              alt="ChadMath Mascot"
              width={56}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
            ChadMath
          </h1>
        </div>
        {/* Educational Clear Tagline (Item 24) */}
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-cyan-300/80 font-bold max-w-sm text-center">
          Visual Multiplication Mastery Through Grouping & Patterns
        </p>
      </div>

      {/* Login Card */}
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-3.5 w-full max-w-xs sm:max-w-sm p-6 sm:p-7 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-2xl isolate"
      >
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="studentUsername"
            className="text-xs font-bold uppercase tracking-widest text-white/70 text-center"
          >
            Username
          </label>
          <input
            id="studentUsername"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full bg-black/50 border border-white/15 rounded-2xl px-4 py-3 text-center text-lg sm:text-xl font-bold text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            placeholder="Enter Username"
            autoComplete="off"
            autoFocus
          />

          {/* Optional PIN Field for Private Login (Item 15) */}
          {showPinInput ? (
            <div className="mt-2 flex flex-col gap-1 w-full animate-in fade-in slide-in-from-top-2 duration-300">
              <label
                htmlFor="studentPin"
                className="text-xs font-bold uppercase tracking-widest text-amber-300 text-center flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" /> 4-Digit Private PIN
              </label>
              <input
                id="studentPin"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/[^0-9]/g, ""));
                  setErrorMessage(null);
                }}
                className="w-full bg-black/60 border border-amber-500/40 rounded-2xl px-4 py-2.5 text-center text-xl font-mono font-bold text-amber-300 placeholder:text-white/20 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 shadow-inner"
                placeholder="••••"
                autoComplete="off"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPinInput(true)}
              className="text-[11px] text-indigo-300/80 hover:text-indigo-200 text-center py-0.5 underline transition-colors cursor-pointer"
            >
              + Add Private 4-Digit PIN (Optional)
            </button>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] text-center font-bold">
              {errorMessage}
            </div>
          )}

          <p className="text-[10px] sm:text-[11px] text-white/50 text-center leading-tight mt-0.5 px-1">
            New player? Invent a unique, easy-to-remember username to track your progress!
          </p>

          {/* Prominent Privacy Notice (Item 15) */}
          <div className="mt-1 p-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[9px] sm:text-[10px] text-white/60 leading-tight">
              <strong className="text-white/80">Privacy Notice:</strong> Usernames without a PIN can be accessed on this shared device. Setting a PIN keeps your mastery private.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm sm:text-base mt-1"
        >
          {isLoading ? (
            "Signing In..."
          ) : (
            <>
              <span>Start Playing</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {onBackToMenu && (
          <button
            type="button"
            onClick={onBackToMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer mt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Return to Main Menu</span>
          </button>
        )}
      </motion.form>
    </div>
  );
}
