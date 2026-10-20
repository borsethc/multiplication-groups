"use client";

import { motion } from "framer-motion";
import { Trash2, Plus, Check } from "lucide-react";

export interface TokenState {
  id: string;
  isCounted: boolean;
  countNumber?: number;
}

export interface GroupLineData {
  id: string;
  groupIndex: number; // 0, 1, 2...
  tokens: TokenState[]; // current tokens placed
  isGroupFullyCounted: boolean;
}

interface GroupLineProps {
  lineData: GroupLineData;
  tokenCapacity: number; // Factor B: target tokens per group
  currentStep: 1 | 2 | 3 | 4;
  onAddToken: (groupIndex: number) => void;
  onRemoveToken: (groupIndex: number, tokenIndex: number) => void;
  onCountToken: (groupIndex: number, tokenIndex: number) => void;
  onRemoveLine?: (groupIndex: number) => void;
  canRemoveLine?: boolean;
}

const GROUP_THEMES = [
  {
    border: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.4)",
    text: "#67e8f9",
    tokenBg: "from-cyan-400 to-cyan-600",
    lineBg: "from-cyan-500 to-blue-600",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  {
    border: "#a855f7",
    glow: "rgba(168, 85, 247, 0.4)",
    text: "#e9d5ff",
    tokenBg: "from-purple-400 to-purple-600",
    lineBg: "from-purple-500 to-pink-600",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    border: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.4)",
    text: "#fde68a",
    tokenBg: "from-amber-400 to-amber-600",
    lineBg: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    border: "#10b981",
    glow: "rgba(168, 85, 247, 0.4)",
    text: "#a7f3d0",
    tokenBg: "from-emerald-400 to-emerald-600",
    lineBg: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    border: "#f43f5e",
    glow: "rgba(244, 63, 94, 0.4)",
    text: "#fecdd3",
    tokenBg: "from-rose-400 to-rose-600",
    lineBg: "from-rose-500 to-red-600",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  {
    border: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.4)",
    text: "#bfdbfe",
    tokenBg: "from-blue-400 to-blue-600",
    lineBg: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    border: "#84cc16",
    glow: "rgba(132, 204, 22, 0.4)",
    text: "#d9f99d",
    tokenBg: "from-lime-400 to-lime-600",
    lineBg: "from-lime-500 to-emerald-600",
    badgeBg: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  },
  {
    border: "#d946ef",
    glow: "rgba(217, 70, 239, 0.4)",
    text: "#f5d0fe",
    tokenBg: "from-fuchsia-400 to-fuchsia-600",
    lineBg: "from-fuchsia-500 to-pink-600",
    badgeBg: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  },
];

