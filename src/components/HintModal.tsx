"use client";

import { motion } from "framer-motion";
import { X, ArrowLeft, Lightbulb, Sparkles, ArrowRight } from "lucide-react";

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  factorA: number;
  factorB: number;
  currentStep: number;
  linesCount: number;
}

export function HintModal({
  isOpen,
  onClose,
  factorA,
  factorB,
  currentStep,
  linesCount,
}: HintModalProps) {
  if (!isOpen) return null;

  const product = factorA * factorB;

  let hintTitle = "Math Fact Hint";
  let hintBody = "";
  let visualFormula = `${factorA} × ${factorB} = ?`;

  if (currentStep === 1) {
    hintTitle = "Step 1 Hint: Drawing Groups";
    hintBody = `The 1st Factor is ${factorA}. This tells you how many equal groups to make. You currently have ${linesCount} lines. Draw ${factorA - linesCount} more line(s) or click "+ Group"!`;
    visualFormula = `${factorA} groups needed`;
  } else if (currentStep === 2) {
    hintTitle = "Step 2 Hint: Placing Items";
    hintBody = `The 2nd Factor is ${factorB}. This tells you how many items go in EACH group. Tap each line until it has exactly ${factorB} dots.`;
    visualFormula = `${factorB} items per group`;
  } else if (currentStep === 3) {
    hintTitle = "Step 3 Hint: Spotting the Pattern";
    hintBody = `Multiplication is repeated addition! Add ${factorB} together ${factorA} times: ${Array.from({ length: factorA }).map(() => factorB).join(" + ")} = ${product}.`;
    visualFormula = `${Array.from({ length: factorA }).map(() => factorB).join(" + ")} = ${product}`;
  } else {
    hintTitle = "Step 4 Hint: Finding the Product";
    hintBody = `Count the total number of dots across all ${factorA} groups. ${factorA} groups of ${factorB} equals ${product}!`;
    visualFormula = `${factorA} × ${factorB} = ${product}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#0f111a] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-white gap-3.5"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Lightbulb className="w-5 h-5 fill-current" />
            </div>
            <h3 className="font-black text-base sm:text-lg text-white">{hintTitle}</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer"
              title="Return to Main Menu"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Main Menu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-black/50 border border-amber-500/20 text-center">
          <span className="font-mono font-black text-lg sm:text-xl text-amber-300">
            {visualFormula}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {hintBody}
        </p>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition-colors cursor-pointer shadow-md shadow-amber-500/20"
          >
            Got It!
          </button>
        </div>
      </motion.div>
    </div>
  );
}
