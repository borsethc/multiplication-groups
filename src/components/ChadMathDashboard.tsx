"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Flame, Trophy, KeyRound, UserCheck, RefreshCw } from "lucide-react";
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
  onOpenPinModal?: () => void;
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
  onOpenPinModal,
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

  return (
    <div className="flex-1 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto flex flex-col items-center justify-center p-2 sm:p-4 z-10 overflow-hidden select-none">
      {/* BRAND HEADER (Compact for iPhone, generous for iPad) */}
      <div className="flex flex-col items-center text-center mb-1.5 sm:mb-3 shrink-0">
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
      <div className="w-full bg-[#10121b]/95 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-2 sm:gap-3 shrink-0">
        
        {/* STUDENT PIN PROFILE BAR */}
        {currentStudent && onOpenPinModal && (
          <div className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
            <div className="flex items-center gap-2 text-left">
              <span className="text-xl sm:text-2xl">{currentStudent.avatar}</span>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  {currentStudent.name}
                </span>
                <span className="text-[10px] text-white/50 font-medium">
                  Solved: <strong className="text-cyan-300">{currentStudent.totalSolved}</strong> • Streak: <strong className="text-orange-400">{currentStudent.streak}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onOpenPinModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-[11px] font-bold border border-white/10 transition-colors cursor-pointer group"
              title="Switch learner profile"
            >
              <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform" />
              <span>Switch</span>
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
          <div className="relative w-18 h-18 sm:w-22 sm:h-22 my-1.5 sm:my-2 flex items-center justify-center">
            <svg className="w-18 h-18 sm:w-22 sm:h-22 -rotate-90">
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="stroke-white/10"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="36"
                cy="36"
                r={radius}
                className={
                  dailySessions >= sessionTarget
                    ? "stroke-emerald-400"
                    : "stroke-indigo-500"
                }
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base sm:text-lg font-black text-white leading-none">
                {Math.round(progressPercent)}%
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/40 font-semibold mt-0.5">
                Goal
              </span>
            </div>
          </div>
        </div>

        {/* PRACTICE MODE TOGGLE */}
        <div className="w-full flex flex-col items-center gap-1">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 font-bold">
            Practice Mode
          </span>
          <button
            onClick={onToggleMultipleChoice}
            className="w-full py-1.5 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 flex items-center justify-center gap-2 transition-colors group cursor-pointer"
          >
            <div
              className={`w-5 h-3 rounded-full p-0.5 transition-colors flex items-center ${
                isMultipleChoice ? "bg-indigo-600 justify-end" : "bg-white/20 justify-start"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-white">
              {isMultipleChoice ? "Multiple Choice On" : "Multiple Choice Off"}
            </span>
            <span className="text-[9px] sm:text-[10px] text-white/40 font-medium hidden xs:inline">
              ({isMultipleChoice ? "Pills" : "Direct Input"})
            </span>
          </button>
        </div>

        {/* MULTIPLICATION TABLES GRID: MULTI-SELECTABLE WITH MASTERY METERS */}
        <div className="w-full flex flex-col items-center gap-1.5 pt-1 border-t border-white/5">
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

          {/* Grid of Tables [×2] [×3] [×4] [×5] [×6] [×7] [×8] [×9] */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-1.5 w-full">
            {allTables.map((tbl) => {
              const isSelected = selectedTables.includes(tbl);
              const mastery = tableMastery[tbl] || 0;
              const masteryPercent = Math.round(mastery * 100);

              let masteryColor = "bg-white/10";
              if (mastery >= 0.8) masteryColor = "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]";
              else if (mastery >= 0.4) masteryColor = "bg-amber-400";
              else if (mastery > 0) masteryColor = "bg-indigo-400";

              return (
                <button
                  key={tbl}
                  onClick={() => onToggleTable(tbl)}
                  className={`py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl flex flex-col items-center justify-between gap-0.5 sm:gap-1 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600/90 border-indigo-400 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] ring-1 ring-indigo-400/50 scale-105"
                      : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-white/70"
                  }`}
                  title={`Toggle Table ×${tbl}`}
                >
                  <span className="text-[11px] sm:text-xs font-black">×{tbl}</span>
                  {/* Mini mastery indicator bar */}
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${masteryColor}`}
                      style={{ width: `${Math.max(masteryPercent, 10)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* BIG GLOWING CIRCULAR PLAY BUTTON */}
        <div className="mt-0.5 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onStartPlay}
            className="w-20 h-20 sm:w-26 sm:h-26 rounded-full bg-[#4f46e5] hover:bg-[#4338ca] text-white flex items-center justify-center shadow-[0_0_35px_rgba(79,70,229,0.6)] border-2 border-indigo-400/40 transition-all cursor-pointer group"
            title="Start Practice"
          >
            <Play className="w-8 h-8 sm:w-11 sm:h-11 fill-white stroke-none ml-1 drop-shadow-md group-hover:scale-110 transition-transform" />
          </motion.button>
          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-300/80 uppercase tracking-widest mt-1">
            Tap to Practice
          </span>
        </div>

      </div>

      {/* FOOTER STATS ROW */}
      <div className="w-full flex items-center justify-between px-2 mt-2 sm:mt-3 text-[11px] sm:text-xs text-white/40">
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
