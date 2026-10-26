"use client";

export interface StudentHistoryEntry {
  date: string;
  fact: string;
  correct: boolean;
  solveType: "free_recall" | "multiple_choice" | "assisted" | "missed";
  firstTry: boolean;
}

export interface MultiplesRecord {
  bestTimeSeconds: number;
  highScore: number;
  completedAt: string;
}

export interface StudentProfile {
  id: string;
  pin: string; // 4-digit PIN, e.g. "1111"
  name: string;
  avatar: string; // Emoji
  score: number;
  streak: number;
  dailySessions: number;
  tableMastery: Record<number, number>; // Clean Free-Recall mastery (2..9 -> 0..1)
  mcMastery: Record<number, number>; // Recognition/Multiple-Choice mastery (2..9 -> 0..1)
  totalSolved: number;
  totalAttempts: number;
  lastActive: string;
  history: StudentHistoryEntry[];
  hasPrivatePin?: boolean;
  multiplesRecords?: Record<number, MultiplesRecord>;
}

export const TEACHER_PIN = "9999";

const STORAGE_KEY = "chadmath_classroom_students";
const ACTIVE_PIN_KEY = "chadmath_active_student_pin";

// Students are created when a user first enters their username
const DEFAULT_STUDENTS: StudentProfile[] = [];

export function loadAllStudents(): StudentProfile[] {
  if (typeof window === "undefined") return DEFAULT_STUDENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any dummy seeded profiles from previous testing
      const cleaned = parsed
        .filter(
          (s) =>
            !["student-1", "student-2", "student-3", "student-4"].includes(s.id) &&
            !["Emma Watson", "Liam Chen", "Sophia Rodriguez", "Jackson Davis"].includes(s.name)
        )
        .map((s) => ({
          ...s,
          mcMastery: s.mcMastery || { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
          tableMastery: s.tableMastery || { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
        }));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return DEFAULT_STUDENTS;
  } catch {
    return DEFAULT_STUDENTS;
  }
}

export function saveAllStudents(students: StudentProfile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.error("Failed to save students to localStorage", e);
  }
}

export function getActiveStudent(): StudentProfile | null {
  const students = loadAllStudents();
  if (typeof window === "undefined" || students.length === 0) return null;

  try {
    const activePin = localStorage.getItem(ACTIVE_PIN_KEY);
    if (activePin) {
      const found = students.find((s) => s.pin === activePin);
      if (found) return found;
    }
  } catch {
    // fallback
  }

  return students[0] || null;
}

export function setActiveStudentPin(pin: string): StudentProfile | null {
  const students = loadAllStudents();
  const match = students.find((s) => s.pin === pin);
  if (match) {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_PIN_KEY, pin);
    }
    return match;
  }
  return null;
}

