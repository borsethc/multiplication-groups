"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Moon, Check, Sparkles, Pencil } from "lucide-react";

export interface TokenState {
  id: string;
  isCounted: boolean;
  countNumber?: number;
}

export interface DrawnLine {
  id: string;
  groupIndex: number;
  y: number;
  tokens: TokenState[];
  isGroupFullyCounted: boolean;
}

interface ScratchPadProps {
  factorA: number;
  factorB: number;
  currentStep: 1 | 2 | 3 | 4 | 5;
  lines: DrawnLine[];
  onAddLineGesture: (yPos: number) => void;
  onRemoveLine: (groupIndex: number) => void;
  onAddTokenToLine: (groupIndex: number) => void;
  onRemoveTokenFromLine: (groupIndex: number, tokenIndex: number) => void;
  onCountToken: (groupIndex: number, tokenIndex: number) => void;
}

export function ScratchPad({
  factorA,
  factorB,
  currentStep,
  lines,
  onAddLineGesture,
  onRemoveLine,
  onAddTokenToLine,
  onRemoveTokenFromLine,
  onCountToken,
}: ScratchPadProps) {
  const padRef = useRef<HTMLDivElement>(null);

  // Worksheet theme: "slate" (ChadMath Dark Slate, default) vs "paper" (Classroom Handout Paper)
  const [paperTheme, setPaperTheme] = useState<"slate" | "paper">("slate");

  // Real-time drawing gesture
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);

  // DYNAMIC ARRAY SCALING TIERS:
  // For factorA >= 7 (7, 8, 9 groups), use a clean 3-column layout so lines NEVER exceed 3 rows!
  // For factorA 4..6, use 2 columns (max 3 rows). For 2..3, use 1-2 columns (max 3 rows).
  // This guarantees that all factors (even 9x9) fit 100% inside the canvas with ZERO scrolling.
  const is3Columns = factorA >= 7;
  const is2Columns = !is3Columns && (factorA >= 4 || (factorA === 2 && factorB <= 4));
  const numColumns = is3Columns ? 3 : is2Columns ? 2 : 1;

  const isVeryLarge = factorA >= 6 || factorB >= 7 || (factorA * factorB >= 28);
  const isLarge = !isVeryLarge && (factorA >= 4 || factorB >= 5 || (factorA * factorB >= 15));
  const isCompact = isVeryLarge || isLarge || factorA >= 3;

  // Mobile Spacing (< 768px):
  const mobileSpacing = is3Columns || isVeryLarge
    ? Math.max(12, Math.min(18, Math.floor(135 / factorB)))
    : isLarge
    ? Math.max(15, Math.min(22, Math.floor(180 / factorB)))
    : Math.max(20, Math.min(30, Math.floor(230 / factorB)));

  const mobileLineWidth = Math.max(55, factorB * mobileSpacing + (is3Columns ? 8 : 12));

  // Tablet & iPad Spacing (>= 768px):
  // When 3 columns (e.g. 9x9): line width is ~188px so 3 lines + 2 plus signs = ~588px (easily fits 680px canvas)
  const tabletSpacing = is3Columns
    ? factorB >= 8 ? 20 : factorB >= 6 ? 23 : 26
    : is2Columns
    ? factorB >= 8 ? 26 : factorB >= 6 ? 32 : 38
    : factorB >= 8 ? 38 : factorB >= 5 ? 46 : 54;

  const tabletLineWidth = Math.max(100, factorB * tabletSpacing + (is3Columns ? 8 : is2Columns ? 12 : 20));

  // Scaled visual styles
  const dotSizeClass = is3Columns
    ? "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-[7px] md:text-[9px]"
    : isVeryLarge
    ? "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[8px] md:text-[10px]"
    : isLarge
    ? "w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7 text-[9px] md:text-xs"
    : "w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-[10px] md:text-sm";

  const emptySpotSizeClass = is3Columns
    ? "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5"
    : isVeryLarge
    ? "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
    : isLarge
    ? "w-4 h-4 sm:w-5 sm:h-5 md:w-7 md:h-7"
    : "w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8";

  const lineHeightClass = is3Columns
    ? "h-1 md:h-1"
    : isVeryLarge
    ? "h-1 md:h-1.5"
    : isLarge
    ? "h-1 sm:h-1.5 md:h-2"
    : "h-1.5 sm:h-2 md:h-2.5";

  const numberTextClass = is3Columns
    ? "text-[8px] md:text-[10px]"
    : isVeryLarge
    ? "text-[9px] md:text-xs"
    : isLarge
    ? "text-[10px] md:text-sm"
    : "text-xs md:text-base";

  const numRowMinHeight = is3Columns
    ? "min-h-[12px] md:min-h-[14px]"
    : isVeryLarge
    ? "min-h-[14px] md:min-h-[16px]"
    : isLarge
    ? "min-h-[16px] md:min-h-[18px]"
    : "min-h-[18px] md:min-h-[22px]";

  const arrayGapClass = is3Columns
    ? "gap-x-1 sm:gap-x-2 md:gap-x-2.5 gap-y-1 sm:gap-y-1 md:gap-y-1.5"
    : isVeryLarge
    ? "gap-x-1.5 sm:gap-x-2.5 md:gap-x-3 gap-y-1 sm:gap-y-1.5 md:gap-y-2"
    : isLarge
    ? "gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-1.5 sm:gap-y-2 md:gap-y-2.5"
    : "gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-2 sm:gap-y-3 md:gap-y-4";

  const targetProduct = factorA * factorB;
  const totalTokensPlaced = lines.reduce((acc, l) => acc + l.tokens.length, 0);

  // Pointer Down (Finger touches pad)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (currentStep !== 1) return;
    if ((e.target as HTMLElement).closest("button")) return;

    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  // Pointer Move (Finger drags across pad)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentStroke((prev) => [...prev, { x, y }]);
  };

  // Pointer Up (Finger lifts)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 0) {
      const avgY = currentStroke.reduce((acc, p) => acc + p.y, 0) / currentStroke.length;
      onAddLineGesture(avgY);
    }

    setCurrentStroke([]);
  };

  const isLineReadyForTokens = lines.length === factorA && currentStep >= 2;

  // Global counting number for each slot
  const getSlotGlobalNumber = (lineIdx: number, slotIdx: number) => {
    return lineIdx * factorB + slotIdx + 1;
  };

  const isPaper = paperTheme === "paper";

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden select-none">
      
      {/* WORKSHEET SLATE / HANDOUT PAPER CONTAINER (ZERO SCROLLING, EXPANDED IPAD CANVAS) */}
      <div
        ref={padRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setIsDrawing(false);
          setCurrentStroke([]);
        }}
        className={`relative w-full flex-1 rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden touch-none select-none flex flex-col items-center justify-start shadow-2xl ${
          isPaper
            ? "bg-[#faf9f5] border-[#d8d4c9] text-[#1b2533] shadow-[inset_0_0_30px_rgba(0,0,0,0.03)]"
            : currentStep === 1
            ? "cursor-crosshair border-cyan-500/40 bg-[#090b12] text-white shadow-[inset_0_0_30px_rgba(6,182,212,0.12)]"
            : "border-white/10 bg-[#08090f] text-white shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]"
        }`}
        style={{
          backgroundImage: isPaper
            ? "repeating-linear-gradient(0deg, transparent, transparent 25px, #e3e0d8 26px)"
            : "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
          backgroundSize: isPaper ? "100% 26px" : "20px 20px",
        }}
      >
        {/* TOP WORKSHEET TITLE BAR */}
        <div
          className={`w-full flex items-center justify-between px-3 py-1.5 md:px-4 md:py-2 z-20 shrink-0 border-b ${
            isPaper
              ? "bg-[#f2efe6]/90 border-[#dcd7cb] text-[#475569]"
              : "bg-white/[0.03] border-white/5 text-white/50"
          }`}
        >
          {/* Handout Title */}
          <span className="font-serif italic font-bold text-xs sm:text-sm md:text-base tracking-tight text-current">
            Classroom Worksheet: Multiples of {factorB}
          </span>

          {/* Compact Paper / Slate Theme Toggle */}
          <button
            onClick={() => setPaperTheme(isPaper ? "slate" : "paper")}
            className={`px-2 py-1 rounded-lg border text-[11px] md:text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPaper
                ? "bg-white/80 border-[#d2ccc0] text-[#1e293b] hover:bg-white shadow-sm"
                : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
            }`}
            title={isPaper ? "Switch to Dark Slate" : "Switch to Classroom Paper"}
          >
            {isPaper ? <Moon className="w-3.5 h-3.5 text-indigo-600" /> : <FileText className="w-3.5 h-3.5 text-amber-300" />}
            <span className="font-semibold hidden xs:inline">{isPaper ? "Dark Mode" : "Paper"}</span>
          </button>
        </div>

        {/* PROMINENT STEP BANNER AT TOP OF SCRATCH PAD */}
        <div className="w-full px-2.5 md:px-4 pt-1.5 md:pt-2 pb-1 z-20 shrink-0">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`w-full py-1.5 md:py-2 px-3 md:px-4 rounded-xl md:rounded-2xl border flex items-center justify-between gap-2 shadow-sm ${
              currentStep === 1
                ? isPaper
                  ? "bg-[#1e3a8a]/10 border-[#1e3a8a]/30 text-[#1e3a8a]"
                  : "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                : currentStep === 2
                ? isPaper
                  ? "bg-purple-100 border-purple-300 text-purple-900"
                  : "bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                : currentStep === 3
                ? isPaper
                  ? "bg-amber-100 border-amber-300 text-amber-900"
                  : "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                : currentStep === 4
                ? isPaper
                  ? "bg-blue-100 border-blue-300 text-blue-900"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                : isPaper
                ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                : "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(160,255,180,0.25)]"
            }`}
          >
            {/* Step Icon & Main Instruction */}
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm md:text-base">
              {currentStep === 1 && (
                <>
                  <Pencil className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                  <span>
                    STEP 1: How Many Groups Do I Need? Add Groups by Drawing Lines.
                  </span>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-current shrink-0" />
                  <span>
                    STEP 2: Tap Lines to Place <strong>{factorB}</strong> on Each (Factor 2)
                  </span>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 shrink-0 text-amber-400" />
                  <span>
                    STEP 3: See the Pattern? Can you find the Product before tapping all the dots?
                  </span>
                </>
              )}
              {currentStep === 4 && (
                <>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                  <span>
                    STEP 4: Tap Dots to Count Aloud, or Enter Product!
                  </span>
                </>
              )}
              {currentStep === 5 && (
                <>
                  <Check className="w-4 h-4 md:w-5 md:h-5 stroke-[3] shrink-0" />
                  <span>
                    SOLVED! {factorA} × {factorB} = <strong>{targetProduct}</strong> (Product)
                  </span>
                </>
              )}
            </div>

            {/* Step Progress Pill - Anti-Cheat (Never display targetProduct before solving!) */}
            <div className="shrink-0 text-[10px] md:text-xs font-black px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-black/10 dark:bg-white/10">
              {currentStep === 1 && `${lines.length} ${lines.length === 1 ? "Group" : "Groups"}`}
              {currentStep === 2 && `${totalTokensPlaced} Placed`}
              {currentStep === 3 && `Spot Pattern`}
              {currentStep === 4 && `${lines.reduce((acc, l) => acc + l.tokens.filter(t => t.isCounted).length, 0)} Counted`}
              {currentStep === 5 && `Solved!`}
            </div>
          </motion.div>
        </div>

        {/* STEP 3 REPEATED ADDITION / PATTERN CALLOUT */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full px-2.5 md:px-4 pb-1 z-20 shrink-0"
          >
            <div className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-1.5">
                <span>Pattern:</span>
                <strong className="text-white font-mono text-sm sm:text-base">
                  {Array.from({ length: factorA }).map(() => factorB).join(" + ")} = ?
                </strong>
              </span>
              <span className="text-[10px] sm:text-xs text-amber-200/70 font-normal hidden xs:inline">
                Type Product or tap dots to count
              </span>
            </div>
          </motion.div>
        )}

        {/* Real-time drawing stroke following finger */}
        {isDrawing && currentStroke.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
            <polyline
              fill="none"
              stroke={isPaper ? "#1d4ed8" : "#22d3ee"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isPaper ? "opacity-90" : "drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] opacity-95"}
              points={currentStroke.map((p) => `${p.x},${p.y}`).join(" ")}
            />
          </svg>
        )}

        {/* EMPTY CUE (When 0 lines drawn) */}
        {lines.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-6 pointer-events-none z-10">
            <div
              className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center mb-2 md:mb-3 shadow-lg ${
                isPaper
                  ? "bg-[#1e3a8a]/10 border border-[#1e3a8a]/20 text-[#1e3a8a]"
                  : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              }`}
            >
              <span className="text-2xl md:text-3xl">✏️</span>
            </div>
            <p
              className={`text-sm sm:text-base md:text-xl font-black tracking-wide ${
                isPaper ? "text-[#0f172a]" : "text-white"
              }`}
            >
              How Many Groups Do I Need?
            </p>
            <p
              className={`text-xs md:text-sm max-w-sm mt-1 leading-relaxed ${
                isPaper ? "text-[#64748b]" : "text-white/60"
              }`}
            >
              Look at Factor 1 to see how many groups you need. Add groups by drawing horizontal lines!
            </p>
          </div>
        )}

        {/* WORKSHEET 2D ARRAY CONTAINER (ZERO SCROLLING, FITS ENTIRE SCREEN) */}
        <div className="relative z-10 w-full flex-1 p-0.5 sm:p-1.5 md:p-2 flex flex-col items-center justify-center overflow-hidden">
          <div
            className={`w-full h-full flex items-center justify-center content-center ${arrayGapClass} flex-wrap overflow-hidden`}
          >
            <AnimatePresence>
              {lines.map((line, groupIdx) => {
                // SEQUENTIAL ANTI-CHEAT:
                // In Step 2, students MUST fill groups in order (Group 1, then Group 2, etc.)
                // Students CANNOT skip to the last group to cheat!
                const activeGroupIndex = lines.findIndex((l) => l.tokens.length < factorB);
                const isCurrentActiveLine = groupIdx === activeGroupIndex;
                const isFutureLine = activeGroupIndex !== -1 && groupIdx > activeGroupIndex;
                const canAddToken = isLineReadyForTokens && currentStep === 2 && isCurrentActiveLine && line.tokens.length < factorB;

                return (
                  <div
                    key={line.id}
                    className={`flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-1.5 transition-opacity duration-200 ${
                      currentStep === 2 && isFutureLine ? "opacity-40 pointer-events-none" : "opacity-100"
                    }`}
                  >
                    {/* PLUS SIGN (Matches worksheet array styling: "+" connects lines) */}
                    {groupIdx > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`font-black select-none flex items-center justify-center ${
                          isPaper
                            ? "text-[#1e3a8a]"
                            : "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                        } ${
                          is3Columns
                            ? "text-[9px] sm:text-xs md:text-sm px-0.5"
                            : isVeryLarge
                            ? "text-xs sm:text-sm md:text-base px-0.5"
                            : isLarge
                            ? "text-sm sm:text-base md:text-xl px-1"
                            : "text-base sm:text-xl md:text-2xl px-1"
                        }`}
                      >
                        +
                      </motion.div>
                    )}

                    {/* HORIZONTAL LINE UNIT: NUMBERS ABOVE, LINE IN MIDDLE, DOTS ON/UNDER LINE */}
                    <motion.div
                      initial={{ opacity: 0, scaleX: 0.2, y: 6 }}
                      animate={{ opacity: 1, scaleX: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      className={`relative flex flex-col items-center justify-center group select-none w-[var(--mobile-w)] md:w-[var(--tablet-w)] max-w-[calc(100vw-40px)] md:max-w-none ${
                        currentStep === 2 && isCurrentActiveLine ? "ring-1 sm:ring-2 ring-cyan-400/40 rounded-xl p-0.5 bg-cyan-500/[0.04]" : ""
                      }`}
                      style={{
                        "--mobile-w": `${mobileLineWidth}px`,
                        "--tablet-w": `${tabletLineWidth}px`,
                      } as React.CSSProperties}
                    >
                      {/* Active group indicator banner */}
                      {currentStep === 2 && isCurrentActiveLine && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[7px] sm:text-[8px] font-black uppercase tracking-wider animate-pulse whitespace-nowrap z-20 pointer-events-none">
                          Group {groupIdx + 1}
                        </div>
                      )}

                      {/* 1. NUMBERS ROW: Written directly ABOVE each dot */}
                      <div className="w-full flex items-center justify-around px-1 md:px-1.5 mb-0.5">
                        {Array.from({ length: factorB }).map((_, slotIdx) => {
                          const globalNum = getSlotGlobalNumber(groupIdx, slotIdx);
                          const token = line.tokens[slotIdx];
                          const hasToken = !!token;
                          const isCounted = token?.isCounted;

                          // ANTI-CHEAT NUMBERS:
                          // In Step 2 & 3: show Factor 2 items (1..factorB, e.g. 1..9).
                          // In Step 4 & 5: show running cumulative count ONLY when counted!
                          // This guarantees the product (e.g. 81) is NEVER visible on the last button!
                          const displayNum = isCounted
                            ? (token.countNumber || globalNum)
                            : currentStep >= 4
                            ? ""
                            : (slotIdx + 1);

                          return (
                            <div
                              key={slotIdx}
                              className={`flex items-center justify-center w-[var(--mobile-slot-w)] md:w-[var(--tablet-slot-w)] ${numRowMinHeight}`}
                              style={{
                                "--mobile-slot-w": `${mobileSpacing}px`,
                                "--tablet-slot-w": `${tabletSpacing}px`,
                              } as React.CSSProperties}
                            >
                              {hasToken && (
                                <motion.span
                                  initial={{ opacity: 0, y: -3, scale: 0.8 }}
                                  animate={{ opacity: 1, y: 0, scale: isCounted ? 1.15 : 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                  className={`font-black transition-colors ${numberTextClass} ${
                                    isCounted
                                      ? isPaper
                                        ? "text-[#1d4ed8] font-black drop-shadow-sm"
                                        : "text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]"
                                      : isPaper
                                      ? "text-[#1e293b] font-bold"
                                      : "text-white font-bold"
                                  }`}
                                >
                                  {displayNum}
                                </motion.span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* 2. HORIZONTAL LINE (Strictly horizontal rule) */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canAddToken) onAddTokenToLine(groupIdx);
                        }}
                        className={`relative w-full rounded-full transition-all duration-300 ${lineHeightClass} ${
                          isPaper
                            ? "bg-[#1e3a8a] shadow-sm hover:h-2"
                            : "bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)] hover:h-2"
                        } ${canAddToken ? "cursor-pointer" : ""}`}
                      />

                      {/* 3. DOTS ROW: Centered right on / below the line */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canAddToken) onAddTokenToLine(groupIdx);
                        }}
                        className={`w-full flex items-center justify-around px-1 md:px-1.5 mt-0.5 ${
                          canAddToken ? "cursor-pointer" : ""
                        }`}
                      >
                        {Array.from({ length: factorB }).map((_, slotIdx) => {
                          const token = line.tokens[slotIdx];
                          const hasToken = !!token;
                          const isCounted = token?.isCounted;
                          const globalNum = getSlotGlobalNumber(groupIdx, slotIdx);

                          return (
                            <div
                              key={slotIdx}
                              className="relative flex items-center justify-center w-[var(--mobile-slot-w)] md:w-[var(--tablet-slot-w)]"
                              style={{
                                "--mobile-slot-w": `${mobileSpacing}px`,
                                "--tablet-slot-w": `${tabletSpacing}px`,
                              } as React.CSSProperties}
                            >
                              {hasToken ? (
                                // AUTHENTIC FILLED INK CIRCLE / DOT
                                <motion.button
                                  initial={{ scale: 0, y: -6 }}
                                  animate={{ scale: 1, y: 0 }}
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.85 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (currentStep === 2) {
                                      if (isCurrentActiveLine) onRemoveTokenFromLine(groupIdx, slotIdx);
                                    } else if (currentStep === 3 || currentStep === 4) {
                                      onCountToken(groupIdx, slotIdx);
                                    }
                                  }}
                                  className={`relative ${dotSizeClass} rounded-full flex items-center justify-center transition-all select-none touch-manipulation shadow-sm ${
                                    isCounted
                                      ? isPaper
                                        ? "bg-[#1d4ed8] text-white border border-[#1e3a8a] shadow-[0_1px_4px_rgba(29,78,216,0.4)]"
                                        : "bg-gradient-to-br from-amber-400 to-amber-600 text-black border border-white shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                                      : currentStep === 4
                                      ? isPaper
                                        ? "bg-[#3b82f6] text-white border border-[#1d4ed8] animate-pulse"
                                        : "bg-slate-800 text-amber-300 border border-amber-400 animate-pulse"
                                      : isPaper
                                      ? "bg-[#1e293b] text-white border border-[#0f172a]"
                                      : "bg-gradient-to-br from-indigo-500 to-blue-600 text-white border border-white/80"
                                  }`}
                                  title={`Group ${groupIdx + 1}, Item ${slotIdx + 1}`}
                                >
                                  {isCounted ? (
                                    <span className="font-black leading-none">{token?.countNumber || globalNum}</span>
                                  ) : (
                                    <div
                                      className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                                        isPaper ? "bg-white/80" : "bg-white/90"
                                      }`}
                                    />
                                  )}
                                </motion.button>
                              ) : (
                                // Empty dot spot waiting for tap
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (canAddToken) onAddTokenToLine(groupIdx);
                                  }}
                                  className={`${emptySpotSizeClass} rounded-full flex items-center justify-center border border-dashed transition-colors ${
                                    canAddToken
                                      ? isPaper
                                        ? "border-[#1e3a8a]/40 bg-[#1e3a8a]/5 cursor-pointer hover:border-[#1e3a8a]"
                                        : "border-cyan-400/50 bg-cyan-500/10 cursor-pointer hover:border-cyan-400"
                                      : "border-transparent"
                                  }`}
                                >
                                  {canAddToken && (
                                    <div
                                      className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full animate-ping ${
                                        isPaper ? "bg-[#1e3a8a]" : "bg-cyan-400"
                                      }`}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Erase Line Button (Step 1) */}
                      {currentStep === 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLine(groupIdx);
                          }}
                          className={`absolute -right-5 md:-right-7 p-0.5 md:p-1 rounded-full transition-colors cursor-pointer ${
                            isPaper
                              ? "text-[#94a3b8] hover:text-rose-600 hover:bg-rose-50"
                              : "text-white/30 hover:text-rose-400 hover:bg-rose-500/10"
                          }`}
                          title="Erase line"
                        >
                          <X className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>

            {/* Prompt for next line in Step 1 */}
            {currentStep === 1 && lines.length > 0 && lines.length < factorA && (
              <div className="flex items-center gap-1 opacity-60 shrink-0">
                <span className={`text-sm font-black ${isPaper ? "text-[#1e3a8a]" : "text-cyan-400"}`}>
                  +
                </span>
                <span className={`text-[10px] md:text-xs font-bold ${isPaper ? "text-[#64748b]" : "text-white/40"}`}>
                  Draw line to add next group • Check Factor 1
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
