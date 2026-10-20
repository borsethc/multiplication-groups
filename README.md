# ChadMath: Groups — Multiplication Learning App

A visual, tactile multiplication learning application built for students mastering their multiplication tables through grouping, dynamic line lengths, and interactive token counting.

## Core Concepts

### 1. Grouping
In any math fact $A \times B$:
- **First Multiple ($A$)** = Number of groups (represented by lines)
- **Second Multiple ($B$)** = Count of tokens per group
- **Total Product ($A \times B$)** = All counted tokens

### 2. Variable Line Lengths
Line lengths dynamically scale to match the second multiple:
- **$2 \times 2$**: Short lines sized for 2 tokens
- **$7 \times 7$**: Long lines sized for 7 tokens
- Illustrates capacity and spatial proportionality for young learners.

### 3. Step-by-Step Learning Flow
1. **Step 1: Add Lines** — Learner adds the exact number of lines (groups) for factor $A$.
2. **Step 2: Add Tokens** — Learner touches each line or slot to place tokens until full ($B$ tokens per line).
3. **Step 3: Count & Color** — Learner touches tokens to count them. As each group finishes counting, it lights up in a distinct group color with a harmonic chord and voice narration!
4. **Step 4: Mastery Celebration** — Full product revealed with celebratory fanfare and confetti.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom Neon Dark Theme (matching ChadMath)
- **Animation**: Framer Motion
- **Audio Engine**: Synthesized Web Audio API + Web Speech API (zero external mp3 dependencies)
- **Effects**: Canvas Confetti

## Getting Started
```bash
cd multiplication-groups
npm install
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) (or default port 3000) in your browser.
