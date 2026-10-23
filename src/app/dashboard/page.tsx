"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Lock, Delete, ArrowLeft, LogOut, CheckCircle2 } from "lucide-react";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import {
  StudentProfile,
  loadAllStudents,
  getActiveStudent,
  setActiveStudentPin,
  TEACHER_PIN,
} from "@/lib/studentStorage";

export default function TeacherPortalPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStudents(loadAllStudents());
      const authed = sessionStorage.getItem("chadmath_teacher_auth");
      if (authed === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleRefreshStudents = useCallback(() => {
    setStudents(loadAllStudents());
  }, []);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMessage(null);

    if (newPin.length === 4) {
      if (newPin === TEACHER_PIN) {
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("chadmath_teacher_auth", "true");
        }
        setPin("");
      } else {
        setErrorMessage("Incorrect Teacher PIN. Default is 9999.");
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  const handleDelete = () => {
    setErrorMessage(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMessage(null);
    setPin("");
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setPin("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("chadmath_teacher_auth");
    }
  };

  const handleBackToApp = () => {
    window.location.href = "/";
  };

  const handleSelectStudentToPractice = (student: StudentProfile) => {
    setActiveStudentPin(student.pin);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("chadmath_active_login_pin", student.pin);
    }
    window.location.href = "/";
  };

  // If authenticated, display full Teacher Command Center
  if (isAuthenticated) {
    return (
      <div className="h-[100dvh] w-full flex flex-col bg-[#07080c] overflow-hidden">
        {/* Top Teacher Status Bar */}
        <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Teacher Portal Active</span>
            <span className="text-white/40 hidden sm:inline">• Address: /dashboard</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
              ← Student App ( / )
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Full Analytics Roster */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <TeacherDashboard
            students={students}
            onBackToApp={handleBackToApp}
            onSelectStudentToPractice={handleSelectStudentToPractice}
            onRefreshStudents={handleRefreshStudents}
          />
        </div>
      </div>
    );
  }

  // Teacher PIN Lock Screen
  return (
    <div className="h-[100dvh] w-full bg-[#07080c] flex flex-col items-center justify-center p-4 relative select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f22_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f22_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm sm:max-w-md bg-[#0e1017] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col items-center"
      >
        {/* Amber Icon Badge */}
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-3 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white text-center mb-1">
          Teacher Command Center
        </h1>
        <p className="text-xs text-white/50 text-center mb-5">
          Enter your 4-digit Teacher PIN to access classroom analytics:
        </p>

        {/* 4-Digit Display */}
        <div className="flex items-center gap-3 mb-4">
          {[0, 1, 2, 3].map((idx) => {
            const hasDigit = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-11 h-13 sm:w-12 sm:h-14 rounded-2xl border flex items-center justify-center text-xl font-black transition-all ${
                  hasDigit
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105"
                    : "bg-white/5 border-white/10 text-white/20"
                }`}
              >
                {hasDigit ? "●" : "○"}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-rose-400 mb-3 text-center"
          >
            {errorMessage}
          </motion.p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-11 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-amber-500/30 text-white font-black text-lg sm:text-xl border border-white/5 transition-all shadow-sm flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="h-11 sm:h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-bold border border-white/5 flex items-center justify-center transition-colors cursor-pointer"
          >
            Clear
          </button>

          <button
            onClick={() => handleDigit("0")}
            className="h-11 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-amber-500/30 text-white font-black text-lg sm:text-xl border border-white/5 transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-11 sm:h-12 rounded-2xl bg-white/5 hover:bg-rose-500/20 active:bg-rose-500/30 text-white/60 hover:text-rose-400 border border-white/5 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Teacher PIN helper notice */}
        <p className="mt-4 text-[11px] text-white/40 text-center">
          Default Teacher PIN: <strong className="text-amber-400">9999</strong>
        </p>

        {/* Return to Learner Practice */}
        <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-center">
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Student App ( / )</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
