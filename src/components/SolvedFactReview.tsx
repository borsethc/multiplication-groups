"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, BookOpen } from "lucide-react";

interface SolvedFactReviewProps {
  factorA: number;
  factorB: number;
  product: number;
  solveType: "free_recall" | "multiple_choice" | "assisted";
  isTableMastered?: boolean;
  tableMasteryPercent?: number;
  onContinue: () => void;
  onBackToMenu?: () => void;
  isLargeFont?: boolean;
}

export function SolvedFactReview({
  factorA,
  factorB,
  product,
  solveType,
  isTableMastered = false,
  tableMasteryPercent = 0,
  onContinue,
  onBackToMenu,
  isLargeFont = false,
}: SolvedFactReviewProps) {
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none"
    >
      <div className="w-full max-w-lg bg-[#0c0e17] border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center gap-4 text-white relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row with Main Menu Button */}
        <div className="w-full flex items-center justify-between z-10">
          {onBackToMenu ? (
            <button
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all shadow-sm cursor-pointer"
              title="Return to Main Menu"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Main Menu</span>
            </button>
          ) : <div />}

          {/* Header Icon: Only use 'Mastered' when the table is truly mastered (>= 80%) */}
          {isTableMastered ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Table ×{factorA} Mastered ({tableMasteryPercent}%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Fact Solved!</span>
            </div>
          )}

          <div className="w-16" />
        </div>

        {/* 1. Explicit Symbol Statement */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/50 font-bold">
            Equation In Symbols
          </span>
          <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="text-cyan-400">{factorA}</span>
            <span className="text-white/40">×</span>
            <span className="text-amber-400">{factorB}</span>
            <span className="text-white/40">=</span>
            <span className="text-emerald-400 underline decoration-emerald-500/50 underline-offset-8">
              {product}
            </span>
          </div>
        </div>

        {/* 2. Explicit Words Restatement */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 flex flex-col gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
            Equation In Words
          </span>
          <p className="text-base sm:text-xl font-black text-white/95">
            “{factorA} groups of {factorB} equals {product}”
          </p>
          <p className="text-xs sm:text-sm text-white/60">
            {Array.from({ length: factorA }).map(() => factorB).join(" + ")} = {product}
          </p>
        </div>

        {/* 3. Explicit Visual Dot Representation */}
        <div className="w-full flex flex-col items-center gap-2 bg-black/40 border border-white/5 rounded-2xl p-3">
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
            Visual Dot Model ({factorA} rows of {factorB})
          </span>
          <div className="flex flex-col gap-1.5 items-center justify-center max-h-36 overflow-y-auto w-full py-1">
            {Array.from({ length: factorA }).map((_, rIdx) => (
              <div key={rIdx} className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] font-mono text-white/40 w-4 text-right">
                  #{rIdx + 1}
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-lg bg-white/5 border border-white/10">
                  {Array.from({ length: factorB }).map((_, cIdx) => (
                    <span
                      key={cIdx}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-200 shadow-sm shadow-amber-500/40"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mastery Type Note */}
        {solveType === "multiple_choice" ? (
          <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl w-full">
            💡 <strong>Scaffolded Solve:</strong> Solved with multiple choice. Clean recall from memory without hints builds towards mastery!
          </div>
        ) : solveType === "assisted" ? (
          <div className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl w-full">
            🛠️ <strong>Model Counted:</strong> Great practice with the model! Clean recall (typing the answer without counting dots) builds table mastery.
          </div>
        ) : (
          <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-full">
            ⭐ <strong>Independent Recall:</strong> Clean recall from memory (+8% progress towards Table Mastery)!
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 w-full pt-1">
          {onBackToMenu && (
            <button
              onClick={onBackToMenu}
              className="py-3 px-3.5 sm:px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Return to Main Menu"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>Main Menu</span>
            </button>
          )}


          <button
            onClick={() => {
              if (canContinue) onContinue();
            }}
            disabled={!canContinue}
            autoFocus={canContinue}
            className={`flex-[1.4] py-3.5 px-4 sm:px-6 rounded-2xl font-black text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 transition-all ${
              canContinue
                ? "bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black shadow-emerald-500/30 active:scale-95 cursor-pointer"
                : "bg-white/10 text-white/40 cursor-not-allowed border border-white/10"
            }`}
          >
            <span>{canContinue ? "Next Fact" : "Reviewing..."}</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
