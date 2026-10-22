/**
 * Generates educational prompts, skip-counting pattern hints,
 * and context-aware morphing hints for any multiplication fact A x B.
 */

export interface ContextualHintItem {
  id: string;
  badge: string;
  badgeColor: string; // Tailwind class
  text: string;
}

export function getContextualHints(
  factorA: number,
  factorB: number,
  currentStep: 1 | 2 | 3 | 4,
  linesCount: number = 0,
  tokensCount: number = 0
): ContextualHintItem[] {
  const product = factorA * factorB;

  // 1. Primary Pattern progression hint
  let patternHint = "";
  if (factorB >= 3) {
    const prev2 = factorB - 2;
    const prev1 = factorB - 1;
    patternHint = `${factorA} × ${prev2} = ${factorA * prev2}, and ${factorA} × ${prev1} = ${factorA * prev1} — what sum comes next?`;
  } else if (factorB === 2) {
    patternHint = `${factorA} × 1 = ${factorA} — add ${factorA} more: what sum comes next?`;
  } else {
    patternHint = `1 group of ${factorB} is ${factorB}!`;
  }

  // 2. Skip Count hint
  const skipCounts = Array.from({ length: factorB }).map(
    (_, i) => (i + 1) * factorA
  );
  const skipCountStr = skipCounts.slice(0, -1).join(", ") + ", [ ? ]";

  // 3. Repeated Addition
  const repeatedAdditionStr = `${Array(factorA).fill(factorB).join(" + ")} = ?`;

  if (currentStep === 1) {
    return [
      {
        id: "step1-prompt",
        badge: "STEP 1: GROUPS",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        text: `Look at the 1st factor (${factorA}) — drag your finger to draw ${factorA} lines!`,
      },
      {
        id: "step1-pattern",
        badge: "PATTERN",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        text: patternHint,
      },
      {
        id: "step1-repeated",
        badge: "ADDITION",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        text: `${factorA} groups means ${repeatedAdditionStr}`,
      },
      {
        id: "step1-anytime",
        badge: "⚡ SHORTCUT",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        text: "Know the answer? You can type it into the [ ? ] box at any time!",
      },
    ];
  }

  if (currentStep === 2) {
    return [
      {
        id: "step2-prompt",
        badge: "STEP 2: TOKENS",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        text: `Look at the 2nd factor (${factorB}) — tap each line to place ${factorB} tokens!`,
      },
      {
        id: "step2-pattern",
        badge: "PATTERN",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        text: patternHint,
      },
      {
        id: "step2-skip",
        badge: "COUNT BY " + factorA,
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        text: `Count: ${skipCountStr}`,
      },
      {
        id: "step2-anytime",
        badge: "⚡ SHORTCUT",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        text: `Each line holds ${factorB}. Ready to solve? Type ${product} anytime!`,
      },
    ];
  }

  if (currentStep === 3) {
    return [
      {
        id: "step3-prompt",
        badge: "STEP 3: COUNT",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        text: "Tap tokens to count up to the answer, or type the number directly!",
      },
      {
        id: "step3-pattern",
        badge: "PATTERN",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        text: patternHint,
      },
      {
        id: "step3-multiples",
        badge: "SKIP COUNT",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        text: `Multiples of ${factorA}: ${skipCounts.join(" → ")}`,
      },
      {
        id: "step3-solve",
        badge: "SOLVE IT",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        text: `Type your final answer in the box above to claim victory!`,
      },
    ];
  }

  // Step 4: Solved
  return [
    {
      id: "step4-solved",
      badge: "🎉 MASTERED",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      text: `Awesome! ${factorA} groups of ${factorB} = ${product}!`,
    },
    {
      id: "step4-math",
      badge: "REPEATED ADDITION",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      text: `${Array(factorA).fill(factorB).join(" + ")} = ${product}`,
    },
    {
      id: "step4-next",
      badge: "READY",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      text: "Tap 'Next Fact' to challenge yourself with another table!",
    },
  ];
}
