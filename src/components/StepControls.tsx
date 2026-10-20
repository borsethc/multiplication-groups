"use client";

import { motion } from "framer-motion";
import { Plus, ArrowRight, RefreshCw, Wand2, PenTool } from "lucide-react";

interface StepControlsProps {
  currentStep: 1 | 2 | 3 | 4;
  linesCount: number;
  totalTokensPlaced: number;
  totalTokensCounted: number;
  onAddLine: () => void;
  onValidateLines: () => void;
  onValidateTokens: () => void;
  onAutoFillTokens: () => void;
  onAutoCountAll: () => void;
  onNextFact: () => void;
  onResetCurrentFact: () => void;
}

export function StepControls({
  currentStep,
  linesCount,
  onAddLine,
  onValidateLines,
  onValidateTokens,
  onAutoFillTokens,
  onAutoCountAll,
  onNextFact,
  onResetCurrentFact,
}: StepControlsProps) {
  return (
    <div className="w-full flex items-center justify-center gap-2 py-1 shrink-0">
      {/* STEP 1: DRAW LINES (Learner decides how many lines!) */}
      {currentStep === 1 && (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddLine}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <PenTool className="w-3.5 h-3.5 stroke-[2.5]" />
            Touch to Draw Line
          </motion.button>

          {linesCount > 0 && (
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onValidateLines}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-purple-500/20"
            >
              <span>Done Drawing Lines</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </motion.button>
          )}

          {linesCount > 0 && (
            <button
              onClick={onResetCurrentFact}
              className="px-2.5 py-1.5 text-white/40 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Reset"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* STEP 2: ADD TOKENS */}
      {currentStep === 2 && (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onValidateTokens}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <span>Done Adding Tokens</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </motion.button>

          <button
            onClick={onAutoFillTokens}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold flex items-center gap-1 border border-white/5 transition-colors"
          >
            <Wand2 className="w-3 h-3 text-purple-400" />
            Auto-Fill
          </button>
        </div>
      )}

      {/* STEP 3: COUNT & SOLVE */}
      {currentStep === 3 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-300 font-semibold px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            Touch tokens to count them, then type your answer above!
          </span>

          <button
            onClick={onAutoCountAll}
            className="px-2.5 py-1 text-white/40 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
          >
            <Wand2 className="w-3 h-3" />
            Count All
          </button>
        </div>
      )}

      {/* STEP 4: SOLVED */}
      {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNextFact}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <span>Next Fact</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </motion.button>

          <button
            onClick={onResetCurrentFact}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1 border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Replay
          </button>
        </motion.div>
      )}
    </div>
  );
}
