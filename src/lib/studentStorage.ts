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

// Default seeded classroom students so teacher dashboard is rich immediately
const DEFAULT_STUDENTS: StudentProfile[] = [
  {
    id: "student-1",
    pin: "1111",
    name: "Emma Watson",
    avatar: "🌟",
    score: 42,
    streak: 5,
    dailySessions: 4,
    tableMastery: { 2: 0.9, 3: 0.85, 4: 0.7, 5: 0.8, 6: 0.45, 7: 0.3, 8: 0.25, 9: 0.2 },
    totalSolved: 58,
    totalAttempts: 64,
    lastActive: "Today at 9:15 AM",
    history: [
      { date: "Today", fact: "3 × 4 = 12", correct: true },
      { date: "Today", fact: "6 × 7 = 42", correct: true },
      { date: "Today", fact: "8 × 9 = 72", correct: false },
    ],
  },
  {
    id: "student-2",
    pin: "2222",
    name: "Liam Chen",
    avatar: "🚀",
    score: 65,
    streak: 8,
    dailySessions: 5,
    tableMastery: { 2: 1.0, 3: 0.95, 4: 0.9, 5: 0.9, 6: 0.8, 7: 0.65, 8: 0.6, 9: 0.5 },
    totalSolved: 92,
    totalAttempts: 98,
    lastActive: "Today at 10:30 AM",
    history: [
      { date: "Today", fact: "7 × 8 = 56", correct: true },
      { date: "Today", fact: "9 × 9 = 81", correct: true },
      { date: "Today", fact: "6 × 8 = 48", correct: true },
    ],
  },
  {
    id: "student-3",
    pin: "3333",
    name: "Sophia Rodriguez",
    avatar: "🦊",
    score: 28,
    streak: 3,
    dailySessions: 2,
    tableMastery: { 2: 0.8, 3: 0.6, 4: 0.5, 5: 0.65, 6: 0.3, 7: 0.15, 8: 0.2, 9: 0.1 },
    totalSolved: 36,
    totalAttempts: 44,
    lastActive: "Yesterday at 2:45 PM",
    history: [
      { date: "Yesterday", fact: "4 × 5 = 20", correct: true },
      { date: "Yesterday", fact: "7 × 3 = 21", correct: true },
    ],
  },
  {
    id: "student-4",
    pin: "4444",
    name: "Jackson Davis",
    avatar: "⚡",
    score: 19,
    streak: 2,
    dailySessions: 1,
    tableMastery: { 2: 0.7, 3: 0.5, 4: 0.35, 5: 0.4, 6: 0.2, 7: 0.1, 8: 0.15, 9: 0.05 },
    totalSolved: 24,
    totalAttempts: 32,
    lastActive: "Today at 8:50 AM",
    history: [
      { date: "Today", fact: "2 × 6 = 12", correct: true },
      { date: "Today", fact: "7 × 6 = 42", correct: false },
    ],
  },
];

export function loadAllStudents(): StudentProfile[] {
  if (typeof window === "undefined") return DEFAULT_STUDENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STUDENTS;
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
