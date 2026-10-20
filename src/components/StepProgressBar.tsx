"use client";

import { motion } from "framer-motion";
import { Check, Layers, CircleDot, Hash, Trophy } from "lucide-react";

interface StepProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function StepProgressBar({ currentStep }: StepProgressBarProps) {
  const steps = [
    { num: 1, label: "1. Add Lines", icon: Layers, color: "text-cyan-400", border: "border-cyan-500" },
    { num: 2, label: "2. Add Tokens", icon: CircleDot, color: "text-purple-400", border: "border-purple-500" },
    { num: 3, label: "3. Count & Color", icon: Hash, color: "text-amber-400", border: "border-amber-500" },
    { num: 4, label: "4. Mastered!", icon: Trophy, color: "text-emerald-400", border: "border-emerald-500" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-2">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-white/10 rounded-full z-0" />

        {/* Progress track line */}
        <motion.div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-full z-0"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.4 }}
        />

        {steps.map((step) => {
          const isPassed = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const Icon = step.icon;

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  boxShadow: isCurrent
                    ? "0 0 18px rgba(6, 182, 212, 0.4)"
                    : isPassed
                    ? "0 0 10px rgba(16, 185, 129, 0.3)"
                    : "none",
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-colors ${
                  isPassed
                    ? "bg-emerald-600 border-emerald-400 text-white"
                    : isCurrent
                    ? "bg-slate-900 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30"
                    : "bg-slate-900 border-white/20 text-white/40"
                }`}
              >
                {isPassed ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </motion.div>
              <span
                className={`mt-1.5 text-[10px] sm:text-xs font-semibold tracking-tight transition-colors hidden sm:block ${
                  isCurrent
                    ? "text-white font-bold"
                    : isPassed
                    ? "text-emerald-400"
                    : "text-white/40"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
