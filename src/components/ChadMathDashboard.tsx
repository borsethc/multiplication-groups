"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Flame, Trophy } from "lucide-react";
import { StudentProfile } from "@/lib/studentStorage";

interface ChadMathDashboardProps {
  score: number;
  streak: number;
  dailySessions: number; // 0 to 5
  selectedTables: number[]; // e.g. [2, 3, 4]
  onToggleTable: (table: number) => void;
  onSelectAllTables: () => void;
  onClearTables: () => void;
  isMultipleChoice: boolean;
  onToggleMultipleChoice: () => void;
  tableMastery: Record<number, number>; // 2..9 -> 0..1
  onStartPlay: () => void;
  currentStudent?: StudentProfile | null;
  onSwitchPlayer?: () => void;
}

export function ChadMathDashboard({
  score,
  streak,
  dailySessions,
  selectedTables,
  onToggleTable,
  onSelectAllTables,
  onClearTables,
  isMultipleChoice,
  onToggleMultipleChoice,
  tableMastery,
  onStartPlay,
  currentStudent,
  onSwitchPlayer,
}: ChadMathDashboardProps) {
  // Daily session progress (0 to 5)
  const sessionTarget = 5;
  const progressPercent = Math.min((dailySessions / sessionTarget) * 100, 100);

  // Responsive SVG circular meter radius
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  const allTables = [2, 3, 4, 5, 6, 7, 8, 9];
  const isAllSelected = selectedTables.length === allTables.length;
  const isNoneSelected = selectedTables.length === 0;

  // Calculate Overall Factor Mastery across all tables (2..9)
  const totalMasterySum = allTables.reduce((acc, tbl) => acc + (tableMastery[tbl] || 0), 0);
  const overallMasteryPercent = Math.round((totalMasterySum / allTables.length) * 100);

  // Helper for red -> yellow -> green mastery tier (matching original ChadMath)
  const getMasteryTier = (mastery: number) => {
    if (mastery >= 0.8) {
      return {
        bar: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
        gradient: "from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        text: "text-emerald-400",
        label: "Mastered",
      };
    }
    if (mastery >= 0.4) {
      return {
        bar: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]",
        gradient: "from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]",
        badge: "bg-amber-500/20 text-amber-300 border-yellow-500/30",
        text: "text-amber-400",
        label: "Progressing",
      };
    }
    if (mastery > 0) {
      return {
        bar: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
        gradient: "from-red-600 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]",
        badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        text: "text-rose-400",
        label: "Learning",
      };
    }
    return {
      bar: "bg-white/10",
      gradient: "from-white/10 to-white/20",
      badge: "bg-white/5 text-white/40 border-white/10",
      text: "text-white/40",
      label: "Unplayed",
    };
  };

  const overallTier = getMasteryTier(overallMasteryPercent / 100);

  return (
    <div className="flex-1 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto flex flex-col items-center justify-center p-2 sm:p-4 z-10 overflow-hidden select-none">
      {/* BRAND HEADER (Compact for iPhone, generous for iPad) */}
      <div className="flex flex-col items-center text-center mb-1.5 sm:mb-2.5 shrink-0">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-0.5">
          {/* Patriot Mascot Logo */}
          <div className="relative w-10 h-7 sm:w-14 sm:h-9 bg-white rounded-md sm:rounded-lg flex items-center justify-center px-1 py-0.5 shadow-md shadow-white/5 border border-white/20 overflow-hidden">
            <Image
              src="/chadmath-logo.png"
              alt="ChadMath Mascot"
              width={64}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
            ChadMath
          </h1>
        </div>
        <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.22em] text-white/50 font-bold">
          Less Thinking, More Neural Linking
        </p>
      </div>

      {/* MAIN DASHBOARD CARD (Fit 100% on iPhone & iPad with zero scrolling) */}
      <div className="w-full bg-[#10121b]/95 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-2 sm:gap-2.5 shrink-0">
        
        {/* PLAYER HEADER & SWITCH (Original ChadMath Style) */}
        {currentStudent && onSwitchPlayer && (
          <div className="w-full flex items-center justify-between px-3 py-1.5 sm:py-2 rounded-2xl bg-white/[0.04] border border-white/10 shrink-0">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-lg sm:text-2xl">{currentStudent.avatar}</span>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Player</span>
                <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {currentStudent.name}
                </span>
              </div>
            </div>

            <button
              onClick={onSwitchPlayer}
              className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer"
            >
              Switch Player
            </button>
          </div>
        )}

        {/* TOP: DAILY SESSIONS BADGE + PROGRESS METER */}
        <div className="flex flex-col items-center w-full">
          {/* Badge: DAILY SESSIONS: 0 / 5 */}
          <div className="px-3.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-2 shadow-inner">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/60 font-semibold">
              Daily Sessions:
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              {dailySessions} / {sessionTarget}
            </span>
          </div>

          {/* CIRCULAR PROGRESS METER */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 my-1 sm:my-1.5 flex items-center justify-center">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                className="stroke-white/10"
                strokeWidth="5"
                fill="none"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="26"
                className={
                  dailySessions >= sessionTarget
                    ? "stroke-emerald-400"
                    : "stroke-indigo-500"
                }
                strokeWidth="5"
                fill="none"
                strokeDasharray={2 * Math.PI * 26}
                initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 26 -
                    (2 * Math.PI * 26 * progressPercent) / 100,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm sm:text-base font-black text-white leading-none">
                {Math.round(progressPercent)}%
              </span>
              <span className="text-[7px] sm:text-[8px] uppercase tracking-widest text-white/40 font-semibold mt-0.5">
                Goal
              </span>
            </div>
          </div>
        </div>

        {/* FACTOR MASTERY PROGRESS BAR (Original ChadMath Red -> Yellow -> Green) */}
        <div className="w-full bg-white/[0.03] p-2 sm:p-2.5 rounded-2xl border border-white/10 flex flex-col gap-1.5">
          <div className="w-full flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 font-bold">
                Factor Mastery
              </span>
              <span className={`text-[10px] sm:text-xs font-black ${overallTier.text}`}>
                {overallMasteryPercent}%
              </span>
            </div>

            {/* Red to Yellow to Green Color Legend */}
            <div className="flex items-center gap-2 text-[8px] sm:text-[9px] font-semibold text-white/40">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.8)]" />
                <span>&lt;40%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.8)]" />
                <span>40–79%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span>80%+</span>
              </span>
            </div>
          </div>

          {/* Master Progress Bar (Red to Yellow to Green Gradient) */}
          <div className="w-full h-2 sm:h-2.5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max(overallMasteryPercent, overallMasteryPercent > 0 ? 5 : 0)}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${overallTier.gradient}`}
            />
          </div>
        </div>

        {/* MULTIPLICATION TABLES GRID: MULTI-SELECTABLE WITH MASTERY PROGRESS BARS */}
        <div className="w-full flex flex-col items-center gap-1 pt-1 border-t border-white/5">
          <div className="w-full flex items-center justify-between px-1">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 font-bold">
              Multiplication Tables
            </span>
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px]">
              <button
                onClick={onSelectAllTables}
                className="text-indigo-400 hover:text-indigo-300 font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 transition-colors cursor-pointer"
              >
                All
              </button>
              <button
                onClick={onClearTables}
                className="text-white/40 hover:text-white font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Active selection summary */}
          <div className="w-full text-center text-[10px] sm:text-[11px] text-indigo-300 font-semibold truncate px-1">
            {isAllSelected
              ? "All Tables Selected (×2 through ×9)"
              : isNoneSelected
              ? "All Tables Active (Random Mix)"
              : `Selected: ${selectedTables.map((t) => `×${t}`).join(", ")}`}
          </div>

          {/* Grid of Tables [×2] [×3] [×4] [×5] [×6] [×7] [×8] [×9] with Red-Yellow-Green Progress Bars */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-1.5 w-full">
            {allTables.map((tbl) => {
              const isSelected = selectedTables.includes(tbl);
              const mastery = tableMastery[tbl] || 0;
              const masteryPercent = Math.round(mastery * 100);
              const tier = getMasteryTier(mastery);

              return (
                <button
                  key={tbl}
                  onClick={() => onToggleTable(tbl)}
                  className={`py-1.5 sm:py-2 px-1.5 rounded-lg sm:rounded-xl flex flex-col items-center justify-between gap-1 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/90 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] ring-1 ring-indigo-400/50 scale-105"
                      : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-white/70"
                  }`}
                  title={`Table ×${tbl}: ${masteryPercent}% Mastery (${tier.label})`}
                >
                  <div className="flex items-center justify-between w-full px-0.5">
                    <span className="text-[11px] sm:text-xs font-black">×{tbl}</span>
                    <span className={`text-[8px] font-bold ${tier.text}`}>
                      {masteryPercent}%
                    </span>
                  </div>

                  {/* Progress bar: Red to Yellow to Green */}
                  <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${tier.bar}`}
                      style={{
                        width: `${Math.max(masteryPercent, mastery > 0 ? 12 : 0)}%`,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PRACTICE MODE TOGGLE */}
        <div className="w-full flex items-center justify-center pt-0.5">
          <button
            onClick={onToggleMultipleChoice}
            className="w-full py-1.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 flex items-center justify-center gap-2 transition-colors group cursor-pointer"
          >
            <div
              className={`w-5 h-3 rounded-full p-0.5 transition-colors flex items-center ${
                isMultipleChoice ? "bg-indigo-600 justify-end" : "bg-white/20 justify-start"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-white">
              {isMultipleChoice ? "Multiple Choice On" : "Multiple Choice Off"}
            </span>
            <span className="text-[9px] text-white/40 font-medium hidden xs:inline">
              ({isMultipleChoice ? "Pills" : "Direct Input"})
            </span>
          </button>
        </div>

        {/* BIG GLOWING CIRCULAR PLAY BUTTON */}
        <div className="mt-0.5 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onStartPlay}
            className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white flex items-center justify-center shadow-[0_0_35px_rgba(79,70,229,0.6)] border-2 border-indigo-400/40 transition-all cursor-pointer group"
            title="Start Practice"
          >
            <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white stroke-none ml-1 drop-shadow-md group-hover:scale-110 transition-transform" />
          </motion.button>
          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-300/80 uppercase tracking-widest mt-1">
            Tap to Practice
          </span>
        </div>

      </div>

      {/* FOOTER STATS ROW */}
      <div className="w-full flex items-center justify-between px-2 mt-2 sm:mt-2.5 text-[11px] sm:text-xs text-white/40">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>Score: <strong className="text-white">{score}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>Streak: <strong className="text-white">{streak}</strong></span>
        </div>
      </div>
    </div>
  );
}
