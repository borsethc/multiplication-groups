"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Check,
  RefreshCw,
  Trophy,
  Flame,
  Zap,
  Timer,
  Play,
  Award,
  ChevronRight,
} from "lucide-react";
import { Numpad } from "@/components/Numpad";
import { Confetti } from "@/components/Confetti";
import {
  saveMultiplesRecord,
  getMultiplesRecord,
  MultiplesRecord,
} from "@/lib/studentStorage";

interface MultiplesPracticeProps {
  studentPin?: string;
  onBackToMenu: () => void;
  onPlaySuccess?: () => void;
  onPlayIncorrect?: () => void;
  onFactSolved?: () => void;
  initialTable?: number;
}

export function MultiplesPractice({
  studentPin,
  onBackToMenu,
  onPlaySuccess,
  onPlayIncorrect,
  onFactSolved,
  initialTable = 2,
}: MultiplesPracticeProps) {
  const onPlaySuccessRef = useRef(onPlaySuccess);
  onPlaySuccessRef.current = onPlaySuccess;
  const onPlayIncorrectRef = useRef(onPlayIncorrect);
  onPlayIncorrectRef.current = onPlayIncorrect;
  const onFactSolvedRef = useRef(onFactSolved);
  onFactSolvedRef.current = onFactSolved;

  const [selectedTable, setSelectedTable] = useState<number>(initialTable);
  const [activeTable, setActiveTable] = useState<number>(initialTable);
  const [isRandomMode, setIsRandomMode] = useState<boolean>(false);
  const [isGamified, setIsGamified] = useState<boolean>(true);

  const TOTAL_GAME_TIME = 60; // 1-minute time limit challenge

  // Blanks & Solved state
  const [blankIndices, setBlankIndices] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [solvedIndices, setSolvedIndices] = useState<number[]>([]);
  const [activeBlankIndex, setActiveBlankIndex] = useState<number>(0);
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});

  // Game completion & summaries
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);
  const [confettiTrigger, setConfettiTrigger] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // 1-Minute Countdown timing
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_GAME_TIME);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const stepStartTimeRef = useRef<number>(Date.now());
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Points & Speed bonus toasts
  const [score, setScore] = useState<number>(0);
  const scoreRef = useRef<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [speedToast, setSpeedToast] = useState<{ text: string; bonus: number; key: number } | null>(null);

  // Personal Record
  const [record, setRecord] = useState<MultiplesRecord | null>(null);
  const [runResult, setRunResult] = useState<{
    finalTime: number;
    finalScore: number;
    isNewBestTime: boolean;
    isNewHighScore: boolean;
  } | null>(null);

  const tables = [2, 3, 4, 5, 6, 7, 8, 9];
  // Limit to 6 skips: factors 1 to 6 for the current active table
  const multiples = Array.from({ length: 6 }, (_, i) => (i + 1) * activeTable);

  // Load record whenever table or studentPin changes
  useEffect(() => {
    setRecord(getMultiplesRecord(studentPin, activeTable));
  }, [activeTable, studentPin]);

  // Stop timer helper
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerRunning(false);
  }, []);

  // Handle 1-minute time's up
  const handleTimeUp = useCallback(() => {
    stopTimer();
    setIsGameFinished(true);
    setConfettiTrigger(true);
    onPlaySuccessRef.current?.();
    onFactSolvedRef.current?.();

    const finalScoreTotal = scoreRef.current;
    if (isGamified) {
      const res = saveMultiplesRecord(studentPin, activeTable, finalScoreTotal, TOTAL_GAME_TIME);
      setRecord(res.record);
      setRunResult({
        finalTime: TOTAL_GAME_TIME,
        finalScore: finalScoreTotal,
        isNewBestTime: false,
        isNewHighScore: res.isNewHighScore,
      });
    }
  }, [activeTable, isGamified, stopTimer, studentPin]);

  // Start 1-minute countdown timer helper
  const startTimer = useCallback(() => {
    stopTimer();
    startTimeRef.current = Date.now();
    stepStartTimeRef.current = Date.now();
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const remaining = Math.max(0, TOTAL_GAME_TIME - elapsed);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          handleTimeUp();
        }
      }
    }, 100);
  }, [handleTimeUp, stopTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    };
  }, []);

  // Initialize or reset a 1-minute run
  const resetRun = useCallback(
    (table: number, gamifiedMode: boolean, randomMode: boolean = false) => {
      stopTimer();
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      setTimeLeft(TOTAL_GAME_TIME);
      setIsGameFinished(false);
      setConfettiTrigger(false);
      setFeedbackMessage(null);
      setRunResult(null);
      setSpeedToast(null);
      setSolvedIndices([]);
      setUserInputs({});
      setRoundsCompleted(0);
      setScore(0);
      scoreRef.current = 0;
      setStreak(0);

      const tableToUse = randomMode
        ? tables[Math.floor(Math.random() * tables.length)]
        : table;
      setActiveTable(tableToUse);

      // Pick exactly 2 random blank indices out of 6 skips (0..5), leaving 4 shown
      const candidates = [0, 1, 2, 3, 4, 5];
      const shuffled = [...candidates].sort(() => Math.random() - 0.5);
      const chosenBlanks = shuffled.slice(0, 2).sort((a, b) => a - b);

      setBlankIndices(chosenBlanks);
      setActiveBlankIndex(chosenBlanks[0]);

      if (gamifiedMode) {
        startTimer();
      }
      stepStartTimeRef.current = Date.now();
    },
    [startTimer, stopTimer]
  );

  // Trigger reset ONLY when table selection, mode, or gamification changes
  useEffect(() => {
    resetRun(selectedTable, isGamified, isRandomMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable, isGamified, isRandomMode]);

  // Auto-advance to the next unsolved multiple OR shuffle ONLY after BOTH blanks are answered!
  const advanceToNextBlank = useCallback(
    (newSolved: number[]) => {
      const remaining = blankIndices.filter((idx) => !newSolved.includes(idx));
      if (remaining.length === 0) {
        // BOTH blanks are answered! Increment rounds cleared & generate next 6-skip set
        setRoundsCompleted((prev) => prev + 1);
        onPlaySuccessRef.current?.();

        // If in Random Mode, randomly rotate among all factors 2..9
        if (isRandomMode) {
          const otherTables = [2, 3, 4, 5, 6, 7, 8, 9].filter((t) => t !== activeTable);
          const nextTable = otherTables[Math.floor(Math.random() * otherTables.length)];
          setActiveTable(nextTable);
        }

        const candidates = [0, 1, 2, 3, 4, 5];
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        const chosenBlanks = shuffled.slice(0, 2).sort((a, b) => a - b);

        setBlankIndices(chosenBlanks);
        setSolvedIndices([]);
        setUserInputs({});
        setActiveBlankIndex(chosenBlanks[0]);
        stepStartTimeRef.current = Date.now();
      } else {
        // Only 1 blank was solved: advance to the 2nd blank WITHOUT shuffling!
        const nextIdx = remaining[0];
        setActiveBlankIndex(nextIdx);
        stepStartTimeRef.current = Date.now();
      }
    },
    [activeTable, blankIndices, isRandomMode]
  );

  // Validate value entered for current active blank
  const checkValue = useCallback(
    (valStr: string) => {
      if (isGameFinished || activeBlankIndex === null) return;

      const num = parseInt(valStr, 10);
      const expected = (activeBlankIndex + 1) * activeTable;

      if (num === expected) {
        // Correct answer!
        const stepTime = (Date.now() - stepStartTimeRef.current) / 1000;
        let speedBonus = 0;
        let speedLabel = "Correct!";

        if (isGamified) {
          if (stepTime <= 1.5) {
            speedBonus = 150;
            speedLabel = `⚡ Ultra Fast! (+${speedBonus})`;
          } else if (stepTime <= 3.0) {
            speedBonus = 100;
            speedLabel = `🔥 Quick! (+${speedBonus})`;
          } else if (stepTime <= 5.0) {
            speedBonus = 60;
            speedLabel = `👍 Good! (+${speedBonus})`;
          } else {
            speedBonus = 30;
            speedLabel = `✓ Done (+${speedBonus})`;
          }
        }

        const addedScore = 50 + speedBonus;
        const newScore = score + addedScore;
        setScore(newScore);
        scoreRef.current = newScore;
        setStreak((s) => s + 1);
        setSpeedToast({ text: speedLabel, bonus: speedBonus, key: Date.now() });

        onPlaySuccessRef.current?.();

        const updatedSolved = [...solvedIndices, activeBlankIndex];
        setSolvedIndices(updatedSolved);
        setFeedbackMessage(null);

        // Advance to 2nd blank, or shuffle to next round if BOTH blanks are now solved!
        advanceToNextBlank(updatedSolved);
      } else {
        // Incorrect
        if (valStr.length >= 2) {
          onPlayIncorrectRef.current?.();
          setStreak(0);
          setFeedbackMessage(`Not quite! Look at the skip-count pattern: adds +${activeTable}`);
          // Clear current input so student can re-type immediately
          setUserInputs((prev) => ({ ...prev, [activeBlankIndex]: "" }));
        }
      }
    },
    [
      activeBlankIndex,
      activeTable,
      advanceToNextBlank,
      isGameFinished,
      isGamified,
      score,
      solvedIndices,
    ]
  );

  // Digit handling with strict 2-digit restriction
  const handleDigit = useCallback(
    (digit: string) => {
      if (isGameFinished || activeBlankIndex === null) return;
      const current = userInputs[activeBlankIndex] || "";

      // Strict restriction: maximum 2 digits!
      if (current.length >= 2) return;

      const nextVal = current + digit;
      setUserInputs((prev) => ({ ...prev, [activeBlankIndex]: nextVal }));
      setFeedbackMessage(null);

      // Check immediately
      checkValue(nextVal);
    },
    [activeBlankIndex, checkValue, isGameFinished, userInputs]
  );

  const handleDelete = useCallback(() => {
    if (isGameFinished || activeBlankIndex === null) return;
    const current = userInputs[activeBlankIndex] || "";
    if (current.length === 0) return;
    setUserInputs((prev) => ({ ...prev, [activeBlankIndex]: current.slice(0, -1) }));
    setFeedbackMessage(null);
  }, [activeBlankIndex, isGameFinished, userInputs]);

  // Keyboard navigation & typing listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (isGameFinished) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
          resetRun(selectedTable, isGamified, isRandomMode);
        }
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "Tab" || e.key === "ArrowRight") {
        e.preventDefault();
        const remaining = blankIndices.filter((idx) => !solvedIndices.includes(idx));
        if (remaining.length > 0) {
          const currentPos = remaining.indexOf(activeBlankIndex);
          const nextPos = (currentPos + 1) % remaining.length;
          setActiveBlankIndex(remaining[nextPos]);
          stepStartTimeRef.current = Date.now();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const remaining = blankIndices.filter((idx) => !solvedIndices.includes(idx));
        if (remaining.length > 0) {
          const currentPos = remaining.indexOf(activeBlankIndex);
          const prevPos = (currentPos - 1 + remaining.length) % remaining.length;
          setActiveBlankIndex(remaining[prevPos]);
          stepStartTimeRef.current = Date.now();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeBlankIndex,
    blankIndices,
    handleDelete,
    handleDigit,
    isGameFinished,
    isGamified,
    resetRun,
    selectedTable,
    solvedIndices,
  ]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#07080c] select-none text-white relative">
      <Confetti trigger={confettiTrigger} />

      {/* TOP NAVBAR WITH CONTROLS & TIMERS */}
      <header className="w-full flex items-center justify-between py-1.5 px-3 sm:px-6 border-b border-white/10 bg-[#0c0e17]/95 backdrop-blur-2xl shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
            title="Return to Main Menu"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">Main Menu</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 font-mono font-black text-xs sm:text-sm shadow-sm">
            {isRandomMode ? (
              <span>🎲 All Factors • Current: ×{activeTable}</span>
            ) : (
              <span>Multiples of ×{activeTable}</span>
            )}
          </div>

          {/* Gamify Speed Run Toggle Option */}
          <button
            onClick={() => setIsGamified(!isGamified)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isGamified
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "bg-white/5 border-white/10 text-white/50 hover:text-white"
            }`}
            title="Toggle Speed Challenge mode on/off"
          >
            <Zap className={`w-3.5 h-3.5 ${isGamified ? "text-amber-400 fill-amber-400" : "text-white/40"}`} />
            <span>Speed Run: {isGamified ? "ON" : "OFF"}</span>
          </button>
        </div>

        {/* Right Stats & 1-Minute Sprint Timer */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          {isGamified && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-mono font-black shadow-sm transition-colors ${
                timeLeft <= 10
                  ? "bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse"
                  : "bg-cyan-950/60 border-cyan-500/40 text-cyan-300"
              }`}
              title="1-Minute Sprint Time Remaining"
            >
              <Timer
                className={`w-3.5 h-3.5 ${timeLeft <= 10 ? "text-rose-400 animate-bounce" : "text-cyan-400"}`}
              />
              <span>
                {Math.floor(timeLeft / 60)}:{(Math.floor(timeLeft % 60)).toString().padStart(2, "0")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-cyan-300">
            <span>Rounds: {roundsCompleted}</span>
          </div>

          <div className="flex items-center gap-1 text-yellow-400 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>{score}</span>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-400 font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak}</span>
            </div>
          )}
        </div>
      </header>

      {/* TABLE SELECTOR PILLS ROW */}
      <div className="w-full px-3 py-1.5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between gap-2 overflow-x-auto shrink-0 scrollbar-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/50 font-bold whitespace-nowrap">
            Multiples Table:
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Random Rotating All Factors Mode Button */}
            <button
              onClick={() => {
                setIsRandomMode(true);
                const randomTable = tables[Math.floor(Math.random() * tables.length)];
                setSelectedTable(randomTable);
                setActiveTable(randomTable);
              }}
              className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1 ${
                isRandomMode
                  ? "bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white shadow-md shadow-purple-500/30 scale-105 border border-purple-400"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              }`}
              title="Randomly rotate through all factors 2 through 9"
            >
              <span>🎲 All Factors (Random)</span>
            </button>

            {tables.map((tbl) => {
              const tblRec = getMultiplesRecord(studentPin, tbl);
              const isSelected = !isRandomMode && activeTable === tbl;
              return (
                <button
                  key={tbl}
                  onClick={() => {
                    setIsRandomMode(false);
                    setSelectedTable(tbl);
                    setActiveTable(tbl);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md shadow-cyan-500/30 scale-105 border border-cyan-400"
                      : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                  }`}
                >
                  <span>×{tbl}</span>
                  {tblRec && isGamified && (
                    <span className="ml-1 text-[9px] text-amber-300 font-mono">
                      {tblRec.bestTimeSeconds}s
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Restart Run */}
        <button
          onClick={() => resetRun(selectedTable, isGamified, isRandomMode)}
          className="px-2.5 py-1 text-white/50 hover:text-white text-xs flex items-center gap-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          title="Restart Multiples Sequence"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Restart</span>
        </button>
      </div>

      {/* MAIN EXERCISE BODY */}
      <main className="flex-1 flex flex-col items-center justify-between p-2 sm:p-4 max-w-4xl mx-auto w-full overflow-y-auto">
        {/* Step Banner & Speed Toast */}
        <div className="w-full flex flex-col items-center gap-1.5 shrink-0 mb-2">
          <div className="w-full p-2.5 sm:p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {isGamified
                  ? `⚡ Speed Sprint: Skip-count by ${selectedTable}s! Fill in the 2 missing multiples as fast as you can!`
                  : `Skip Counting by ${selectedTable}s: Fill in the 2 missing multiples (4 shown, 2 blank)!`}
              </span>
            </div>
          </div>

          {/* Floating Speed Bonus Toast */}
          <AnimatePresence>
            {speedToast && (
              <motion.div
                key={speedToast.key}
                initial={{ opacity: 0, y: -8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.9 }}
                className="py-1 px-3 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-black text-xs shadow-lg flex items-center gap-1.5"
              >
                <span>{speedToast.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6-FACTOR MULTIPLES SEQUENCE CARDS (4 SHOWN, 2 BLANK) */}
        <div className="w-full flex-1 flex flex-col justify-center items-center py-2 sm:py-3">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 w-full max-w-2xl">
            {multiples.map((correctVal, idx) => {
              const factorNum = idx + 1;
              const isBlank = blankIndices.includes(idx);
              const isSolved = solvedIndices.includes(idx);
              const userVal = userInputs[idx] || "";
              const isActive = activeBlankIndex === idx && !isGameFinished;

              const ordinalSuffix =
                factorNum === 1
                  ? "1st"
                  : factorNum === 2
                  ? "2nd"
                  : factorNum === 3
                  ? "3rd"
                  : `${factorNum}th`;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isBlank && !isSolved && !isGameFinished) {
                      setActiveBlankIndex(idx);
                      stepStartTimeRef.current = Date.now();
                    }
                  }}
                  className={`flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-2xl border transition-all ${
                    isSolved
                      ? "bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02]"
                      : isBlank
                      ? isActive
                        ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_18px_rgba(251,191,36,0.35)] scale-105 cursor-pointer"
                        : "bg-white/[0.04] hover:bg-white/[0.08] border-white/20 cursor-pointer"
                      : "bg-white/[0.02] border-white/10 opacity-80"
                  }`}
                >
                  {/* Factor Badge */}
                  <span className="text-[9px] sm:text-[10px] font-bold text-white/50 uppercase">
                    {ordinalSuffix}
                  </span>
                  <span className="text-[8px] font-mono text-cyan-400/80 mb-1">
                    ({activeTable}×{factorNum})
                  </span>

                  {/* Value / Input Box */}
                  <div className="w-full h-11 sm:h-14 flex items-center justify-center font-mono font-black text-lg sm:text-2xl rounded-xl">
                    {!isBlank ? (
                      <span className="text-white drop-shadow-md">{correctVal}</span>
                    ) : isSolved ? (
                      <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                        {correctVal}
                      </span>
                    ) : (
                      <span
                        className={`font-black tracking-wider ${
                          userVal ? "text-amber-300" : "text-white/20"
                        }`}
                      >
                        {userVal || "__"}
                      </span>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="h-4 flex items-center justify-center">
                    {isSolved ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback message */}
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 py-1.5 px-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm text-center"
            >
              {feedbackMessage}
            </motion.div>
          )}

          {/* 1-MINUTE SPRINT RESULTS CARD */}
          {isGameFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 p-4 sm:p-5 rounded-3xl bg-[#10121b]/95 border-2 border-indigo-500/50 shadow-2xl flex flex-col items-center gap-3 text-white max-w-md w-full text-center backdrop-blur-xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-2xl shadow-lg">
                ⏱️
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">Time&apos;s Up!</h3>
                <p className="text-xs text-indigo-300 font-semibold">1-Minute Multiples Sprint Complete</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 w-full py-1">
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Final Score</span>
                  <span className="text-2xl font-black text-yellow-400 font-mono">{score}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Rounds Cleared</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">{roundsCompleted}</span>
                </div>
              </div>

              {runResult?.isNewHighScore && (
                <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New 1-Minute High Score!</span>
                </div>
              )}

              <div className="flex items-center gap-2 w-full pt-1">
                <button
                  onClick={() => resetRun(selectedTable, isGamified, isRandomMode)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition-transform active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Play Again (1 Min Sprint)</span>
                </button>
                <button
                  onClick={onBackToMenu}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
                >
                  Main Menu
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* BOTTOM CONTROLS & ERGONOMIC NUMPAD */}
        {!isGameFinished && (
          <div className="w-full max-w-sm shrink-0 flex flex-col items-center gap-2">
            <div className="w-full flex items-center justify-between px-3 text-xs text-white/60">
              <span>
                Enter multiple for:{" "}
                <strong className="text-cyan-400 font-black">
                  {activeTable} × {activeBlankIndex + 1} = ?
                </strong>
              </span>
              <span className="text-[10px] text-white/40 font-mono">Max 2 digits</span>
            </div>

            {/* Mobile / Desktop Ergonomic Numpad with strictly max 2-digits */}
            <div className="w-full">
              <Numpad
                value={userInputs[activeBlankIndex] || ""}
                onChange={(val) => {
                  if (activeBlankIndex !== null) {
                    // Strictly restrict to maximum 2 digits
                    const sanitized = val.replace(/\D/g, "").slice(0, 2);
                    setUserInputs((prev) => ({ ...prev, [activeBlankIndex]: sanitized }));
                    checkValue(sanitized);
                  }
                }}
                onSubmit={() => {
                  const current = userInputs[activeBlankIndex] || "";
                  if (current) checkValue(current);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
