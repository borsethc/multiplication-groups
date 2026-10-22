"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Pause, Play, Sparkles } from "lucide-react";
import { getContextualHints, ContextualHintItem } from "@/lib/hints";

interface HintTickerProps {
  factorA: number;
  factorB: number;
  currentStep: 1 | 2 | 3 | 4;
  linesCount?: number;
  tokensCount?: number;
  onHintClick?: (text: string) => void;
}

export function HintTicker({
  factorA,
  factorB,
  currentStep,
  linesCount = 0,
  tokensCount = 0,
  onHintClick,
}: HintTickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Get context-aware morphing hints
  const items = useMemo(() => {
    return getContextualHints(factorA, factorB, currentStep, linesCount, tokensCount);
  }, [factorA, factorB, currentStep, linesCount, tokensCount]);

  // Duplicate items array so the ticker can loop continuously without gaps
  const loopItems = useMemo(() => [...items, ...items], [items]);

  return (
    <div className="w-full max-w-xl mx-auto flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-sm relative overflow-hidden group">
      
      {/* Left fixed badge */}
      <div className="flex items-center gap-1 shrink-0 z-20 bg-[#0d0f17] pr-2 border-r border-white/10">
        <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
          <Lightbulb className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 hidden xs:inline">
          Hints
        </span>
      </div>

      {/* Left edge fade gradient mask */}
      <div className="absolute left-10 xs:left-16 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0d0f17] to-transparent pointer-events-none z-10" />

      {/* CONTINUOUS TICKER MARQUEE TRACK */}
      <div
        className="flex-1 overflow-hidden relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`step-${currentStep}-${factorA}x${factorB}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className={`animate-ticker-marquee flex items-center gap-6 py-0.5 text-xs text-slate-200 select-none ${
              isPaused ? "[animation-play-state:paused]" : ""
            }`}
          >
            {loopItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => onHintClick?.(item.text)}
                className="flex items-center gap-2 shrink-0 cursor-pointer hover:text-white transition-colors"
              >
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border tracking-wider ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
                <span className="font-medium whitespace-nowrap text-[11px] sm:text-xs">
                  {item.text}
                </span>
                <span className="text-white/20 select-none ml-2">◆</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right edge fade gradient mask */}
      <div className="absolute right-7 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0d0f17] to-transparent pointer-events-none z-10" />

      {/* Right Pause/Play button */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="shrink-0 p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-colors z-20"
        title={isPaused ? "Resume ticker" : "Pause ticker"}
      >
        {isPaused ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5" />}
      </button>
    </div>
  );
}
