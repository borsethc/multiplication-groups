"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { EquationHeader } from "@/components/EquationHeader";
import { GroupLine, GroupLineData, TokenState } from "@/components/GroupLine";
import { StepControls } from "@/components/StepControls";
import { Numpad } from "@/components/Numpad";
import { Confetti } from "@/components/Confetti";
import { InstructionsModal } from "@/components/InstructionsModal";
import { FactSelectorModal } from "@/components/FactSelectorModal";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PenTool, Sparkles, Eye, ArrowRight } from "lucide-react";

export default function MultiplicationGroupsApp() {
  // Math Fact: factorA = Groups (Lines), factorB = Count per group
  const [factorA, setFactorA] = useState<number>(2);
  const [factorB, setFactorB] = useState<number>(3);

  // Steps: 1: Draw Lines, 2: Add Tokens, 3: Count & Type, 4: Mastered
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Workspace Lines
  const [lines, setLines] = useState<GroupLineData[]>([]);

  // Typing & Solving
  const [typedAnswer, setTypedAnswer] = useState<string>("");
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Celebrations
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isFactSelectorOpen, setIsFactSelectorOpen] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);

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

  // Load a new fact
  const loadFact = useCallback(
    (a: number, b: number) => {
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

  const handleResetCurrentFact = () => {
    setCurrentStep(1);
    setLines([]);
    setTypedAnswer("");
    setIsSolved(false);
    setErrorMessage(null);
    setConfettiTrigger(false);
    speak(`Let's solve ${factorA} times ${factorB} again!`);
  };

  const handleNextFact = () => {
    const facts = [
      { a: 2, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 2 },
      { a: 3, b: 4 },
      { a: 4, b: 3 },
      { a: 5, b: 2 },
      { a: 7, b: 7 },
      { a: 2, b: 5 },
      { a: 4, b: 4 },
      { a: 6, b: 3 },
    ];
    const currentIndex = facts.findIndex((f) => f.a === factorA && f.b === factorB);
    const next = facts[(currentIndex + 1) % facts.length];
    loadFact(next.a, next.b);
  };

  // Step 1: Add/Draw Line
  const handleAddLine = () => {
    initAudio();
    if (lines.length >= 10) return; // reasonable max
    playAddLine();
    setErrorMessage(null);

    const newIndex = lines.length;
    const newLine: GroupLineData = {
      id: `line-${Date.now()}-${newIndex}`,
      groupIndex: newIndex,
      tokens: [],
      isGroupFullyCounted: false,
    };

    setLines([...lines, newLine]);
  };

  // Step 1: Remove Line
  const handleRemoveLine = (groupIndex: number) => {
    initAudio();
    playRemoveLine();
    setErrorMessage(null);
    const updated = lines
      .filter((_, idx) => idx !== groupIndex)
      .map((line, idx) => ({ ...line, groupIndex: idx }));
    setLines(updated);
  };

  // Step 1 validation: Learner verifies their line count!
  const handleValidateLines = () => {
    initAudio();
    if (lines.length === factorA) {
      // Exactly right!
      setCurrentStep(2);
      setErrorMessage(null);
      speak(`Great! You drew ${factorA} groups. Now touch each line to add tokens.`);
    } else if (lines.length < factorA) {
      playIncorrect();
      setErrorMessage(`You drew ${lines.length} lines. Look at the 1st factor: how many groups do you need?`);
      speak(`Check the first factor. You need more lines.`);
    } else {
      playIncorrect();
      setErrorMessage(`You drew ${lines.length} lines. That's too many groups for this fact.`);
      speak(`Check the first factor. That is too many lines.`);
    }
  };

  // Step 2: Add Token
  const handleAddToken = (groupIndex: number) => {
    initAudio();
    if (currentStep !== 2) return;

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
  };

  // Step 2: Remove Token
  const handleRemoveToken = (groupIndex: number, tokenIndex: number) => {
    initAudio();
    if (currentStep !== 2) return;
    playRemoveLine();

    const line = lines[groupIndex];
    if (!line) return;

    const updated = [...lines];
    updated[groupIndex] = {
      ...line,
      tokens: line.tokens.filter((_, idx) => idx !== tokenIndex),
    };
    setLines(updated);
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
  };

  // Step 2 validation: Learner verifies token count
  const handleValidateTokens = () => {
    initAudio();
    const allFilled = lines.every((line) => line.tokens.length === factorB);
    if (allFilled) {
      setCurrentStep(3);
      setErrorMessage(null);
      speak(`All tokens ready! Touch tokens to count them, then type your answer.`);
    } else {
      playIncorrect();
      setErrorMessage(`Each group must have ${factorB} tokens. Fill every line!`);
      speak(`Check the second factor. Fill every line with ${factorB} tokens.`);
    }
  };

  // Step 3: Count Tokens
  const totalCounted = lines.reduce(
    (acc, line) => acc + line.tokens.filter((t) => t.isCounted).length,
    0
  );

  const handleCountToken = (groupIndex: number, tokenIndex: number) => {
    initAudio();
    if (currentStep !== 3) return;

    const line = lines[groupIndex];
    if (!line) return;
    const token = line.tokens[tokenIndex];
    if (!token || token.isCounted) return;

    const nextCount = totalCounted + 1;
    playCountToken(nextCount);
    speak(String(nextCount));

    const updated = lines.map((l, gIdx) => {
      if (gIdx !== groupIndex) return l;

      const newTokens = l.tokens.map((t, tIdx) => {
        if (tIdx !== tokenIndex) return t;
        return { ...t, isCounted: true, countNumber: nextCount };
      });

      const allCountedInGroup = newTokens.every((t) => t.isCounted) && newTokens.length === factorB;

      if (allCountedInGroup && !l.isGroupFullyCounted) {
        setTimeout(() => playGroupComplete(groupIndex), 100);
      }

      return {
        ...l,
        tokens: newTokens,
        isGroupFullyCounted: allCountedInGroup,
      };
    });

    setLines(updated);
    // CRITICAL: We do NOT auto-solve the equation! The learner must type the number!
  };

  // Step 3 Helper: Auto count all
  const handleAutoCountAll = () => {
    initAudio();
    if (currentStep !== 3) return;

    let count = totalCounted;
    const updated = lines.map((l) => {
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
    });
    setLines(updated);
    speak(`All tokens counted! Now type the number you counted.`);
  };

  // SUBMIT TYPED ANSWER (Learner must type the number!)
  const handleSubmitAnswer = () => {
    initAudio();
    if (!typedAnswer.trim()) return;

    const num = parseInt(typedAnswer.trim(), 10);
    if (num === targetProduct) {
      // CORRECT!
      setIsSolved(true);
      setCurrentStep(4);
      setErrorMessage(null);
      playFactSuccess();
      setConfettiTrigger(true);
      speak(`Correct! ${factorA} times ${factorB} equals ${targetProduct}! Awesome job!`);
    } else {
      // INCORRECT
      playIncorrect();
      setErrorMessage(`Not quite! You entered ${num}. Count your tokens carefully and try again.`);
      speak(`Not quite. Try counting your tokens again.`);
    }
  };

  // Physical keyboard listeners
  useEffect(() => {
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
        if (currentStep === 1) {
          handleValidateLines();
        } else if (currentStep === 2) {
          handleValidateTokens();
        } else if (currentStep === 3 || typedAnswer.length > 0) {
          handleSubmitAnswer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    typedAnswer,
    isSolved,
    currentStep,
    isInstructionsOpen,
    isFactSelectorOpen,
    playHover,
    handleValidateLines,
    handleValidateTokens,
    handleSubmitAnswer,
  ]);

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#090a0f] text-foreground flex flex-col relative select-none">
      {/* Background Ambience Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f14_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f14_1px,transparent_1px)] bg-[size:16px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Confetti celebration */}
      <Confetti trigger={confettiTrigger} />

      {/* Top Navbar */}
      <Navbar
        factorA={factorA}
        factorB={factorB}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        speechEnabled={speechEnabled}
        onToggleSpeech={() => setSpeechEnabled(!speechEnabled)}
        onOpenSelector={() => setIsFactSelectorOpen(true)}
        onOpenInstructions={() => setIsInstructionsOpen(true)}
      />

      {/* Math Fact Equation Header (Always Visible at Top!) */}
      <div className="px-3 pt-2 pb-1 shrink-0 z-20">
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
        />
      </div>

      {/* Step Action Controls */}
      <div className="px-3 shrink-0 z-20">
        <StepControls
          currentStep={currentStep}
          linesCount={lines.length}
          totalTokensPlaced={lines.reduce((acc, l) => acc + l.tokens.length, 0)}
          totalTokensCounted={totalCounted}
          onAddLine={handleAddLine}
          onValidateLines={handleValidateLines}
          onValidateTokens={handleValidateTokens}
          onAutoFillTokens={handleAutoFillTokens}
          onAutoCountAll={handleAutoCountAll}
          onNextFact={handleNextFact}
          onResetCurrentFact={handleResetCurrentFact}
        />
      </div>

      {/* Quick Compare Bar - Compact */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-white/40 py-0.5 shrink-0 z-10">
        <Eye className="w-3 h-3 text-cyan-400" />
        <span>Compare lines:</span>
        <button
          onClick={() => loadFact(2, 2)}
          className={`px-1.5 py-0.5 rounded transition-colors ${
            factorA === 2 && factorB === 2 ? "text-cyan-300 font-bold bg-cyan-500/20" : "hover:text-white"
          }`}
        >
          2×2 (Short)
        </button>
        <span>•</span>
        <button
          onClick={() => loadFact(2, 3)}
          className={`px-1.5 py-0.5 rounded transition-colors ${
            factorA === 2 && factorB === 3 ? "text-purple-300 font-bold bg-purple-500/20" : "hover:text-white"
          }`}
        >
          2×3
        </button>
        <span>•</span>
        <button
          onClick={() => loadFact(7, 7)}
          className={`px-1.5 py-0.5 rounded transition-colors ${
            factorA === 7 && factorB === 7 ? "text-pink-300 font-bold bg-pink-500/20" : "hover:text-white"
          }`}
        >
          7×7 (Long)
        </button>
      </div>

      {/* MAIN WORKSPACE: Fits entirely within screen height without global scrolling! */}
      <main className="flex-1 min-h-0 w-full max-w-5xl mx-auto px-3 py-1 flex flex-col md:flex-row items-center justify-center gap-3 relative z-10 overflow-hidden">
        
        {/* LEFT / CENTER: Interactive Lines Canvas */}
        <div
          onClick={() => {
            if (currentStep === 1) handleAddLine();
          }}
          className={`flex-1 w-full h-full max-h-full rounded-2xl border p-2 flex flex-col items-center justify-start overflow-y-auto transition-all ${
            currentStep === 1
              ? "border-cyan-500/30 bg-white/[0.02] cursor-pointer hover:border-cyan-400/50"
              : "border-white/10 bg-white/[0.01]"
          }`}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.2) transparent",
          }}
        >
          {lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 gap-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <PenTool className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-white">Touch Here to Draw a Line</p>
              <p className="text-xs text-white/50 max-w-xs">
                Look at the first factor <span className="text-cyan-400 font-bold">({factorA})</span> to decide how many groups (lines) you need to draw.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-1.5 py-1">
              <AnimatePresence>
                {lines.map((line) => (
                  <GroupLine
                    key={line.id}
                    lineData={line}
                    tokenCapacity={factorB}
                    currentStep={currentStep}
                    onAddToken={handleAddToken}
                    onRemoveToken={handleRemoveToken}
                    onCountToken={handleCountToken}
                    onRemoveLine={handleRemoveLine}
                    canRemoveLine={lines.length > 0 && currentStep === 1}
                  />
                ))}
              </AnimatePresence>

              {/* In Step 1, touch-prompt at the bottom to add more lines */}
              {currentStep === 1 && lines.length < 10 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddLine();
                  }}
                  className="w-full max-w-xs py-1.5 mt-1 rounded-xl border border-dashed border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <PenTool className="w-3 h-3" />
                  + Touch to Draw Another Line
                </button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT / SIDE PANEL: Numpad & Input (Active during counting or solving) */}
        <div className="shrink-0 flex flex-col items-center justify-center">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1">
            Type Your Counted Answer:
          </div>
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
        </div>
      </main>

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
    </div>
  );
}
