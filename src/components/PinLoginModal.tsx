"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Delete, Lock, User, GraduationCap, Sparkles, Check } from "lucide-react";
import { StudentProfile, TEACHER_PIN } from "@/lib/studentStorage";

interface PinLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  students: StudentProfile[];
  currentStudent?: StudentProfile | null;
  onSelectStudent: (student: StudentProfile) => void;
  canClose?: boolean;
}

export function PinLoginModal({
  isOpen,
  onClose,
  students,
  currentStudent,
  onSelectStudent,
  canClose = true,
}: PinLoginModalProps) {
  const [pin, setPin] = useState<string>("");
  const [selectedStudentForPin, setSelectedStudentForPin] = useState<StudentProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"keypad" | "roster">("keypad");

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMessage(null);

    // Auto-verify once 4 digits entered
    if (newPin.length === 4) {
      verifyPin(newPin);
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

  const verifyPin = (enteredPin: string) => {
    // Check student PINs
    const match = students.find((s) => s.pin === enteredPin);
    if (match) {
      onSelectStudent(match);
      setPin("");
      setSelectedStudentForPin(null);
      if (onClose) onClose();
    } else {
      setErrorMessage("Incorrect PIN. Please try again!");
      setTimeout(() => {
        setPin("");
      }, 600);
    }
  };

  const handleSelectStudentFromRoster = (student: StudentProfile) => {
    setSelectedStudentForPin(student);
    setPin("");
    setErrorMessage(null);
    setMode("keypad");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-sm sm:max-w-md bg-[#0e1017] border border-white/15 rounded-3xl p-4 sm:p-6 text-white shadow-2xl flex flex-col items-center overflow-hidden"
        >
          {/* Close Button (only if canClose) */}
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 mb-3 sm:mb-4">
            <button
              onClick={() => {
                setMode("keypad");
                setErrorMessage(null);
              }}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "keypad"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Enter PIN
            </button>
            <button
              onClick={() => {
                setMode("roster");
                setErrorMessage(null);
              }}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "roster"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Class Roster
            </button>
          </div>

          {mode === "keypad" ? (
            <div className="w-full flex flex-col items-center">
              {/* Header Info */}
              <div className="flex flex-col items-center text-center mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 mb-2">
                  {selectedStudentForPin ? selectedStudentForPin.avatar : <Lock className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {selectedStudentForPin ? `Hello, ${selectedStudentForPin.name}!` : "Enter Student PIN"}
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  {selectedStudentForPin
                    ? `Type your 4-digit PIN to load your progress`
                    : "Enter your 4-digit PIN to load your profile"}
                </p>
              </div>

              {/* 4 PIN Bubbles */}
              <div className="flex items-center justify-center gap-3.5 mb-3.5">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = pin.length > idx;
                  return (
                    <motion.div
                      key={idx}
                      animate={{ scale: isFilled ? 1.15 : 1 }}
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                        isFilled
                          ? "bg-cyan-400 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                          : "border-white/20 bg-white/5"
                      }`}
                    />
                  );
                })}
              </div>

              {/* Error shake */}
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-bold text-rose-400 bg-rose-950/40 border border-rose-500/30 px-3 py-1 rounded-xl mb-2 text-center"
                >
                  {errorMessage}
                </motion.p>
              )}

              {/* Tactile Keypad */}
              <div className="grid grid-cols-3 gap-2 w-full max-w-[260px] sm:max-w-[280px]">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleDigit(num)}
                    className="h-11 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/30 text-white font-black text-lg sm:text-xl border border-white/5 transition-all shadow-sm flex items-center justify-center cursor-pointer"
                  >
                    {num}
                  </button>
                ))}

                {/* Clear */}
                <button
                  onClick={handleClear}
                  className="h-11 sm:h-12 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/50 hover:text-white font-bold text-xs border border-white/5 flex items-center justify-center transition-colors cursor-pointer"
                >
                  Clear
                </button>

                {/* 0 */}
                <button
                  onClick={() => handleDigit("0")}
                  className="h-11 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/30 text-white font-black text-lg sm:text-xl border border-white/5 transition-all shadow-sm flex items-center justify-center cursor-pointer"
                >
                  0
                </button>

                {/* Backspace */}
                <button
                  onClick={handleDelete}
                  className="h-11 sm:h-12 rounded-2xl bg-white/5 hover:bg-rose-500/20 active:bg-rose-500/30 text-white/60 hover:text-rose-400 border border-white/5 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Sample PIN helper notice */}
              <div className="mt-3.5 pt-3 border-t border-white/10 w-full flex items-center justify-between text-[11px] text-white/40">
                <span>Demo Student PINs: <strong>1111</strong>, <strong>2222</strong>, <strong>3333</strong></span>
              </div>
            </div>
          ) : (
            /* Mode B: Class Roster Selection */
            <div className="w-full flex flex-col items-center">
              <h3 className="text-base font-bold text-white mb-2">Select Your Profile</h3>
              <p className="text-xs text-white/50 mb-3 text-center">
                Tap your name to sign in with your PIN:
              </p>

              <div className="w-full max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
                {students.map((student) => {
                  const isCurrent = currentStudent?.id === student.id;
                  return (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudentFromRoster(student)}
                      className={`w-full p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-indigo-600/30 border-indigo-400 text-white shadow-sm"
                          : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-white/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{student.avatar}</span>
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-sm text-white flex items-center gap-1.5">
                            {student.name}
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Active
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-white/40 font-mono">
                            Solved: {student.totalSolved} • Streak: {student.streak}
                          </span>
                        </div>
                      </div>

                      <div className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-semibold text-cyan-300">
                        Sign In →
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