export function recordStudentFactResult(
  pin: string,
  factorA: number,
  factorB: number,
  isCorrect: boolean,
  solveType: "free_recall" | "multiple_choice" | "assisted" = "free_recall",
  firstTry: boolean = true,
  activeTables?: number[]
): StudentProfile | null {
  const students = loadAllStudents();
  const index = students.findIndex((s) => s.pin === pin);
  if (index === -1) return null;

  const student = students[index];
  const newTotalAttempts = student.totalAttempts + 1;
  const newTotalSolved = isCorrect ? student.totalSolved + 1 : student.totalSolved;
  const newScore = isCorrect ? student.score + 1 : student.score;
  const newStreak = isCorrect ? student.streak + 1 : 0;

  // Multiple Choice solves only raise mcMastery, NOT free-recall tableMastery!
  // Assisted solves (using dot counting, auto-fill, or hints) DO NOT raise recall mastery!
  let updatedRecallMastery = { ...student.tableMastery };
  let updatedMcMastery = { ...(student.mcMastery || { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }) };

  const shouldUpdateA = !activeTables || activeTables.length === 0 || activeTables.includes(factorA);
  const shouldUpdateB = !activeTables || activeTables.length === 0 || activeTables.includes(factorB);

  if (isCorrect) {
    if (solveType === "free_recall") {
      // ONLY Clean Recall (unassisted) raises table mastery!
      if (shouldUpdateA) {
        const curA = updatedRecallMastery[factorA] || 0;
        updatedRecallMastery[factorA] = Math.max(0, Math.min(1, Number((curA + 0.08).toFixed(2))));
      }
      if (shouldUpdateB) {
        const curB = updatedRecallMastery[factorB] || 0;
        updatedRecallMastery[factorB] = Math.max(0, Math.min(1, Number((curB + 0.08).toFixed(2))));
      }
    } else if (solveType === "multiple_choice") {
      // Multiple Choice Recognition scaffold only
      if (shouldUpdateA) {
        const curA = updatedMcMastery[factorA] || 0;
        updatedMcMastery[factorA] = Math.max(0, Math.min(1, Number((curA + 0.06).toFixed(2))));
      }
      if (shouldUpdateB) {
        const curB = updatedMcMastery[factorB] || 0;
        updatedMcMastery[factorB] = Math.max(0, Math.min(1, Number((curB + 0.06).toFixed(2))));
      }
    }
    // Note: solveType === "assisted" does NOT increase recall mastery or MC mastery!
  } else {
    // Incorrect answer penalizes recall mastery
    if (shouldUpdateA) {
      const curA = updatedRecallMastery[factorA] || 0;
      updatedRecallMastery[factorA] = Math.max(0, Math.min(1, Number((curA - 0.04).toFixed(2))));
    }
    if (shouldUpdateB) {
      const curB = updatedRecallMastery[factorB] || 0;
      updatedRecallMastery[factorB] = Math.max(0, Math.min(1, Number((curB - 0.04).toFixed(2))));
    }
  }

  const newHistory: StudentHistoryEntry = {
    date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    fact: `${factorA} × ${factorB} = ${factorA * factorB}`,
    correct: isCorrect,
    solveType: isCorrect ? solveType : "missed",
    firstTry,
  };

  const updatedStudent: StudentProfile = {
    ...student,
    score: newScore,
    streak: newStreak,
    totalSolved: newTotalSolved,
    totalAttempts: newTotalAttempts,
    tableMastery: updatedRecallMastery,
    mcMastery: updatedMcMastery,
    dailySessions: Math.min(5, isCorrect && newTotalSolved % 5 === 0 ? student.dailySessions + 1 : student.dailySessions),
    lastActive: "Just now",
    history: [newHistory, ...student.history.slice(0, 49)], // preserve up to 50 entries
  };

  students[index] = updatedStudent;
  saveAllStudents(students);
  return updatedStudent;
}

