"use client";

export interface StudentHistoryEntry {
  date: string;
  fact: string;
  correct: boolean;
}

export interface StudentProfile {
  id: string;
  pin: string; // 4-digit PIN, e.g. "1111"
  name: string;
  avatar: string; // Emoji
  score: number;
  streak: number;
  dailySessions: number;
  tableMastery: Record<number, number>; // 2..9 -> 0..1
  totalSolved: number;
  totalAttempts: number;
  lastActive: string;
  history: StudentHistoryEntry[];
}

export const TEACHER_PIN = "9999";

const STORAGE_KEY = "chadmath_classroom_students";
const ACTIVE_PIN_KEY = "chadmath_active_student_pin";

// Students are created when a user first enters their username (just like original ChadMath)
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
      const cleaned = parsed.filter(
        (s) =>
          !["student-1", "student-2", "student-3", "student-4"].includes(s.id) &&
          !["Emma Watson", "Liam Chen", "Sophia Rodriguez", "Jackson Davis"].includes(s.name)
      );
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

export function getActiveStudent(): StudentProfile {
  const students = loadAllStudents();
  if (typeof window === "undefined") return students[0];

  try {
    const activePin = localStorage.getItem(ACTIVE_PIN_KEY);
    if (activePin) {
      const found = students.find((s) => s.pin === activePin);
      if (found) return found;
    }
  } catch {
    // fallback
  }

  // Default to first student
  const defaultStudent = students[0] || DEFAULT_STUDENTS[0];
  if (typeof window !== "undefined") {
    localStorage.setItem(ACTIVE_PIN_KEY, defaultStudent.pin);
  }
  return defaultStudent;
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
  isCorrect: boolean
): StudentProfile | null {
  const students = loadAllStudents();
  const index = students.findIndex((s) => s.pin === pin);
  if (index === -1) return null;

  const student = students[index];
  const newTotalAttempts = student.totalAttempts + 1;
  const newTotalSolved = isCorrect ? student.totalSolved + 1 : student.totalSolved;
  const newScore = isCorrect ? student.score + 1 : student.score;
  const newStreak = isCorrect ? student.streak + 1 : 0;

  // Increment mastery for factorA and factorB
  const currentA = student.tableMastery[factorA] || 0;
  const currentB = student.tableMastery[factorB] || 0;
  const delta = isCorrect ? 0.08 : -0.04;

  const updatedMastery = {
    ...student.tableMastery,
    [factorA]: Math.max(0, Math.min(1, Number((currentA + delta).toFixed(2)))),
    [factorB]: Math.max(0, Math.min(1, Number((currentB + delta).toFixed(2)))),
  };

  const newHistory: StudentHistoryEntry = {
    date: "Just now",
    fact: `${factorA} × ${factorB} = ${factorA * factorB}`,
    correct: isCorrect,
  };

  const updatedStudent: StudentProfile = {
    ...student,
    score: newScore,
    streak: newStreak,
    totalSolved: newTotalSolved,
    totalAttempts: newTotalAttempts,
    tableMastery: updatedMastery,
    dailySessions: Math.min(5, isCorrect && newTotalSolved % 5 === 0 ? student.dailySessions + 1 : student.dailySessions),
    lastActive: "Just now",
    history: [newHistory, ...student.history.slice(0, 19)],
  };

  students[index] = updatedStudent;
  saveAllStudents(students);
  return updatedStudent;
}

export function createStudent(name: string, pin: string, avatar: string = "🦁"): StudentProfile {
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
    totalSolved: 0,
    totalAttempts: 0,
    lastActive: "New Student",
    history: [],
  };

  const updated = [...students, newStudent];
  saveAllStudents(updated);
  return newStudent;
}

export function deleteStudent(id: string): void {
  const students = loadAllStudents();
  const updated = students.filter((s) => s.id !== id);
  saveAllStudents(updated.length > 0 ? updated : DEFAULT_STUDENTS);
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
    totalSolved: 0,
    totalAttempts: 0,
    lastActive: "Just now",
    history: [],
  };

  students[index] = reset;
  saveAllStudents(students);
  return reset;
}

export function loginOrCreateStudent(usernameOrPin: string): StudentProfile {
  const students = loadAllStudents();
  const trimmed = usernameOrPin.trim();
  const lower = trimmed.toLowerCase();

  // Search existing by name, pin, or id (case-insensitive)
  const existing = students.find(
    (s) => s.name.toLowerCase() === lower || s.pin === trimmed || s.id.toLowerCase() === lower
  );

  if (existing) {
    existing.lastActive = "Just now";
    saveAllStudents(students);
    setActiveStudentPin(existing.pin);
    if (typeof window !== "undefined") {
      localStorage.setItem("chadmath_active_user", existing.name);
    }
    return existing;
  }

  // First-time player: automatically create their login and record their progress!
  let newPin = Math.floor(1000 + Math.random() * 9000).toString();
  while (students.some((s) => s.pin === newPin) || newPin === TEACHER_PIN) {
    newPin = Math.floor(1000 + Math.random() * 9000).toString();
  }

  const avatars = ["🌟", "🚀", "🦊", "⚡", "🦁", "🐼", "🦄", "🎯", "🔥", "🦅", "🏆", "💎"];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

  const newStudent: StudentProfile = {
    id: `student-${Date.now()}`,
    pin: newPin,
    name: trimmed,
    avatar: randomAvatar,
    score: 0,
    streak: 0,
    dailySessions: 0,
    tableMastery: { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
    totalSolved: 0,
    totalAttempts: 0,
    lastActive: "Just now",
    history: [],
  };

  const updated = [...students, newStudent];
  saveAllStudents(updated);
  setActiveStudentPin(newPin);
  if (typeof window !== "undefined") {
    localStorage.setItem("chadmath_active_user", newStudent.name);
  }
  return newStudent;
}

