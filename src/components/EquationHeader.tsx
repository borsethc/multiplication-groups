"use client";

import { motion } from "framer-motion";
import { Sparkles, HelpCircle } from "lucide-react";

interface EquationHeaderProps {
  factorA: number; // Groups (Lines)
  factorB: number; // Tokens per group
  currentStep: 1 | 2 | 3 | 4;
  typedAnswer: string;
  isSolved: boolean;
  onOpenHelp: () => void;
  onAnswerChange?: (val: string) => void;
  onSubmitAnswer?: () => void;
  errorMessage?: string | null;
}

export function EquationHeader({
  factorA,
  factorB,
  currentStep,
  typedAnswer,
  isSolved,
  onOpenHelp,
  onAnswerChange,
  onSubmitAnswer,
  errorMessage,
}: EquationHeaderProps) {
  const product = factorA * factorB;

  return (
    <div className="w-full flex flex-col items-center shrink-0">
      <div className="relative w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-xl shadow-md flex flex-col items-center gap-1">
        
        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="absolute top-1.5 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] font-semibold border border-white/5 transition-colors"
          title="Guide"
        >
          <HelpCircle className="w-2.5 h-2.5 text-cyan-400" />
          <span>Guide</span>
        </button>

        {/* The Equation - Compact & Ultra Crisp */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {/* Factor A: Groups */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                borderColor: currentStep === 1 ? "#06b6d4" : "rgba(255,255,255,0.15)",
                scale: currentStep === 1 ? [1, 1.04, 1] : 1,
              }}
              transition={{ repeat: currentStep === 1 ? Infinity : 0, duration: 2 }}
              className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg bg-cyan-950/40 border-2 border-cyan-500/40"
            >
              <span className="text-xl sm:text-2xl font-black text-cyan-400">
                {factorA}
              </span>
            </motion.div>
            <span className="text-[9px] uppercase tracking-wider font-bold text-cyan-300/70">
              Groups
            </span>
          </div>

          {/* Multiplication Sign */}
          <span className="text-lg sm:text-xl font-black text-white/40 pb-2">
            ×
          </span>

          {/* Factor B: Tokens per group */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                borderColor: currentStep === 2 ? "#a855f7" : "rgba(255,255,255,0.15)",
                scale: currentStep === 2 ? [1, 1.04, 1] : 1,
              }}
              transition={{ repeat: currentStep === 2 ? Infinity : 0, duration: 2 }}
              className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg bg-purple-950/40 border-2 border-purple-500/40"
            >
              <span className="text-xl sm:text-2xl font-black text-purple-400">
                {factorB}
              </span>
            </motion.div>
            <span className="text-[9px] uppercase tracking-wider font-bold text-purple-300/70">
              Tokens/Line
            </span>
          </div>

          {/* Equals Sign */}
          <span className="text-lg sm:text-xl font-black text-white/40 pb-2">
            =
          </span>

          {/* Result / Input Box - Learner Types Here! */}
          <div className="flex flex-col items-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitAnswer?.();
              }}
              className="flex items-center"
            >
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
                className={`w-14 sm:w-16 h-8 sm:h-9 rounded-lg text-center text-lg sm:text-xl font-black transition-all border-2 outline-none ${
                  isSolved
                    ? "bg-emerald-950/40 border-emerald-400 text-emerald-400 shadow-md shadow-emerald-500/20"
                    : errorMessage
                    ? "bg-rose-950/40 border-rose-500 text-rose-300 animate-shake"
                    : currentStep === 3
                    ? "bg-amber-950/30 border-amber-400 text-amber-300 ring-2 ring-amber-400/20"
                    : "bg-black/40 border-white/15 text-white/70"
                }`}
              />
            </form>
            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
              {isSolved ? "Product" : "Type Answer"}
            </span>
          </div>
        </div>

        {/* Dynamic Context Guidance */}
        <div className="text-center">
          {errorMessage ? (
            <motion.p
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-rose-400 font-bold"
            >
              {errorMessage}
            </motion.p>
          ) : currentStep === 1 ? (
            <p className="text-[11px] text-cyan-300 font-medium">
              Look at the 1st factor. Touch below to draw the groups.
            </p>
          ) : currentStep === 2 ? (
            <p className="text-[11px] text-purple-300 font-medium">
              Look at the 2nd factor. Touch each line to add tokens.
            </p>
          ) : currentStep === 3 ? (
            <p className="text-[11px] text-amber-300 font-medium">
              Touch tokens to count them, then type your answer!
            </p>
          ) : (
            <p className="text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Correct! {factorA} groups of {factorB} = {product}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
