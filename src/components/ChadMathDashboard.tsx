"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Flame, Trophy, Eye, ShieldCheck, RotateCcw, AlertTriangle, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import { StudentProfile } from "@/lib/studentStorage";

interface ChadMathDashboardProps {
  score: number;
  streak: number;
  dailySessions: number; // 0 to 5 completed sessions
  currentSessionSolves: number; // 0 to 4 within current session
  selectedTables: number[]; // e.g. [2, 3, 4]
  onToggleTable: (table: number) => void;
  onSelectAllTables: () => void;
  onDeselectAllTables: () => void;
  isMultipleChoice: boolean;
  onToggleMultipleChoice: () => void;
  tableMastery: Record<number, number>; // Clean Recall mastery (2..9 -> 0..1)
  mcMastery?: Record<number, number>; // Multiple Choice mastery (2..9 -> 0..1)
  onStartPlay: () => void;
  currentStudent?: StudentProfile | null;
  onSwitchPlayer?: () => void;
  onOpenParentView?: () => void;
  onOpenAccessibility?: () => void;
  onStartMultiples?: () => void;
}

export function ChadMathDashboard({
  score,
  streak,
  dailySessions,
  currentSessionSolves,
  selectedTables,
  onToggleTable,
  onSelectAllTables,
  onDeselectAllTables,
  isMultipleChoice,
  onToggleMultipleChoice,
  tableMastery,
  mcMastery = {},
  onStartPlay,
  currentStudent,
  onSwitchPlayer,
  onOpenParentView,
  onOpenAccessibility,
  onStartMultiples,
}: ChadMathDashboardProps) {
  // Daily session progress (0 to 5 sessions)
  const sessionTarget = 5;
  const progressPercent = Math.min((dailySessions / sessionTarget) * 100, 100);

  const allTables = [2, 3, 4, 5, 6, 7, 8, 9];
  const isAllSelected = selectedTables.length === allTables.length;
  const isNoneSelected = selectedTables.length === 0;

  // Calculate Overall Recall Mastery & MC Mastery
  const totalRecallSum = allTables.reduce((acc, tbl) => acc + (tableMastery[tbl] || 0), 0);
  const overallRecallPercent = Math.round((totalRecallSum / allTables.length) * 100);

  const totalMcSum = allTables.reduce((acc, tbl) => acc + (mcMastery[tbl] || 0), 0);
  const overallMcPercent = Math.round((totalMcSum / allTables.length) * 100);

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
        badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
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

  const recallTier = getMasteryTier(overallRecallPercent / 100);

  return (
    <div className="flex-1 w-full max-w-sm sm:max-w-md md:max-w-xl mx-auto flex flex-col items-center justify-start p-2 sm:p-4 z-10 overflow-y-auto select-none">
      {/* BRAND HEADER */}
      <div className="flex flex-col items-center text-center mb-1 sm:mb-2 shrink-0">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-0.5">
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
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
            ChadMath
          </h1>
        </div>
        {/* Educational Tagline (Item 24) */}
        <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-cyan-300/80 font-bold">
          Visual Multiplication Mastery Through Grouping & Patterns
        </p>
      </div>

      {/* MAIN DASHBOARD CARD */}
      <div className="w-full bg-[#10121b]/95 border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 backdrop-blur-2xl shadow-2xl flex flex-col items-center gap-2 sm:gap-2.5 shrink-0">
        
        {/* PLAYER HEADER & TOP CONTROLS */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 sm:py-2 rounded-2xl bg-white/[0.04] border border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-lg sm:text-2xl">{currentStudent?.avatar || "🌟"}</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] uppercase tracking-wider text-white/40 font-bold">Player</span>
                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Main Menu
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                {currentStudent?.name || "Player"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenParentView && (
              <button
                onClick={onOpenParentView}
                className="px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white text-[11px] font-bold border border-indigo-500/20 transition-colors cursor-pointer flex items-center gap-1"
                title="Parent view & progress report"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Parent</span>
              </button>
            )}

            {onOpenAccessibility && (
              <button
                onClick={onOpenAccessibility}
                className="p-1 sm:p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Accessibility settings"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}

            {onSwitchPlayer && (
              <button
                onClick={onSwitchPlayer}
                className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white text-[11px] font-bold border border-white/10 transition-colors cursor-pointer"
              >
                Switch
              </button>
            )}
          </div>
        </div>

        {/* DAILY SESSIONS PROGRESS WITH EXPLICIT EXPLANATION (Item 13) */}
        <div className="w-full p-2 sm:p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/60 font-bold">
                Daily Sessions: {dailySessions} / {sessionTarget} Complete
              </span>
            </div>
            <p className="text-[10px] text-white/50 mt-0.5">
              A session is 5 solved facts. Progress: Fact {currentSessionSolves} of 5 in this session
            </p>
          </div>

          {/* 5-step progress dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full border transition-all ${
                  idx < currentSessionSolves
                    ? "bg-cyan-400 border-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                    : "bg-white/5 border-white/20"
                }`}
                title={`Fact ${idx + 1} of 5`}
              />
            ))}
          </div>
        </div>

        {/* MULTIPLICATION TABLES GRID: SELECT ALL & DESELECT ALL (Item 11 & 12) */}
        <div className="w-full flex flex-col items-center gap-1 pt-1 border-t border-white/5">
          <div className="w-full flex items-center justify-between px-1">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 font-bold">
              Multiplication Tables
            </span>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px]">
              <button
                onClick={onSelectAllTables}
                className="text-indigo-400 hover:text-indigo-300 font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 transition-colors cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={onDeselectAllTables}
                className="text-white/50 hover:text-white font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 transition-colors cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Active selection summary */}
          <div className="w-full text-center text-[10px] sm:text-[11px] text-indigo-300 font-semibold truncate px-1">
            {isAllSelected
              ? "All Tables Selected (×2 through ×9)"
              : isNoneSelected
              ? "⚠️ None Selected — Please select at least one table!"
              : `Selected: ${selectedTables.map((t) => `×${t}`).join(", ")}`}
          </div>

          {/* Grid of Tables [×2] [×3] [×4] [×5] [×6] [×7] [×8] [×9] */}
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
                  title={`Table ×${tbl}: ${masteryPercent}% Clean Recall (${tier.label})`}
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

        {/* MULTIPLE CHOICE SCAFFOLD TOGGLE */}
        <div className="w-full pt-1 border-t border-white/5">
          <button
            onClick={onToggleMultipleChoice}
            className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-colors cursor-pointer ${
              isMultipleChoice
                ? "bg-purple-950/40 border-purple-500/40 text-purple-200"
                : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white"
            }`}
          >
            <div>
              <span className="text-xs font-bold block text-white">
                Multiple Choice Mode: {isMultipleChoice ? "ON" : "OFF"}
              </span>
              <span className="text-[9px] text-amber-300 font-bold block">
                Recognition scaffold — clean recall required for table mastery
              </span>
            </div>
            <div
              className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                isMultipleChoice ? "bg-purple-600 justify-end" : "bg-white/20 justify-start"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
            </div>
          </button>
        </div>


        {/* BIG GLOWING CIRCULAR PLAY BUTTON */}
        <div className="mt-1 flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onStartPlay}
            disabled={isNoneSelected}
            className={`w-18 h-18 sm:w-22 sm:h-22 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer group ${
              isNoneSelected
                ? "bg-white/10 border-white/20 text-white/30 cursor-not-allowed"
                : "bg-[#4f46e5] hover:bg-[#4338ca] text-white shadow-[0_0_35px_rgba(79,70,229,0.6)] border-indigo-400/40"
            }`}
            title={isNoneSelected ? "Select at least one table first" : "Start Practice"}
          >
            <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-white stroke-none ml-1 drop-shadow-md group-hover:scale-110 transition-transform" />
          </motion.button>
          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-300/80 uppercase tracking-widest mt-1">
            {isNoneSelected ? "Select a table above" : "Start Fact Practice"}
          </span>

          {onStartMultiples && (
            <button
              onClick={onStartMultiples}
              className="mt-2.5 py-2 px-4 rounded-2xl bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-cyan-900/50 hover:from-purple-900/70 hover:to-cyan-900/70 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md group active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>🔢 Practice Multiples (Skip-Counting)</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

      </div>

      {/* FOOTER STATS ROW */}
      <div className="w-full flex items-center justify-between px-2 mt-2 sm:mt-2.5 text-[11px] sm:text-xs text-white/50">
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
