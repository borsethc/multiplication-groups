"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sliders, Play, Shuffle } from "lucide-react";
import { useState } from "react";

interface FactSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFactorA: number;
  currentFactorB: number;
  onSelectFact: (a: number, b: number) => void;
}

export function FactSelectorModal({
  isOpen,
  onClose,
  currentFactorA,
  currentFactorB,
  onSelectFact,
}: FactSelectorModalProps) {
  const [factorA, setFactorA] = useState(currentFactorA);
  const [factorB, setFactorB] = useState(currentFactorB);

  const presets = [
    { a: 2, b: 2, label: "2 × 2 (Short Lines)" },
    { a: 2, b: 3, label: "2 × 3 (Classic Intro)" },
    { a: 3, b: 4, label: "3 × 4 (Medium)" },
    { a: 4, b: 5, label: "4 × 5" },
    { a: 5, b: 5, label: "5 × 5" },
    { a: 7, b: 7, label: "7 × 7 (Long Lines!)" },
    { a: 3, b: 8, label: "3 × 8" },
    { a: 6, b: 4, label: "6 × 4" },
  ];

  const handleRandom = () => {
    const a = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const b = Math.floor(Math.random() * 8) + 2;
    setFactorA(a);
    setFactorB(b);
    onSelectFact(a, b);
    onClose();
  };

  const handleApply = () => {
    onSelectFact(factorA, factorB);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-[#11131c] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Choose Math Fact</h2>
                <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                  Custom Groups & Tokens
                </p>
              </div>
            </div>

            {/* Sliders for A and B */}
            <div className="space-y-5 mb-6">
              {/* Factor A: Groups */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    First Number (Groups / Lines)
                  </span>
                  <span className="text-xl font-black text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-500/40">
                    {factorA}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={factorA}
                  onChange={(e) => setFactorA(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>1 Group</span>
                  <span>5 Groups</span>
                  <span>9 Groups</span>
                </div>
              </div>

              {/* Factor B: Tokens per group */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Second Number (Tokens / Line Length)
                  </span>
                  <span className="text-xl font-black text-purple-400 bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-500/40">
                    {factorB}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={factorB}
                  onChange={(e) => setFactorB(parseInt(e.target.value))}
                  className="w-full accent-purple-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/40 mt-1">
                  <span>1 Token (Short)</span>
                  <span>5 Tokens (Medium)</span>
                  <span>9 Tokens (Long)</span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2 block">
                Quick Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFactorA(preset.a);
                      setFactorB(preset.b);
                      onSelectFact(preset.a, preset.b);
                      onClose();
                    }}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                      factorA === preset.a && factorB === preset.b
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/20"
                        : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
                    }`}
                  >
                    <div className="font-bold text-sm text-cyan-300">{preset.a} × {preset.b}</div>
                    <div className="text-[10px] text-white/50 truncate">{preset.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleRandom}
                className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 transition-colors"
              >
                <Shuffle className="w-4 h-4 text-amber-400" />
                Random Fact
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                Load {factorA} × {factorB}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