export function GroupLine({
  lineData,
  tokenCapacity,
  currentStep,
  onAddToken,
  onRemoveToken,
  onCountToken,
  onRemoveLine,
  canRemoveLine,
}: GroupLineProps) {
  const theme = GROUP_THEMES[lineData.groupIndex % GROUP_THEMES.length];
  const { tokens, isGroupFullyCounted, groupIndex } = lineData;

  // COMPACT VARIABLE LINE LENGTH
  // e.g. 2 tokens: 120px; 7 tokens: 300px; 9 tokens: 380px
  const tokenSlotWidth = 38;
  const paddingWidth = 36;
  const computedPixelWidth = Math.max(120, tokenCapacity * tokenSlotWidth + paddingWidth);

  const canAddMoreTokens = currentStep === 2 && tokens.length < tokenCapacity;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -6 }}
      layout
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative flex items-center justify-between py-1 px-2.5 sm:px-3 rounded-2xl border transition-all duration-300 shrink-0 ${
        isGroupFullyCounted
          ? "border shadow-md bg-white/[0.04]"
          : "border-white/10 bg-white/[0.02]"
      }`}
      style={{
        borderColor: isGroupFullyCounted ? theme.border : undefined,
        boxShadow: isGroupFullyCounted ? `0 0 15px ${theme.glow}` : undefined,
      }}
    >
      {/* Group Identifier Badge */}
      <div className="flex items-center gap-1.5 w-14 shrink-0">
        <span
          className={`font-black px-1.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider flex items-center gap-1 border ${
            isGroupFullyCounted
              ? theme.badgeBg
              : "bg-white/5 text-white/70 border-white/10"
          }`}
        >
          {isGroupFullyCounted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          G{groupIndex + 1}
        </span>

        {canRemoveLine && currentStep === 1 && onRemoveLine && (
          <button
            onClick={() => onRemoveLine(groupIndex)}
            className="p-1 rounded text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Erase this group"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* THE VARIABLE-LENGTH LINE & TOKENS CONTAINER */}
      <div
        className="relative flex items-center justify-center mx-2 transition-all duration-300"
        style={{
          width: `${computedPixelWidth}px`,
          maxWidth: "calc(100vw - 110px)",
        }}
      >
        {/* The Visual Line Spine (Proportional Length!) */}
        <div
          className={`absolute inset-x-0 h-2 rounded-full transition-all duration-300 shadow-inner ${
            isGroupFullyCounted
              ? `bg-gradient-to-r ${theme.lineBg}`
              : tokens.length === tokenCapacity
              ? "bg-gradient-to-r from-white/20 via-white/40 to-white/20"
              : "bg-white/10"
          }`}
          style={{
            boxShadow: isGroupFullyCounted ? `0 0 10px ${theme.border}` : undefined,
          }}
        />

        {/* Tokens & Slots */}
        <div
          onClick={() => {
            if (canAddMoreTokens) onAddToken(groupIndex);
          }}
          className={`relative z-10 w-full flex items-center justify-around py-1.5 ${
            canAddMoreTokens ? "cursor-pointer" : ""
          }`}
        >
          {Array.from({ length: tokenCapacity }).map((_, slotIdx) => {
            const token = tokens[slotIdx];
            const hasToken = !!token;
            const isCounted = token?.isCounted;

            return (
              <div
                key={slotIdx}
                className="relative flex items-center justify-center"
                style={{ width: tokenSlotWidth }}
              >
                {hasToken ? (
                  // PLACED COMPACT TOKEN
                  <motion.button
                    initial={{ scale: 0, y: -12 }}
                    animate={{
                      scale: 1,
                      y: 0,
                      boxShadow: isCounted
                        ? `0 0 12px ${theme.border}`
                        : currentStep === 3
                        ? "0 0 8px rgba(255,255,255,0.4)"
                        : "0 0 4px rgba(0,0,0,0.5)",
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentStep === 2) {
                        onRemoveToken(groupIndex, slotIdx);
                      } else if (currentStep === 3) {
                        onCountToken(groupIndex, slotIdx);
                      }
                    }}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs border transition-colors select-none ${
                      isCounted
                        ? `bg-gradient-to-br ${theme.tokenBg} text-white border-white`
                        : isGroupFullyCounted
                        ? `bg-gradient-to-br ${theme.tokenBg} text-white border-white`
                        : currentStep === 3
                        ? "bg-slate-800 border-amber-400 text-white animate-pulse"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600 border-white/60 text-white"
                    }`}
                  >
                    {isCounted ? (
                      <span className="font-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                        {token.countNumber}
                      </span>
                    ) : currentStep === 3 ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/70" />
                    )}
                  </motion.button>
                ) : (
                  // EMPTY SLOT ON THE LINE
                  <button
                    disabled={currentStep !== 2}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentStep === 2) onAddToken(groupIndex);
                    }}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-dashed flex items-center justify-center transition-all ${
                      currentStep === 2
                        ? "border-purple-400/60 hover:border-purple-300 hover:scale-110 bg-purple-950/30 text-purple-300 cursor-pointer animate-pulse"
                        : "border-white/10 bg-black/40 text-white/20 cursor-default"
                    }`}
                    title={currentStep === 2 ? "Touch to add token" : ""}
                  >
                    {currentStep === 2 ? (
                      <Plus className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right mini counter */}
      <div className="w-12 text-right shrink-0">
        <span
          className={`text-[10px] font-bold ${
            isGroupFullyCounted
              ? "text-emerald-400"
              : tokens.length === tokenCapacity
              ? "text-purple-300"
              : "text-white/30"
          }`}
        >
          {tokens.length}/{tokenCapacity}
        </span>
      </div>
    </motion.div>
  );
}