export function createStudent(name: string, pin: string, avatar: string = "🦁", hasPrivatePin: boolean = false): StudentProfile {
  const students = loadAllStudents();
  const newStudent: StudentProfile = {
    id: `student-${Date.now()}`,
    pin: pin.trim(),
    name: name.trim(),
    avatar: avatar || "🦁",
    score: 0,
    streak: 0,
    dailySessions: 0,
    tableMastery: { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    mcMastery: { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    totalSolved: 0,
    totalAttempts: 0,
    lastActive: "New Student",
    history: [],
    hasPrivatePin,
  };

  const updated = [...students, newStudent];
  saveAllStudents(updated);
  return newStudent;
}

export function updateStudentProfile(id: string, updates: Partial<StudentProfile>): StudentProfile | null {
  const students = loadAllStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updatedStudent: StudentProfile = {
    ...students[index],
    ...updates,
    lastActive: "Just now",
  };

  students[index] = updatedStudent;
  saveAllStudents(students);
  return updatedStudent;
}

export function deleteStudent(id: string): void {
  const students = loadAllStudents();
  const updated = students.filter((s) => s.id !== id);
  saveAllStudents(updated);
}

export function resetStudentProgress(id: string): StudentProfile | null {
  const students = loadAllStudents();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const student = students[index];
  const reset: StudentProfile = {
    ...student,
    score: 0,
    streak: 0,
    dailySessions: 0,
    tableMastery: { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    mcMastery: { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    totalSolved: 0,
    totalAttempts: 0,
    lastActive: "Just now",
    history: [],
  };

  students[index] = reset;
  saveAllStudents(students);
  return reset;
}

export interface LoginResult {
  student: StudentProfile | null;
  requiresPin?: boolean;
  error?: string;
}

export function loginOrCreateStudent(usernameOrPin: string, providedPin?: string): LoginResult {
  const students = loadAllStudents();
  const trimmed = usernameOrPin.trim();
  const lower = trimmed.toLowerCase();

  // Search existing by name or id (case-insensitive) or pin
  const existing = students.find(
    (s) => s.name.toLowerCase() === lower || s.pin === trimmed || s.id.toLowerCase() === lower
  );

  if (existing) {
    // If account is private PIN protected, verify PIN
    if (existing.hasPrivatePin) {
      if (!providedPin || !providedPin.trim()) {
        return { student: null, requiresPin: true };
      }
      if (providedPin.trim() !== existing.pin) {
        return { student: null, requiresPin: true, error: "Incorrect PIN for this username." };
      }
    }

    existing.lastActive = "Just now";
    saveAllStudents(students);
    setActiveStudentPin(existing.pin);
    if (typeof window !== "undefined") {
      localStorage.setItem("chadmath_active_user", existing.name);
    }
    return { student: existing };
  }

  // First-time player: automatically create their login and record their progress!
  let newPin = providedPin && providedPin.trim().length === 4 ? providedPin.trim() : Math.floor(1000 + Math.random() * 9000).toString();
  while (!providedPin && (students.some((s) => s.pin === newPin) || newPin === TEACHER_PIN)) {
    newPin = Math.floor(1000 + Math.random() * 9000).toString();
  }

  const avatars = ["🌟", "🚀", "🦊", "⚡", "🦁", "🐼", "🦄", "🎯", "🔥", "🦅", "🏆", "💎"];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

  const hasPrivate = Boolean(providedPin && providedPin.trim().length === 4);

  const newStudent: StudentProfile = {
    id: `student-${Date.now()}`,
    pin: newPin,
    name: trimmed,
    avatar: randomAvatar,
    score: 0,
    streak: 0,
    dailySessions: 0,
    tableMastery: { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    mcMastery: { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    totalSolved: 0,
    totalAttempts: 0,
    lastActive: "Just now",
    history: [],
    hasPrivatePin: hasPrivate,
  };

  const updated = [...students, newStudent];
  saveAllStudents(updated);
  setActiveStudentPin(newPin);
  if (typeof window !== "undefined") {
    localStorage.setItem("chadmath_active_user", newStudent.name);
  }
  return { student: newStudent };
}

export function saveMultiplesRecord(
  pin: string | undefined,
  table: number,
  score: number,
  timeSeconds: number
): { isNewBestTime: boolean; isNewHighScore: boolean; record: MultiplesRecord } {
  let isNewBestTime = false;
  let isNewHighScore = false;

  const storageKey = pin ? `chadmath_multiples_${pin}` : "chadmath_multiples_guest";
  let records: Record<number, MultiplesRecord> = {};
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) records = JSON.parse(raw);
    } catch {}
  }

  const prev = records[table];
  if (!prev) {
    isNewBestTime = true;
    isNewHighScore = true;
    records[table] = {
      bestTimeSeconds: Number(timeSeconds.toFixed(1)),
      highScore: score,
      completedAt: new Date().toISOString(),
    };
  } else {
    if (timeSeconds < prev.bestTimeSeconds) {
      isNewBestTime = true;
      prev.bestTimeSeconds = Number(timeSeconds.toFixed(1));
    }
    if (score > prev.highScore) {
      isNewHighScore = true;
      prev.highScore = score;
    }
    prev.completedAt = new Date().toISOString();
    records[table] = prev;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, JSON.stringify(records));
  }

  if (pin) {
    const students = loadAllStudents();
    const st = students.find((s) => s.pin === pin);
    if (st) {
      st.multiplesRecords = records;
      saveAllStudents(students);
    }
  }

  return { isNewBestTime, isNewHighScore, record: records[table] };
}

export function getMultiplesRecord(pin: string | undefined, table: number): MultiplesRecord | null {
  const storageKey = pin ? `chadmath_multiples_${pin}` : "chadmath_multiples_guest";
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed[table] || null;
    }
  } catch {}
  return null;
}
