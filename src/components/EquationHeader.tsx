"use client";

import { motion } from "framer-motion";
import { Check, Lightbulb, Lock } from "lucide-react";

interface EquationHeaderProps {
  factorA: number; // Groups (Lines)
  factorB: number; // Tokens per group
  currentStep: 1 | 2 | 3 | 4 | 5;
  typedAnswer: string;
  isSolved: boolean;
  onOpenHelp: () => void;
  onAnswerChange?: (val: string) => void;
  onSubmitAnswer?: () => void;
  errorMessage?: string | null;
  isLinesComplete?: boolean;
  isTokensComplete?: boolean;
  onOpenHint?: () => void;
  isBuildLocked?: boolean;
  isLargeFont?: boolean;
}

export function EquationHeader({
  factorA,
  factorB,
  currentStep,
  typedAnswer,
  isSolved,
  onAnswerChange,
  onSubmitAnswer,
  errorMessage,
  isLinesComplete = false,
  isTokensComplete = false,
  onOpenHint,
  isBuildLocked = true,
  isLargeFont = false,
}: EquationHeaderProps) {
  const product = factorA * factorB;

  // Visual status for Factor A and Factor B
  const factorAGreen = isLinesComplete || isSolved;
  const factorBGreen = isTokensComplete || isSolved;

  // Allow entering the correct answer at any time!
  const isInputLocked = false;

  return (
    <div className="w-full flex flex-col items-center justify-center shrink-0 select-none py-0.5 sm:py-1">
      {/* MATH FACT ROW: HERO PROMINENT EQUATION */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 flex-wrap">

        {/* Factor 1 Column (Groups) */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{
              scale: factorAGreen ? [1, 1.04, 1] : currentStep === 1 ? [1, 1.02, 1] : 1,
              borderColor: factorAGreen ? "#10b981" : currentStep === 1 ? "#06b6d4" : "rgba(255,255,255,0.15)",
            }}
            transition={{ repeat: !factorAGreen && currentStep === 1 ? Infinity : 0, duration: 1.8 }}
            className={`w-18 h-16 sm:w-24 sm:h-22 md:w-28 md:h-26 rounded-2xl sm:rounded-3xl border-2 sm:border-3 transition-all duration-300 flex items-center justify-center gap-1 shadow-2xl relative ${
              factorAGreen
                ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                : currentStep === 1
                ? "bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.5)] ring-2 sm:ring-4 ring-cyan-500/30"
                : "bg-white/[0.04] border-white/15 text-white/80"
            }`}
          >
            <span
              className={`font-black font-mono tracking-tight drop-shadow-lg ${
                isLargeFont ? "text-4xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-5xl md:text-6xl"
              }`}
            >
              {factorA}
            </span>
            {factorAGreen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-md border-2 border-[#090b12]"
              >
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3.5]" />
              </motion.div>
            )}
          </motion.div>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-400/90">
            Groups
          </span>
        </div>

        {/* Multiplication Operator */}
        <div className="flex items-center justify-center pb-4 sm:pb-5">
          <span className="text-2xl sm:text-4xl md:text-5xl font-light text-white/50 select-none">
            ×
          </span>
        </div>

        {/* Factor 2 Column (In Each Group) */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{
              scale: factorBGreen ? [1, 1.04, 1] : currentStep === 2 ? [1, 1.02, 1] : 1,
              borderColor: factorBGreen ? "#10b981" : currentStep === 2 ? "#a855f7" : "rgba(255,255,255,0.15)",
            }}
            transition={{ repeat: !factorBGreen && currentStep === 2 ? Infinity : 0, duration: 1.8 }}
            className={`w-18 h-16 sm:w-24 sm:h-22 md:w-28 md:h-26 rounded-2xl sm:rounded-3xl border-2 sm:border-3 transition-all duration-300 flex items-center justify-center gap-1 shadow-2xl relative ${
              factorBGreen
                ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.5)]"
                : currentStep === 2
                ? "bg-purple-950/70 border-purple-400 text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.5)] ring-2 sm:ring-4 ring-purple-500/30"
                : "bg-white/[0.04] border-white/15 text-white/80"
            }`}
          >
            <span
              className={`font-black font-mono tracking-tight drop-shadow-lg ${
                isLargeFont ? "text-4xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-5xl md:text-6xl"
              }`}
            >
              {factorB}
            </span>
            {factorBGreen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-md border-2 border-[#090b12]"
              >
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3.5]" />
              </motion.div>
            )}
          </motion.div>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-purple-400/90">
            Per Group
          </span>
        </div>

        {/* Equals Operator */}
        <div className="flex items-center justify-center pb-4 sm:pb-5">
          <span className="text-2xl sm:text-4xl md:text-5xl font-light text-white/50 select-none">
            =
          </span>
        </div>

        {/* Product Column (Answer) */}
        <div className="flex flex-col items-center gap-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isInputLocked) onSubmitAnswer?.();
            }}
            className="flex items-center relative"
          >
            {isInputLocked ? (
              <div
                className="w-22 h-16 sm:w-28 sm:h-22 md:w-34 md:h-26 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center bg-white/5 border-2 border-white/15 text-white/40 shadow-inner"
              >
                <Lock className="w-5 h-5 text-amber-400/70 mb-0.5" />
                <span className="text-[9px] uppercase tracking-wider font-bold text-amber-300/80">
                  Build First
                </span>
              </div>
            ) : (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={isSolved ? product : typedAnswer}
                disabled={isSolved}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  onAnswerChange?.(val);
                }}
                placeholder="?"
                className={`w-22 h-16 sm:w-28 sm:h-22 md:w-34 md:h-26 rounded-2xl sm:rounded-3xl text-center font-black font-mono tracking-tight transition-all border-2 sm:border-3 outline-none ${
                  isLargeFont ? "text-4xl sm:text-6xl md:text-7xl" : "text-3xl sm:text-5xl md:text-6xl"
                } ${
                  isSolved
                    ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_35px_rgba(16,185,129,0.7)]"
                    : errorMessage
                    ? "bg-rose-950/70 border-rose-500 text-rose-300 animate-shake"
                    : "bg-black/80 border-amber-400 text-amber-300 focus:border-amber-300 ring-2 sm:ring-4 ring-amber-400/30 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                }`}
              />
            )}

            {!isSolved && !isInputLocked && typedAnswer.length === 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-amber-400 animate-ping pointer-events-none" />
            )}
          </form>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400/90">
            Answer
          </span>
        </div>

        {/* Prominent Visible Hint Button */}
        {onOpenHint && (
          <button
            onClick={onOpenHint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all font-bold text-xs cursor-pointer shadow-sm self-center pb-2 ml-1"
            title="View conceptual math hint"
          >
            <Lightbulb className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Hint</span>
          </button>
        )}
      </div>

      {/* Subtle Error Message with Interactive Hint Link (Item 21) */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] sm:text-xs text-rose-300 font-bold text-center mt-1 py-1 px-3 bg-rose-950/50 rounded-lg border border-rose-500/30 flex items-center justify-center gap-1.5 flex-wrap"
        >
          <span>{errorMessage}</span>
          {onOpenHint && (
            <button
              onClick={onOpenHint}
              className="underline text-amber-300 hover:text-white font-bold ml-1 cursor-pointer"
            >
              💡 Open Hint
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
