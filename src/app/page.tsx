"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { EquationHeader } from "@/components/EquationHeader";
import { ScratchPad, DrawnLine, TokenState } from "@/components/ScratchPad";
import { Numpad } from "@/components/Numpad";
import { Confetti } from "@/components/Confetti";
import { InstructionsModal } from "@/components/InstructionsModal";
import { FactSelectorModal } from "@/components/FactSelectorModal";
import { ChadMathDashboard } from "@/components/ChadMathDashboard";
import { PinLoginModal } from "@/components/PinLoginModal";
import {
  StudentProfile,
  loadAllStudents,
  getActiveStudent,
  setActiveStudentPin,
  recordStudentFactResult,
} from "@/lib/studentStorage";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { RefreshCw, ArrowRight, Wand2 } from "lucide-react";

export default function MultiplicationGroupsApp() {
  // Main Navigation View: "dashboard" (ChadMath Home) or "practice" (Worksheet Scratchpad)
  const [currentView, setCurrentView] = useState<"dashboard" | "practice">("dashboard");

  // Classroom & Student Profile PIN State
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(true);

  // Multi-selectable tables (defaulting to 2, 3, 4)
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4]);

  // Dashboard Configurations & Mastery Stats
  const [dailySessions, setDailySessions] = useState<number>(0);
  const [isMultipleChoice, setIsMultipleChoice] = useState<boolean>(false);
  const [tableMastery, setTableMastery] = useState<Record<number, number>>({
    2: 0.6,
    3: 0.4,
    4: 0.3,
    5: 0.5,
    6: 0.2,
    7: 0.1,
    8: 0.2,
    9: 0.1,
  });

  // Math Fact: factorA = Groups (Lines), factorB = Count per group (Tokens)
  const [factorA, setFactorA] = useState<number>(2);
  const [factorB, setFactorB] = useState<number>(4);

  // Steps: 1: Draw Lines, 2: Place Factor 2, 3: See Pattern, 4: Count Dots, 5: Mastered
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Gamification: ChadMath Stats
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Workspace Drawn Lines on Scratch Pad
  const [lines, setLines] = useState<DrawnLine[]>([]);

  // Typing & Solving (Learner can enter answer at ANY time!)
  const [typedAnswer, setTypedAnswer] = useState<string>("");
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Celebrations
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isFactSelectorOpen, setIsFactSelectorOpen] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  // Timer reference for automatic next fact transition
  const nextFactTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound & Speech
  const {
    initAudio,
    playHover,
    playAddLine,
    playRemoveLine,
    playAddToken,
    playCountToken,
    playGroupComplete,
    playFactSuccess,
    playIncorrect,
    speak,
    isMuted,
    setIsMuted,
    speechEnabled,
    setSpeechEnabled,
  } = useSoundEffects();

  const targetProduct = factorA * factorB;

  // Restore persistence and prompt student login on initial visit
  useEffect(() => {
    if (typeof window !== "undefined") {
      const allStudents = loadAllStudents();
      setStudents(allStudents);
      const sessionPin = sessionStorage.getItem("chadmath_active_login_pin");
      if (sessionPin) {
        const found = allStudents.find((s) => s.pin === sessionPin);
        if (found) {
          setActiveStudent(found);
          setScore(found.score);
          setStreak(found.streak);
          setDailySessions(found.dailySessions);
          setTableMastery(found.tableMastery);
          setIsLoggedIn(true);
          setIsPinModalOpen(false);
          return;
        }
      }
      // If no active session login, request student to log in with PIN
      setIsLoggedIn(false);
      setIsPinModalOpen(true);
    }
  }, []);

  // Cleanup auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (nextFactTimerRef.current) {
        clearTimeout(nextFactTimerRef.current);
      }
    };
  }, []);

  // Helper to pick next fact matching selected tables (or all tables if none selected)
  const getNextFactPair = useCallback((tables: number[]) => {
    const activeTables = tables.length > 0 ? tables : [2, 3, 4, 5, 6, 7, 8, 9];
    const a = activeTables[Math.floor(Math.random() * activeTables.length)];
    const b = Math.floor(Math.random() * 8) + 2; // 2..9
    return { a, b };
  }, []);

  // Load a new fact
  const loadFact = useCallback(
    (a: number, b: number) => {
      if (nextFactTimerRef.current) {
        clearTimeout(nextFactTimerRef.current);
        nextFactTimerRef.current = null;
      }
      setFactorA(a);
      setFactorB(b);
      setCurrentStep(1);
      setLines([]);
      setTypedAnswer("");
      setIsSolved(false);
      setErrorMessage(null);
      setConfettiTrigger(false);
    },
    []
  );

  // Table selection toggles
  const handleToggleTable = (table: number) => {
    playHover();
    setSelectedTables((prev) => {
      if (prev.includes(table)) {
        return prev.filter((t) => t !== table);
      } else {
        return [...prev, table].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAllTables = () => {
    playHover();
    setSelectedTables([2, 3, 4, 5, 6, 7, 8, 9]);
  };

  const handleClearTables = () => {
    playHover();
    setSelectedTables([]);
  };

  // Student PIN Login and Switching
  const handleSelectStudent = useCallback((student: StudentProfile) => {
    setActiveStudentPin(student.pin);
    setActiveStudent(student);
    setScore(student.score);
    setStreak(student.streak);
    setDailySessions(student.dailySessions);
    setTableMastery(student.tableMastery);
    setIsLoggedIn(true);
    setIsPinModalOpen(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("chadmath_active_login_pin", student.pin);
    }
    const updated = loadAllStudents();
    setStudents(updated);
  }, []);

  const handleOpenPinLogin = () => {
    playHover();
    setIsPinModalOpen(true);
  };

  // Start Practice from Dashboard
  const handleStartPlay = () => {
    initAudio();
    playHover();
    const next = getNextFactPair(selectedTables);
    loadFact(next.a, next.b);
    setCurrentView("practice");
    speak(`How many groups do I need? Look at Factor 1 to determine how many lines to draw!`);
  };

  const handleResetCurrentFact = () => {
    if (nextFactTimerRef.current) {
      clearTimeout(nextFactTimerRef.current);
      nextFactTimerRef.current = null;
    }
    setCurrentStep(1);
    setLines([]);
    setTypedAnswer("");
    setIsSolved(false);
    setErrorMessage(null);
    setConfettiTrigger(false);
    speak(`How many groups do I need? Look at Factor 1 to add groups by drawing lines.`);
  };

  const handleNextFact = useCallback(() => {
    if (nextFactTimerRef.current) {
      clearTimeout(nextFactTimerRef.current);
      nextFactTimerRef.current = null;
    }
    const next = getNextFactPair(selectedTables);
    loadFact(next.a, next.b);
  }, [getNextFactPair, selectedTables, loadFact]);

  // Step 1: Add a line via finger drawing gesture on scratch pad
  const handleAddLineGesture = (yPos: number) => {
    initAudio();
    if (lines.length >= 10) return;
    playAddLine();
    setErrorMessage(null);

    const newIndex = lines.length;
    const newLine: DrawnLine = {
      id: `line-${Date.now()}-${newIndex}`,
      groupIndex: newIndex,
      y: yPos,
      tokens: [],
      isGroupFullyCounted: false,
    };

    const updated = [...lines, newLine];
    setLines(updated);

    // AUTO-UNLOCK TOKEN PLACEMENT when correct number of lines are drawn!
    if (updated.length === factorA) {
      setCurrentStep(2);
      speak(`Great job! You drew the groups for Factor 1! Now place ${factorB} on each line for Factor 2.`);
    } else if (updated.length > factorA) {
      playIncorrect();
      setErrorMessage(`You have ${updated.length} lines. Look at Factor 1 and erase any extra.`);
      speak(`Check Factor 1. Erase any extra lines.`);
    }
  };

  // Step 1: Remove a specific line
  const handleRemoveLine = (groupIndex: number) => {
    initAudio();
    playRemoveLine();
    setErrorMessage(null);

    const updated = lines
      .filter((_, idx) => idx !== groupIndex)
      .map((line, idx) => ({ ...line, groupIndex: idx }));

    setLines(updated);

    if (updated.length === factorA) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  // Step 2: Tap on a line to add a token/dot
  const handleAddTokenToLine = (groupIndex: number) => {
    initAudio();
    if (currentStep !== 2) return;

    // ANTI-CHEAT ENFORCEMENT:
    // Learners must fill groups sequentially: Group 1, then Group 2, etc.
    // They cannot skip ahead to click the last group!
    const activeGroupIndex = lines.findIndex((l) => l.tokens.length < factorB);
    if (activeGroupIndex !== -1 && groupIndex !== activeGroupIndex) return;

    const line = lines[groupIndex];
    if (!line || line.tokens.length >= factorB) return;

    playAddToken(line.tokens.length);
    setErrorMessage(null);

    const newToken: TokenState = {
      id: `token-${groupIndex}-${line.tokens.length}-${Date.now()}`,
      isCounted: false,
    };

    const updated = [...lines];
    updated[groupIndex] = {
      ...line,
      tokens: [...line.tokens, newToken],
    };
    setLines(updated);

    // If all tokens placed across all lines, activate Step 3 (Pattern Recognition)!
    const totalPlaced = updated.reduce((acc, l) => acc + l.tokens.length, 0);
    if (totalPlaced === targetProduct) {
      setCurrentStep(3);
      speak(`All placed for Factor 2! Look at the pattern, or enter the Product!`);
    }
  };

  // Step 2: Remove a token from a line
  const handleRemoveTokenFromLine = (groupIndex: number, tokenIndex: number) => {
    initAudio();
    if (currentStep < 2 || currentStep === 5) return;
    playRemoveLine();

    setLines((prev) => {
      const updated = [...prev];
      const line = updated[groupIndex];
      if (!line) return prev;
      updated[groupIndex] = {
        ...line,
        tokens: line.tokens.filter((_, idx) => idx !== tokenIndex),
      };
      return updated;
    });

    if (currentStep >= 3) {
      setCurrentStep(2);
    }
  };

  // Step 2 Helper: Auto-fill tokens
  const handleAutoFillTokens = () => {
    initAudio();
    playAddToken(0);
    setErrorMessage(null);

    const updated = lines.map((line) => {
      const needed = factorB - line.tokens.length;
      const additional: TokenState[] = Array.from({ length: needed }).map((_, idx) => ({
        id: `token-${line.groupIndex}-${line.tokens.length + idx}-${Date.now()}`,
        isCounted: false,
      }));
      return {
        ...line,
        tokens: [...line.tokens, ...additional],
      };
    });

    setLines(updated);
    setCurrentStep(3);
    speak(`All items filled for Factor 2! Look at the pattern, or type your answer.`);
  };

  // Step 3 / 4: Count Tokens
  const totalCounted = lines.reduce(
    (acc, line) => acc + line.tokens.filter((t) => t.isCounted).length,
    0
  );

  const handleCountToken = (groupIndex?: number, tokenIndex?: number) => {
    initAudio();
    if (currentStep !== 3 && currentStep !== 4) return;
    if (currentStep === 3) {
      setCurrentStep(4);
    }

    // STRICTLY SEQUENTIAL COUNTING:
    // Always count the next uncounted token in order to prevent cheating by clicking the last button!
    const nextCount = totalCounted + 1;
    if (nextCount > targetProduct) return;

    playCountToken(nextCount);
    speak(String(nextCount));

    setLines((prev) => {
      let assigned = false;
      return prev.map((l, gIdx) => {
        const newTokens = l.tokens.map((t) => {
          if (!assigned && !t.isCounted) {
            assigned = true;
            return { ...t, isCounted: true, countNumber: nextCount };
          }
          return t;
        });

        const allCountedInGroup = newTokens.every((t) => t.isCounted) && newTokens.length === factorB;

        if (allCountedInGroup && !l.isGroupFullyCounted) {
          setTimeout(() => playGroupComplete(gIdx), 100);
        }

        return {
          ...l,
          tokens: newTokens,
          isGroupFullyCounted: allCountedInGroup,
        };
      });
    });
  };

  // Step 3 / 4 Helper: Auto count all
  const handleAutoCountAll = () => {
    initAudio();
    if (currentStep !== 3 && currentStep !== 4) return;
    setCurrentStep(4);

    let count = totalCounted;
    setLines((prev) =>
      prev.map((l) => {
        const newTokens = l.tokens.map((t) => {
          if (!t.isCounted) {
            count += 1;
            return { ...t, isCounted: true, countNumber: count };
          }
          return t;
        });
        return {
          ...l,
          tokens: newTokens,
          isGroupFullyCounted: true,
        };
      })
    );
    speak(`All dots counted! Type the answer you counted.`);
  };

  // SUBMIT ANSWER — CAN BE ENTERED AT ANY TIME! AUTOMATIC NEXT FACT POP UP!
  const handleSubmitAnswer = () => {
    initAudio();
    if (!typedAnswer.trim()) return;

    const num = parseInt(typedAnswer.trim(), 10);
    if (num === targetProduct) {
      // Build full visual confirmation model
      let currentCount = 0;
      const fullLines: DrawnLine[] = Array.from({ length: factorA }).map((_, gIdx) => ({
        id: `line-solved-${gIdx}`,
        groupIndex: gIdx,
        y: 100,
        tokens: Array.from({ length: factorB }).map((_, tIdx) => {
          currentCount++;
          return {
            id: `token-solved-${gIdx}-${tIdx}`,
            isCounted: true,
            countNumber: currentCount,
          };
        }),
        isGroupFullyCounted: true,
      }));

      setLines(fullLines);
      setIsSolved(true);
      setCurrentStep(5);
      setErrorMessage(null);
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);

      // Record in student storage
      if (activeStudent) {
        const updatedStudent = recordStudentFactResult(
          activeStudent.pin,
          factorA,
          factorB,
          true
        );
        if (updatedStudent) {
          setActiveStudent(updatedStudent);
          setDailySessions(updatedStudent.dailySessions);
          setTableMastery(updatedStudent.tableMastery);
          setStudents(loadAllStudents());
        }
      } else {
        // Fallback local state increment
        setDailySessions((prev) => {
          const updated = Math.min(prev + 1, 5);
          if (typeof window !== "undefined") {
            localStorage.setItem("chadmath_daily_sessions", String(updated));
          }
          return updated;
        });

        setTableMastery((prev) => {
          const updated = {
            ...prev,
            [factorA]: Math.min(1, Number(((prev[factorA] || 0) + 0.1).toFixed(2))),
            [factorB]: Math.min(1, Number(((prev[factorB] || 0) + 0.1).toFixed(2))),
          };
          if (typeof window !== "undefined") {
            localStorage.setItem("chadmath_table_mastery", JSON.stringify(updated));
          }
          return updated;
        });
      }

      playFactSuccess();
      setConfettiTrigger(true);
      speak(`Correct! ${factorA} times ${factorB} equals the Product ${targetProduct}!`);

      // NEXT FACT SHOULD AUTOMATICALLY POP UP AFTER CELEBRATION!
      if (nextFactTimerRef.current) clearTimeout(nextFactTimerRef.current);
      nextFactTimerRef.current = setTimeout(() => {
        handleNextFact();
      }, 1400);
    } else {
      playIncorrect();
      setStreak(0);
      setErrorMessage(`Not quite! You entered ${num}. Count your dots or check the hint.`);
      speak(`Try again.`);

      // Record incorrect attempt in student storage
      if (activeStudent) {
        const updatedStudent = recordStudentFactResult(
          activeStudent.pin,
          factorA,
          factorB,
          false
        );
        if (updatedStudent) {
          setActiveStudent(updatedStudent);
          setStudents(loadAllStudents());
        }
      }
    }
  };

  // Multiple Choice Options Generator
  const multipleChoiceOptions = useCallback(() => {
    const correct = targetProduct;
    const offsets = [-factorB, factorB, -2, 2, -1, 1];
    const distractors = new Set<number>();
    for (const off of offsets) {
      const val = correct + off;
      if (val > 0 && val !== correct) {
        distractors.add(val);
        if (distractors.size === 3) break;
      }
    }
    const list = [correct, ...Array.from(distractors)].slice(0, 4);
    return list.sort(() => Math.random() - 0.5);
  }, [targetProduct, factorB]);

  // Physical keyboard listeners
  useEffect(() => {
    if (currentView !== "practice") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInstructionsOpen || isFactSelectorOpen) return;

      if (/^[0-9]$/.test(e.key)) {
        playHover();
        if (typedAnswer.length < 4 && !isSolved) {
          setTypedAnswer((prev) => prev + e.key);
        }
      } else if (e.key === "Backspace") {
        playHover();
        if (!isSolved) {
          setTypedAnswer((prev) => prev.slice(0, -1));
        }
      } else if (e.key === "Enter") {
        if (typedAnswer.length > 0) {
          handleSubmitAnswer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentView,
    typedAnswer,
    isSolved,
    isInstructionsOpen,
    isFactSelectorOpen,
    playHover,
    handleSubmitAnswer,
  ]);

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#07080c] text-foreground flex flex-col relative select-none">
      {/* Background Ambience Pattern (ChadMath exact grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f22_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f22_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Confetti celebration */}
      <Confetti trigger={confettiTrigger} />

      {/* VIEW 1: CHADMATH MAIN DASHBOARD */}
      {currentView === "dashboard" ? (
        <ChadMathDashboard
          score={score}
          streak={streak}
          dailySessions={dailySessions}
          selectedTables={selectedTables}
          onToggleTable={handleToggleTable}
          onSelectAllTables={handleSelectAllTables}
          onClearTables={handleClearTables}
          isMultipleChoice={isMultipleChoice}
          onToggleMultipleChoice={() => setIsMultipleChoice(!isMultipleChoice)}
          tableMastery={tableMastery}
          onStartPlay={handleStartPlay}
          currentStudent={activeStudent}
          onOpenPinModal={handleOpenPinLogin}
        />
      ) : (
        /* VIEW 2: WORKSHEET PRACTICE MODE */
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Navbar with Dashboard return button */}
          <Navbar
            factorA={factorA}
            factorB={factorB}
            score={score}
            streak={streak}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            onOpenSelector={() => setIsFactSelectorOpen(true)}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
            onBackToDashboard={() => setCurrentView("dashboard")}
            currentStudent={activeStudent}
            onOpenPinModal={handleOpenPinLogin}
          />

          {/* MASSIVE Prominent Math Fact Equation Header (NO LABELS UNDERNEATH!) */}
          <div className="px-2 sm:px-4 pt-1 shrink-0 z-20">
            <EquationHeader
              factorA={factorA}
              factorB={factorB}
              currentStep={currentStep}
              typedAnswer={typedAnswer}
              isSolved={isSolved}
              onOpenHelp={() => setIsInstructionsOpen(true)}
              onAnswerChange={(val) => {
                setErrorMessage(null);
                setTypedAnswer(val);
              }}
              onSubmitAnswer={handleSubmitAnswer}
              errorMessage={errorMessage}
              isLinesComplete={lines.length === factorA || isSolved}
              isTokensComplete={(lines.length === factorA && lines.length > 0 && lines.every((l) => l.tokens.length === factorB)) || isSolved}
              onHintClick={(text) => speak(text)}
            />
          </div>

          {/* MAIN WORKSPACE: CLASSROOM WORKSHEET SCRATCH PAD & NUMPAD (ZERO SCROLLING, FULL IPAD FIT) */}
          <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-1 md:py-2 flex flex-col md:flex-row items-stretch justify-between gap-2 sm:gap-3 md:gap-5 relative z-10 overflow-hidden">
            
            {/* SCRATCH PAD: REPLICATES CLASSROOM HANDOUT WORKSHEET */}
            <div className="flex-1 min-h-0 w-full h-full overflow-hidden flex flex-col">
              <ScratchPad
                factorA={factorA}
                factorB={factorB}
                currentStep={currentStep}
                lines={lines}
                onAddLineGesture={handleAddLineGesture}
                onRemoveLine={handleRemoveLine}
                onAddTokenToLine={handleAddTokenToLine}
                onRemoveTokenFromLine={handleRemoveTokenFromLine}
                onCountToken={handleCountToken}
              />
            </div>

            {/* SIDE / BOTTOM PANEL: NUMPAD OR MULTIPLE CHOICE */}
            <div className="shrink-0 w-full md:w-[280px] lg:w-[320px] flex flex-col items-center justify-between gap-1.5 sm:gap-2">
              {isMultipleChoice ? (
                <div className="w-full p-3 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col gap-2 shadow-xl">
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/50 text-center font-bold">
                    Select The Product
                  </span>
                  <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
                    {multipleChoiceOptions().map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setTypedAnswer(String(opt));
                          setTimeout(() => {
                            if (opt === targetProduct) {
                              handleSubmitAnswer();
                            } else {
                              playIncorrect();
                              setErrorMessage(`Not ${opt}. Try again!`);
                            }
                          }, 50);
                        }}
                        disabled={isSolved}
                        className="h-11 sm:h-12 md:h-14 rounded-2xl bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 text-white font-black text-lg md:text-xl transition-all cursor-pointer flex items-center justify-center"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <Numpad
                  value={typedAnswer}
                  onChange={(val) => {
                    setErrorMessage(null);
                    setTypedAnswer(val);
                  }}
                  onSubmit={handleSubmitAnswer}
                  disabled={isSolved}
                  onKeyPressSound={playHover}
                />
              )}

              {/* Quick Helper Action Pills */}
              <div className="flex items-center justify-center gap-2 w-full">
                {currentStep === 2 && (
                  <button
                    onClick={handleAutoFillTokens}
                    className="text-xs md:text-sm font-bold text-purple-300 hover:text-white bg-purple-500/10 active:bg-purple-500/20 px-3.5 py-1.5 rounded-xl border border-purple-500/20 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Auto-Fill
                  </button>
                )}
                {(currentStep === 3 || currentStep === 4) && (
                  <button
                    onClick={handleAutoCountAll}
                    className="text-xs md:text-sm font-bold text-amber-300 hover:text-white bg-amber-500/10 active:bg-amber-500/20 px-3.5 py-1.5 rounded-xl border border-amber-500/20 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Count All
                  </button>
                )}
                {currentStep === 5 ? (
                  <button
                    onClick={handleNextFact}
                    className="text-xs md:text-sm font-black text-black bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-2 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-2 animate-pulse cursor-pointer"
                  >
                    Next Fact <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                ) : (
                  lines.length > 0 && (
                    <button
                      onClick={handleResetCurrentFact}
                      className="text-xs font-bold text-white/40 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset
                    </button>
                  )
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* MODALS */}
      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      <FactSelectorModal
        isOpen={isFactSelectorOpen}
        onClose={() => setIsFactSelectorOpen(false)}
        currentFactorA={factorA}
        currentFactorB={factorB}
        onSelectFact={(a, b) => loadFact(a, b)}
      />

      {/* STUDENT PIN LOGIN & PROFILE SWITCH MODAL */}
      <PinLoginModal
        isOpen={!isLoggedIn || isPinModalOpen}
        onClose={() => {
          if (isLoggedIn) setIsPinModalOpen(false);
        }}
        students={students}
        currentStudent={activeStudent}
        onSelectStudent={handleSelectStudent}
        canClose={isLoggedIn}
      />
    </div>
  );
}
