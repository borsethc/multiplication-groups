"use client";

import { Volume2, VolumeX, HelpCircle, Flame, ArrowLeft, GraduationCap, KeyRound, User } from "lucide-react";
import { StudentProfile } from "@/lib/studentStorage";

interface NavbarProps {
  factorA: number;
  factorB: number;
  score: number;
  streak: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSelector?: () => void;
  onOpenInstructions: () => void;
  onBackToDashboard?: () => void;
  currentStudent?: StudentProfile;
  onOpenPinModal?: () => void;
  onOpenTeacherDashboard?: () => void;
}

export function Navbar({
  factorA,
  factorB,
  score,
  streak,
  isMuted,
  onToggleMute,
  onOpenInstructions,
  onBackToDashboard,
  currentStudent,
  onOpenPinModal,
  onOpenTeacherDashboard,
}: NavbarProps) {
  return (
    <header className="w-full flex items-center justify-between py-1 px-2 sm:py-1.5 sm:px-4 md:px-6 border-b border-white/5 bg-[#08090e]/95 backdrop-blur-3xl sticky top-0 z-40 shrink-0">
      
      {/* Left: ChadMath Brand & Streak Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-lg sm:text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40">
              ChadMath
            </h1>
            <span className="px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Groups
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 hidden sm:block font-bold">
            Less Thinking, More Neural Linking
          </span>
        </div>

        {/* Day Streak badge */}
        {streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{streak}</span>
          </div>
        )}
      </div>

      {/* Center: ACTIVE STUDENT PIN BADGE & MAIN MENU */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Active Student Pill with PIN */}
        {currentStudent && onOpenPinModal && (
          <button
            onClick={onOpenPinModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all shadow-sm cursor-pointer group"
            title="Switch student profile with PIN"
          >
            <span className="text-base sm:text-lg">{currentStudent.avatar}</span>
            <span className="font-bold text-xs hidden xs:inline">{currentStudent.name.split(" ")[0]}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              {currentStudent.pin}
            </span>
            <KeyRound className="w-3 h-3 text-white/40 group-hover:text-cyan-300 transition-colors hidden sm:block" />
          </button>
        )}

        {/* RETURN TO MAIN MENU BUTTON */}
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white font-bold text-xs sm:text-sm transition-all shadow-sm group cursor-pointer"
            title="Return to Main Menu"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Main Menu</span>
          </button>
        )}
      </div>

      {/* Right: Teacher Portal, Score Counter & Audio Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* TEACHER PORTAL BUTTON */}
        {onOpenTeacherDashboard && (
          <button
            onClick={onOpenTeacherDashboard}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
            title="Teacher Dashboard & Progress Analytics"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Teacher</span>
          </button>
        )}

        {/* Score Counter */}
        <div className="flex flex-col items-end mr-0.5 sm:mr-1">
          <span className="text-[8px] uppercase tracking-widest text-white/40 font-bold hidden xs:block">
            Score
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
            {score}
          </span>
        </div>

        {/* Sound toggle */}
        <button
          onClick={onToggleMute}
          className={`p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer ${
            isMuted
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white"
          }`}
          title={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />}
        </button>

        {/* Help Guide */}
        <button
          onClick={onOpenInstructions}
          className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          title="Guide"
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
        </button>
      </div>
    </header>
  );
}
