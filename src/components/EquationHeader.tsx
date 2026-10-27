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
      {/* MATH FACT ROW: PROMINENT EQUATION WITH CONTROLS */}
      <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 flex-wrap">

        {/* Factor 1 Column */}
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          <motion.div
            animate={{
              scale: factorAGreen ? [1, 1.04, 1] : currentStep === 1 ? [1, 1.02, 1] : 1,
              borderColor: factorAGreen ? "#10b981" : currentStep === 1 ? "#06b6d4" : "rgba(255,255,255,0.15)",
            }}
            transition={{ repeat: !factorAGreen && currentStep === 1 ? Infinity : 0, duration: 1.8 }}
            className={`px-2.5 py-0.5 xs:px-3 xs:py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all duration-300 flex items-center justify-center gap-1 shadow-lg ${
              factorAGreen
                ? "bg-emerald-950/70 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : currentStep === 1
                ? "bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-2 ring-cyan-500/20"
                : "bg-white/5 border-white/15 text-white/75"
            }`}
          >
            <span
              className={`font-black tracking-tighter drop-shadow-md ${
                isLargeFont ? "text-3xl xs:text-4xl sm:text-5xl md:text-6xl" : "text-2xl xs:text-3xl sm:text-4xl md:text-5xl"
              }`}
            >
              {factorA}
            </span>
            {factorAGreen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center ml-0.5 shadow-sm"
              >
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3.5]" />
              </motion.div>
            )}
          </motion.div>
          <span className="text-[9px] xs:text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-400/90">
            1st Factor (Groups)
          </span>
        </div>

        {/* Multiplication Operator */}
        <div className="flex items-center justify-center pt-1 xs:pt-1.5 sm:pt-2 md:pt-2.5">
          <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-light text-white/40 select-none px-0.5">
            ×
          </span>
        </div>

        {/* Factor 2 Column */}
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          <motion.div
            animate={{
              scale: factorBGreen ? [1, 1.04, 1] : currentStep === 2 ? [1, 1.02, 1] : 1,
              borderColor: factorBGreen ? "#10b981" : currentStep === 2 ? "#a855f7" : "rgba(255,255,255,0.15)",
            }}
            transition={{ repeat: !factorBGreen && currentStep === 2 ? Infinity : 0, duration: 1.8 }}
            className={`px-2.5 py-0.5 xs:px-3 xs:py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 transition-all duration-300 flex items-center justify-center gap-1 shadow-lg ${
              factorBGreen
                ? "bg-emerald-950/70 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : currentStep === 2
                ? "bg-purple-950/60 border-purple-400 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/20"
                : "bg-white/5 border-white/15 text-white/75"
            }`}
          >
            <span
              className={`font-black tracking-tighter drop-shadow-md ${
                isLargeFont ? "text-3xl xs:text-4xl sm:text-5xl md:text-6xl" : "text-2xl xs:text-3xl sm:text-4xl md:text-5xl"
              }`}
            >
              {factorB}
            </span>
            {factorBGreen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center ml-0.5 shadow-sm"
              >
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3.5]" />
              </motion.div>
            )}
          </motion.div>
          <span className="text-[9px] xs:text-[10px] sm:text-xs font-black uppercase tracking-wider text-purple-400/90">
            2nd Factor (In Each Group)
          </span>
        </div>

        {/* Equals Operator */}
        <div className="flex items-center justify-center pt-1 xs:pt-1.5 sm:pt-2 md:pt-2.5">
          <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-light text-white/40 select-none px-0.5">
            =
          </span>
        </div>

        {/* Product Column */}
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isInputLocked) onSubmitAnswer?.();
            }}
            className="flex items-center relative"
          >
            {isInputLocked ? (
              /* Build-First Locked Indicator (Item 9) */
              <div
                className="w-16 h-10 xs:w-18 xs:h-11 sm:w-22 sm:h-13 md:w-26 md:h-15 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center bg-white/5 border-2 border-white/15 text-white/40 shadow-inner"
                title="Build groups and dots first to unlock answer"
              >
                <Lock className="w-4 h-4 text-amber-400/70 mb-0.5" />
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-amber-300/80">
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
                className={`w-16 h-10 xs:w-18 xs:h-11 sm:w-22 sm:h-13 md:w-26 md:h-15 rounded-xl sm:rounded-2xl text-center font-black tracking-tight transition-all border-2 sm:border-3 outline-none ${
                  isLargeFont ? "text-3xl xs:text-4xl sm:text-5xl md:text-6xl" : "text-2xl xs:text-3xl sm:text-4xl md:text-5xl"
                } ${
                  isSolved
                    ? "bg-emerald-950/70 border-emerald-400 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                    : errorMessage
                    ? "bg-rose-950/60 border-rose-500 text-rose-300 animate-shake"
                    : "bg-black/80 border-amber-400 text-amber-300 focus:border-amber-300 ring-2 sm:ring-3 ring-amber-400/25 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                }`}
              />
            )}

            {!isSolved && !isInputLocked && typedAnswer.length === 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping pointer-events-none" />
            )}
          </form>
          <span className="text-[9px] xs:text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400/90">
            Product (Answer)
          </span>
        </div>

        {/* Prominent Visible Hint Button (Item 21) */}
        {onOpenHint && (
          <button
            onClick={onOpenHint}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all font-bold text-xs cursor-pointer shadow-sm self-center ml-1"
            title="View conceptual math hint"
          >
            <Lightbulb className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xs:inline">Hint</span>
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
