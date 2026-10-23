"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface StudentLoginProps {
  onLogin: (username: string) => void;
}

export function StudentLogin({ onLogin }: StudentLoginProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      onLogin(username.trim());
      setIsLoading(false);
    }, 150);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 z-10 select-none">
      {/* Brand Header */}
      <div className="text-center flex flex-col items-center mb-6 sm:mb-8 shrink-0">
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
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/50 font-bold">
          Less Thinking, More Neural Linking
        </p>
      </div>

      {/* Login Card (Original ChadMath Design) */}
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 w-full max-w-xs sm:max-w-sm p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-2xl isolate"
      >
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="studentUsername"
            className="text-xs font-bold uppercase tracking-widest text-white/60 text-center"
          >
            Username
          </label>
          <input
            id="studentUsername"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black/50 border border-white/15 rounded-2xl px-4 py-3 text-center text-lg sm:text-xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            placeholder="Enter Username"
            autoComplete="off"
            autoFocus
          />

          <p className="text-[10px] sm:text-[11px] text-white/50 text-center leading-tight mt-1 px-1">
            New player? Invent a unique, easy-to-remember username to track your progress!
          </p>

          <p className="text-[10px] text-amber-400/80 text-center leading-tight mt-0.5 px-1 font-medium">
            Note: Avoid generic names to keep your stats private and unique!
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-sm sm:text-base"
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
      </motion.form>
    </div>
  );
}
