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
import { StudentLogin } from "@/components/StudentLogin";
import { ParentViewModal } from "@/components/ParentViewModal";
import { AccessibilityModal, AccessibilitySettings } from "@/components/AccessibilityModal";
import { HintModal } from "@/components/HintModal";
import { SolvedFactReview } from "@/components/SolvedFactReview";
import { MultiplesPractice } from "@/components/MultiplesPractice";
import {
  StudentProfile,
  loadAllStudents,
  recordStudentFactResult,
  loginOrCreateStudent,
} from "@/lib/studentStorage";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { RefreshCw, ArrowRight, Wand2, Lock, Eye, AlertTriangle } from "lucide-react";

interface QueuedFact {
  a: number;
  b: number;
  reason: "missed" | "mc_recall" | "abandoned" | "assisted_recall";
}

export default function MultiplicationGroupsApp() {
  // Main Navigation View: default to "dashboard" (Main Menu) when starting!
  const [currentView, setCurrentView] = useState<"dashboard" | "practice" | "multiples">("dashboard");

  // Classroom & Student Profile State
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Multi-selectable tables (defaulting to 2, 3, 4)
  const [selectedTables, setSelectedTables] = useState<number[]>([2, 3, 4]);

  // Practice Modes & Scaffolds
  const [isMultipleChoice, setIsMultipleChoice] = useState<boolean>(false);
  const [isBuildFirstLocked, setIsBuildFirstLocked] = useState<boolean>(true);

  // Multiple Choice Stable State (Item 3 & 4: no reshuffling on click, permanent greying out)
  const [currentMcOptions, setCurrentMcOptions] = useState<number[]>([]);
  const [eliminatedMcOptions, setEliminatedMcOptions] = useState<number[]>([]);
  const [mcRequiresTypingConfirmation, setMcRequiresTypingConfirmation] = useState<boolean>(false);
  const [isRecallVerificationFact, setIsRecallVerificationFact] = useState<boolean>(false);

  // Re-drill queue for missed, abandoned, and MC-solved facts (Item 5 & 8)
  const [sessionReDrillQueue, setSessionReDrillQueue] = useState<QueuedFact[]>([]);
  const [abandonedFact, setAbandonedFact] = useState<{ a: number; b: number } | null>(null);

  // Solved Fact Review state (Item 7: explicit restatement in symbols, words, and dots)
  const [solvedFactReview, setSolvedFactReview] = useState<{
    factorA: number;
    factorB: number;
    product: number;
    solveType: "free_recall" | "multiple_choice" | "assisted";
  } | null>(null);

  // Auto-advance timer ref for continuous frictionless gameplay
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Step 4 Auto Count-Up Scaffold
  const [isCountingUp, setIsCountingUp] = useState<boolean>(false);
  const countUpTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Assistance / Scaffolding flags for current fact (prevent assisted/counted solves from awarding mastery)
  const [hasCountedDots, setHasCountedDots] = useState<boolean>(false);
  const [hasUsedAutoFill, setHasUsedAutoFill] = useState<boolean>(false);
  const [hasUsedHint, setHasUsedHint] = useState<boolean>(false);

  // Dashboard Configurations & Mastery Stats
  const [dailySessions, setDailySessions] = useState<number>(0);
  const [currentSessionSolves, setCurrentSessionSolves] = useState<number>(0);
  const [tableMastery, setTableMastery] = useState<Record<number, number>>({
    2: 0.4,
    3: 0.3,
    4: 0.2,
    5: 0.1,
    6: 0.0,
    7: 0.0,
    8: 0.0,
    9: 0.0,
  });
  const [mcMastery, setMcMastery] = useState<Record<number, number>>({});

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

  // Typing & Solving
  const [typedAnswer, setTypedAnswer] = useState<string>("");
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Accessibility Settings (Item 18)
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    fontSize: "normal",
    highContrast: false,
    colorBlindSafe: false,
    dyslexiaFont: false,
  });

  // Modals
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isFactSelectorOpen, setIsFactSelectorOpen] = useState(false);
  const [isParentViewOpen, setIsParentViewOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

  // Sound Effects
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
    isMuted,
    setIsMuted,
  } = useSoundEffects();

  const targetProduct = factorA * factorB;

  // Restore persistence and load settings on initial visit
  useEffect(() => {
    if (typeof window !== "undefined") {
      const allStudents = loadAllStudents();
      setStudents(allStudents);
      let student: StudentProfile | null = null;
      const savedUser = localStorage.getItem("chadmath_active_user");
      if (savedUser) {
        const result = loginOrCreateStudent(savedUser);
        if (result.student && !result.requiresPin) {
          student = result.student;
        }
      }

      // If no saved user, default to first student or "Amy" so new users land right on the Main Menu!
      if (!student) {
        const defaultName = allStudents.length > 0 ? allStudents[0].name : "Amy";
        const result = loginOrCreateStudent(defaultName);
        if (result.student && !result.requiresPin) {
          student = result.student;
        }
      }

      if (student) {
        setActiveStudent(student);
        setScore(student.score);
        setStreak(student.streak);
        setDailySessions(student.dailySessions);
        setCurrentSessionSolves((student.totalSolved || 0) % 5);
        setTableMastery(student.tableMastery);
        setMcMastery(student.mcMastery || {});
        setIsLoggedIn(true);
        setCurrentView("dashboard");
      } else {
        setIsLoggedIn(false);
      }

      // Load saved accessibility settings
      try {
        const savedA11y = localStorage.getItem("chadmath_accessibility");
        if (savedA11y) {
          setAccessibilitySettings(JSON.parse(savedA11y));
        }
      } catch (e) {
        console.warn("Failed to load accessibility settings", e);
      }
    }
  }, []);

  // Save accessibility settings
  const handleUpdateAccessibility = (newSettings: AccessibilitySettings) => {
    setAccessibilitySettings(newSettings);
    if (typeof window !== "undefined") {
      localStorage.setItem("chadmath_accessibility", JSON.stringify(newSettings));
    }
  };

  // Helper to pick next fact matching selected tables or re-drill queue
  const getNextFactPair = useCallback(
    (tables: number[], queue: QueuedFact[]) => {
      // 1. Priority: Re-drill queue (missed, abandoned, or MC recall)
      if (queue.length > 0) {
        const [nextQueued] = queue;
        return { a: nextQueued.a, b: nextQueued.b, fromQueue: true, reason: nextQueued.reason };
      }

      // 2. Sample from active tables (1st factor from selected tables, 2nd factor 2..9)
      const activeTables = tables.length > 0 ? tables : [2, 3, 4, 5, 6, 7, 8, 9];
      const a = activeTables[Math.floor(Math.random() * activeTables.length)];
      const b = Math.floor(Math.random() * 8) + 2; // 2..9

      return { a, b, fromQueue: false, reason: undefined };
    },
    []
  );

  // Generate 4 stable Multiple Choice options (correct + 3 non-duplicate plausible distractors)
  const generateMcOptions = useCallback((a: number, b: number) => {
    const correct = a * b;
    const offsets = [-b, b, -2, 2, -1, 1, -(b + 1), b + 1];
    const distractors = new Set<number>();
    for (const off of offsets) {
      const val = correct + off;
      if (val > 0 && val !== correct) {
        distractors.add(val);
        if (distractors.size === 3) break;
      }
    }
    // Fallback if needed
    let fallback = 2;
    while (distractors.size < 3) {
      if (fallback !== correct && !distractors.has(fallback)) {
        distractors.add(fallback);
      }
      fallback += 2;
    }
    const list = [correct, ...Array.from(distractors)].slice(0, 4);
    // Shuffle ONCE at fact load time
    return list.sort(() => Math.random() - 0.5);
  }, []);

  // Load a new fact
  const loadFact = useCallback(
    (a: number, b: number, isRecallVerification = false) => {
      setFactorA(a);
      setFactorB(b);
      setCurrentStep(1);
      setLines([]);
      setTypedAnswer("");
      setIsSolved(false);
      setErrorMessage(null);
      setConfettiTrigger(false);
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      if (countUpTimerRef.current) {
        clearTimeout(countUpTimerRef.current);
        countUpTimerRef.current = null;
      }
      setIsCountingUp(false);
      setSolvedFactReview(null);
      setMcRequiresTypingConfirmation(false);
      setIsRecallVerificationFact(isRecallVerification);
      setHasCountedDots(false);
      setHasUsedAutoFill(false);
      setHasUsedHint(false);

      // Generate stable MC options for this fact and clear eliminated list
      setCurrentMcOptions(generateMcOptions(a, b));
      setEliminatedMcOptions([]);
    },
    [generateMcOptions]
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

  const handleDeselectAllTables = () => {
    playHover();
    setSelectedTables([]);
  };

  // Student Login and Switching
  const handleLogin = (username: string, pin?: string) => {
    playHover();
    const result = loginOrCreateStudent(username, pin);
    if (result.requiresPin || result.error) {
      return { requiresPin: result.requiresPin, error: result.error };
    }
    if (result.student) {
      const student = result.student;
      setActiveStudent(student);
      setScore(student.score);
      setStreak(student.streak);
      setDailySessions(student.dailySessions);
      setCurrentSessionSolves((student.totalSolved || 0) % 5);
      setTableMastery(student.tableMastery);
      setMcMastery(student.mcMastery || {});
      setIsLoggedIn(true);
      setStudents(loadAllStudents());
      setCurrentView("practice");
    }
  };

  const handleSwitchPlayer = () => {
    playHover();
    setIsLoggedIn(false);
    setActiveStudent(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("chadmath_active_user");
    }
  };

  // Start Practice from Dashboard
  const handleStartPlay = () => {
    initAudio();
    playHover();
    const next = getNextFactPair(selectedTables, sessionReDrillQueue);
    if (next.fromQueue) {
      setSessionReDrillQueue((prev) => prev.slice(1));
    }
    loadFact(next.a, next.b, next.reason === "mc_recall" || next.reason === "assisted_recall");
    setCurrentView("practice");
  };

  // Resume Abandoned Fact (Item 14)
  const handleResumeAbandonedFact = () => {
    if (!abandonedFact) return;
    initAudio();
    playHover();
    loadFact(abandonedFact.a, abandonedFact.b);
    setAbandonedFact(null);
    setCurrentView("practice");
  };

  const handleDiscardAbandonedFact = () => {
    playHover();
    setAbandonedFact(null);
  };

  // Back to Main Menu: check for abandoned fact (Item 14)
  const handleBackToDashboard = () => {
    playHover();
    if (!isSolved && lines.length > 0) {
      // User is abandoning an in-progress fact! Save prompt and add to re-drill
      setAbandonedFact({ a: factorA, b: factorB });
      setSessionReDrillQueue((prev) => {
        if (!prev.some((f) => f.a === factorA && f.b === factorB)) {
          return [...prev, { a: factorA, b: factorB, reason: "abandoned" }];
        }
        return prev;
      });
    }
    setCurrentView("dashboard");
  };

  const handleResetCurrentFact = () => {
    playHover();
    setCurrentStep(1);
    setLines([]);
    setTypedAnswer("");
    setIsSolved(false);
    setErrorMessage(null);
    setConfettiTrigger(false);
    setSolvedFactReview(null);
    setEliminatedMcOptions([]);
    setMcRequiresTypingConfirmation(false);
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (countUpTimerRef.current) {
      clearTimeout(countUpTimerRef.current);
      countUpTimerRef.current = null;
    }
    setIsCountingUp(false);
    setHasCountedDots(false);
    setHasUsedAutoFill(false);
    setHasUsedHint(false);
  };

  const handleNextFact = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (countUpTimerRef.current) {
      clearTimeout(countUpTimerRef.current);
      countUpTimerRef.current = null;
    }
    setIsCountingUp(false);
    const next = getNextFactPair(selectedTables, sessionReDrillQueue);
    if (next.fromQueue) {
      setSessionReDrillQueue((prev) => prev.slice(1));
    }
    loadFact(next.a, next.b, next.reason === "mc_recall" || next.reason === "assisted_recall");
  }, [getNextFactPair, selectedTables, sessionReDrillQueue, loadFact]);

  // Step 1: Add a line via finger drawing gesture on scratch pad or "+ Group" button (Item 10)
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
    } else if (updated.length > factorA) {
      playIncorrect();
      setErrorMessage(`You have ${updated.length} lines. Look at 1st Factor and erase any extra.`);
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

  // Step 2: 1-Click: Tap on a line to place all tokens for that group
  const handleAddTokenToLine = (groupIndex: number) => {
    initAudio();
    if (currentStep !== 2) return;

    const line = lines[groupIndex];
    if (!line) return;

    // Toggle/undo: if line already has all tokens, clicking it clears the line
    if (line.tokens.length >= factorB) {
      playRemoveLine();
      setLines((prev) => {
        const updated = [...prev];
        updated[groupIndex] = {
          ...line,
          tokens: [],
        };
        return updated;
      });
      return;
    }

    // 1-Click: Place ALL factorB tokens on this line!
    playAddToken(factorB);
    playGroupComplete(groupIndex);
    setErrorMessage(null);

    const allTokensForLine: TokenState[] = Array.from({ length: factorB }).map((_, idx) => ({
      id: `token-${groupIndex}-${idx}-${Date.now()}`,
      isCounted: false,
    }));

    const updated = [...lines];
    updated[groupIndex] = {
      ...line,
      tokens: allTokensForLine,
    };
    setLines(updated);

    // If all tokens placed across all lines, activate Step 3 (Pattern Recognition)!
    const totalPlaced = updated.reduce((acc, l) => acc + l.tokens.length, 0);
    if (totalPlaced === targetProduct) {
      setCurrentStep(3);
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
    setHasUsedAutoFill(true);

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
  };

  // Step 3 / 4: Count Tokens
  const totalCounted = lines.reduce(
    (acc, line) => acc + line.tokens.filter((t) => t.isCounted).length,
    0
  );

  const handleCountToken = useCallback((groupIndex?: number, tokenIndex?: number) => {
    initAudio();
    if (currentStep !== 3 && currentStep !== 4) return;
    if (currentStep === 3) {
      setCurrentStep(4);
    }
    setHasCountedDots(true);

    const currentCount = lines.reduce(
      (acc, line) => acc + line.tokens.filter((t) => t.isCounted).length,
      0
    );
    const nextCount = currentCount + 1;
    if (nextCount > targetProduct) return;

    playCountToken(nextCount);

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
  }, [currentStep, factorB, initAudio, lines, playCountToken, playGroupComplete, targetProduct]);

  // Step 4: Count Up to Show Answer (Final Scaffold)
  const handleStartCountUp = useCallback(() => {
    initAudio();
    if (currentStep < 3 || isSolved) return;
    setCurrentStep(4);
    setHasCountedDots(true);
    setIsCountingUp(true);
  }, [currentStep, isSolved, initAudio]);

  // Step 4: Automated Count-Up Effect
  useEffect(() => {
    if (!isCountingUp || currentStep !== 4 || isSolved) {
      if (countUpTimerRef.current) {
        clearTimeout(countUpTimerRef.current);
        countUpTimerRef.current = null;
      }
      return;
    }

    const uncounted = lines.reduce(
      (acc, l) => acc + l.tokens.filter((t) => !t.isCounted).length,
      0
    );

    if (uncounted === 0) {
      setIsCountingUp(false);
      return;
    }

    countUpTimerRef.current = setTimeout(() => {
      handleCountToken();
    }, 130);

    return () => {
      if (countUpTimerRef.current) {
        clearTimeout(countUpTimerRef.current);
        countUpTimerRef.current = null;
      }
    };
  }, [isCountingUp, currentStep, lines, isSolved, handleCountToken]);



  // SUBMIT ANSWER (Free Recall or Multiple Choice)
  const handleSubmitAnswer = (fromMultipleChoice = false, directAnswer?: number) => {
    initAudio();

    // Allow entering the correct answer at any time!
    const answerToCheck = directAnswer !== undefined ? directAnswer : parseInt(typedAnswer.trim(), 10);
    if (isNaN(answerToCheck)) return;

    if (answerToCheck === targetProduct) {
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

      // Determine solve type: Assisted if learner counted dots, used hint, or auto-filled
      const isAssisted =
        hasCountedDots ||
        hasUsedAutoFill ||
        hasUsedHint ||
        lines.some((l) => l.tokens.some((t) => t.isCounted));

      const solveType: "free_recall" | "multiple_choice" | "assisted" = fromMultipleChoice
        ? "multiple_choice"
        : isAssisted
        ? "assisted"
        : "free_recall";

      // If solved with multiple choice or assisted (counted dots/hints), queue this fact for clean free recall practice!
      if (fromMultipleChoice || isAssisted) {
        const queueReason = fromMultipleChoice ? "mc_recall" : "assisted_recall";
        setSessionReDrillQueue((prev) => {
          if (!prev.some((f) => f.a === factorA && f.b === factorB && f.reason === queueReason)) {
            return [...prev, { a: factorA, b: factorB, reason: queueReason }];
          }
          return prev;
        });
      }

      // Record in student storage (Separate MC vs Recall Mastery: Item 6 & 11)
      if (activeStudent) {
        const updatedStudent = recordStudentFactResult(
          activeStudent.pin,
          factorA,
          factorB,
          true,
          solveType,
          eliminatedMcOptions.length === 0,
          selectedTables
        );
        if (updatedStudent) {
          setActiveStudent(updatedStudent);
          setDailySessions(updatedStudent.dailySessions);
          setCurrentSessionSolves((updatedStudent.totalSolved || 0) % 5);
          setTableMastery(updatedStudent.tableMastery);
          setMcMastery(updatedStudent.mcMastery || {});
          setStudents(loadAllStudents());
        }
      } else {
        // Fallback local session count
        setCurrentSessionSolves((prev) => (prev + 1) % 5);
      }

      setMcRequiresTypingConfirmation(false);
      playFactSuccess();
      setConfettiTrigger(true);

      // Automatically advance to the next question without prompting!
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = setTimeout(() => {
        handleNextFact();
      }, 1300);
    } else {
      // WRONG ANSWER
      playIncorrect();
      setStreak(0);
      setErrorMessage(`Not quite! You entered ${answerToCheck}. Check your groups or click 💡 Hint.`);

      // Add to re-drill queue for missed facts (Item 8)
      setSessionReDrillQueue((prev) => {
        if (!prev.some((f) => f.a === factorA && f.b === factorB)) {
          return [...prev, { a: factorA, b: factorB, reason: "missed" }];
        }
        return prev;
      });

      // Record incorrect attempt in student storage
      if (activeStudent) {
        const updatedStudent = recordStudentFactResult(
          activeStudent.pin,
          factorA,
          factorB,
          false,
          fromMultipleChoice ? "multiple_choice" : "free_recall",
          false,
          selectedTables
        );
        if (updatedStudent) {
          setActiveStudent(updatedStudent);
          setStudents(loadAllStudents());
        }
      }
    }
  };

  // MULTIPLE CHOICE IMMEDIATE 1-CLICK HANDLER: Auto-evaluates and auto-advances
  const handleMultipleChoiceClick = (opt: number) => {
    initAudio();
    if (isSolved || eliminatedMcOptions.includes(opt)) return;

    if (opt === targetProduct) {
      setErrorMessage(null);
      setTypedAnswer(String(opt));
      handleSubmitAnswer(true, opt);
    } else {
      // Wrong option clicked:
      // Permanently eliminate without reshuffling (Item 3 & 4)
      playIncorrect();
      setEliminatedMcOptions((prev) => [...prev, opt]);
      setStreak(0);
      setErrorMessage(`Eliminated ${opt}! It is not the correct product. Check the groups or click 💡 Hint.`);

      // Add to session re-drill queue
      setSessionReDrillQueue((prev) => {
        if (!prev.some((f) => f.a === factorA && f.b === factorB)) {
          return [...prev, { a: factorA, b: factorB, reason: "missed" }];
        }
        return prev;
      });

      if (activeStudent) {
        const updated = recordStudentFactResult(
          activeStudent.pin,
          factorA,
          factorB,
          false,
          "multiple_choice",
          false,
          selectedTables
        );
        if (updated) {
          setActiveStudent(updated);
          setStudents(loadAllStudents());
        }
      }
    }
  };

  // Physical keyboard listeners (Item 22: fix double-digit entry)
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (currentView !== "practice") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting if modals are open
      if (
        isInstructionsOpen ||
        isFactSelectorOpen ||
        isParentViewOpen ||
        isAccessibilityModalOpen ||
        isHintModalOpen
      ) {
        return;
      }

      // If solved, pressing Enter or Space advances immediately to the next question without waiting
      if (isSolved) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
          handleNextFact();
        }
        return;
      }

      // ROOT CAUSE FIX FOR ITEM 22:
      // If the target is an HTML input element (like the EquationHeader input),
      // DO NOT process keydown event here, otherwise the digit gets appended twice!
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Enter") {
          handleSubmitAnswer(false);
        }
        return;
      }

      // Debounce rapid repeats
      const now = Date.now();
      if (now - lastKeyTimeRef.current < 50) return;
      lastKeyTimeRef.current = now;

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
          handleSubmitAnswer(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentView,
    typedAnswer,
    isSolved,
    isBuildFirstLocked,
    currentStep,
    isInstructionsOpen,
    isFactSelectorOpen,
    isParentViewOpen,
    isAccessibilityModalOpen,
    isHintModalOpen,
    solvedFactReview,
    playHover,
    playIncorrect,
    handleSubmitAnswer,
  ]);

  // Root class for accessibility options
  const rootAccessibilityClasses = [
    accessibilitySettings.fontSize === "large" ? "text-lg" : "",
    accessibilitySettings.highContrast ? "contrast-125" : "",
    accessibilitySettings.dyslexiaFont ? "font-sans tracking-wide" : "",
  ].join(" ");

  return (
    <div
      className={`h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#07080c] text-foreground flex flex-col relative select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] ${rootAccessibilityClasses}`}
    >
      {/* Background Ambience Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f22_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f22_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Confetti celebration */}
      <Confetti trigger={confettiTrigger} />

      {/* Solved Fact Restatement Modal removed to ensure seamless auto-advance without prompting */}

      {/* VIEW 1: STUDENT LOGIN (WHEN NOT LOGGED IN) */}
      {!isLoggedIn ? (
        <StudentLogin
          onLogin={handleLogin}
          onBackToMenu={() => {
            const result = loginOrCreateStudent("Amy");
            if (result.student) setActiveStudent(result.student);
            setIsLoggedIn(true);
            setCurrentView("dashboard");
          }}
        />
      ) : currentView === "dashboard" ? (
        /* VIEW 2: CHADMATH MAIN DASHBOARD */
        <ChadMathDashboard
          score={score}
          streak={streak}
          dailySessions={dailySessions}
          currentSessionSolves={currentSessionSolves}
          selectedTables={selectedTables}
          onToggleTable={handleToggleTable}
          onSelectAllTables={handleSelectAllTables}
          onDeselectAllTables={handleDeselectAllTables}
          isMultipleChoice={isMultipleChoice}
          onToggleMultipleChoice={() => setIsMultipleChoice(!isMultipleChoice)}
          tableMastery={tableMastery}
          mcMastery={mcMastery}
          onStartPlay={handleStartPlay}
          currentStudent={activeStudent}
          onSwitchPlayer={handleSwitchPlayer}
          onOpenParentView={() => setIsParentViewOpen(true)}
          onOpenAccessibility={() => setIsAccessibilityModalOpen(true)}
          onStartMultiples={() => {
            initAudio();
            setCurrentView("multiples");
          }}
        />
      ) : currentView === "multiples" ? (
        /* VIEW 3: MULTIPLES / SKIP-COUNTING PRACTICE */
        <MultiplesPractice
          studentPin={activeStudent?.pin}
          onBackToMenu={() => setCurrentView("dashboard")}
          onPlaySuccess={() => {
            playFactSuccess();
            setScore((s) => s + 15);
            setStreak((st) => st + 1);
          }}
          onPlayIncorrect={() => playIncorrect()}
          onFactSolved={() => {
            if (activeStudent) {
              // Award session progress for completing a full 10-multiple sequence
              setCurrentSessionSolves((prev) => {
                const next = prev + 1;
                if (next >= 5) {
                  setDailySessions((d) => d + 1);
                  return 0;
                }
                return next;
              });
            }
          }}
        />
      ) : (
        /* VIEW 4: WORKSHEET PRACTICE MODE */
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
            onBackToDashboard={handleBackToDashboard}
            currentStudent={activeStudent}
            onSwitchPlayer={handleSwitchPlayer}
            onOpenAccessibility={() => setIsAccessibilityModalOpen(true)}
          />

          {/* Re-Drill Notification Banner (Item 8) */}
          {sessionReDrillQueue.length > 0 && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 py-1 text-center flex items-center justify-center gap-2 text-xs text-amber-300 font-bold shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>
                Session Re-Drill active: {sessionReDrillQueue.length} fact(s) queued for recall practice
              </span>
            </div>
          )}

          {/* MASSIVE Prominent Math Fact Equation Header */}
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
              onSubmitAnswer={() => handleSubmitAnswer(false)}
              errorMessage={errorMessage}
              isLinesComplete={lines.length === factorA || isSolved}
              isTokensComplete={
                (lines.length === factorA &&
                  lines.length > 0 &&
                  lines.every((l) => l.tokens.length === factorB)) ||
                isSolved
              }
              onOpenHint={() => {
                setIsHintModalOpen(true);
                setHasUsedHint(true);
              }}
              isBuildLocked={isBuildFirstLocked}
              isLargeFont={accessibilitySettings.fontSize === "large"}
            />
          </div>

          {/* MAIN WORKSPACE: CLASSROOM WORKSHEET SCRATCH PAD & NUMPAD */}
          <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-1 md:py-2 flex flex-col md:flex-row items-stretch justify-between gap-2 sm:gap-3 md:gap-5 relative z-10 overflow-hidden">
            {/* SCRATCH PAD */}
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
                onStartCountUp={handleStartCountUp}
                isCountingUp={isCountingUp}
                onAddGroupClick={() => handleAddLineGesture(100)}
                onBackToMenu={() => setCurrentView("dashboard")}
                isHighContrast={accessibilitySettings.highContrast}
                isDyslexiaFont={accessibilitySettings.dyslexiaFont}
                isLargeFont={accessibilitySettings.fontSize === "large"}
              />
            </div>

            {/* SIDE / BOTTOM PANEL: NUMPAD OR MULTIPLE CHOICE */}
            <div className="shrink-0 w-full md:w-[280px] lg:w-[320px] flex flex-col items-center justify-between gap-1.5 sm:gap-2">
              {isMultipleChoice && !isRecallVerificationFact ? (
                <div className="w-full p-3 rounded-3xl bg-white/[0.04] border border-white/10 flex flex-col gap-2.5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs uppercase tracking-widest text-amber-400 font-black">
                      Scaffold Mode
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-white/50">
                      Recognition Only
                    </span>
                  </div>

                  {/* Multiple Choice options unlocked and clickable at any time */}
                  <div className="grid grid-cols-2 gap-2">
                    {currentMcOptions.map((opt) => {
                      const isEliminated = eliminatedMcOptions.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => handleMultipleChoiceClick(opt)}
                          disabled={isSolved || isEliminated}
                          className={`h-12 sm:h-14 rounded-2xl font-black text-lg sm:text-xl transition-all cursor-pointer flex items-center justify-center border ${
                            isEliminated
                              ? "bg-red-500/10 border-red-500/20 text-white/20 line-through cursor-not-allowed"
                              : "bg-white/5 hover:bg-white/15 active:scale-95 border-white/10 text-white hover:border-cyan-500/50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-white/40 text-center">
                    Clean recall solve required afterwards to build table mastery
                  </p>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2">
                  {isRecallVerificationFact && (
                    <div className="p-2 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-center flex items-center justify-center gap-1.5 text-xs text-indigo-300 font-bold">
                      <span>⭐ Recall Verification: Type answer from memory!</span>
                    </div>
                  )}
                  <Numpad
                    value={typedAnswer}
                    onChange={(val) => {
                      setErrorMessage(null);
                      setTypedAnswer(val);
                    }}
                    onSubmit={() => handleSubmitAnswer(false)}
                    disabled={isSolved}
                    onKeyPressSound={playHover}
                  />
                </div>
              )}

              {/* Quick Helper Action Pills */}
              <div className="flex items-center justify-center gap-2 w-full flex-wrap">

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
                      <RefreshCw className="w-3.5 h-3.5" /> Reset Model
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

      <ParentViewModal
        isOpen={isParentViewOpen}
        onClose={() => setIsParentViewOpen(false)}
        student={activeStudent}
        onStudentUpdated={(updated) => {
          setActiveStudent(updated);
          if (updated) {
            setStudents(loadAllStudents());
          } else {
            handleSwitchPlayer();
          }
        }}
      />

      <AccessibilityModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
        settings={accessibilitySettings}
        onUpdateSettings={handleUpdateAccessibility}
      />

      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        factorA={factorA}
        factorB={factorB}
        currentStep={currentStep}
        linesCount={lines.length}
      />
    </div>
  );
}
