"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Users,
  Trophy,
  Flame,
  ArrowLeft,
  UserPlus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  StudentProfile,
  createStudent,
  deleteStudent,
  resetStudentProgress,
} from "@/lib/studentStorage";

interface TeacherDashboardProps {
  students: StudentProfile[];
  onBackToApp: () => void;
  onSelectStudentToPractice: (student: StudentProfile) => void;
  onRefreshStudents: () => void;
}

export function TeacherDashboard({
  students,
  onBackToApp,
  onSelectStudentToPractice,
  onRefreshStudents,
}: TeacherDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentProfile | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPin, setNewStudentPin] = useState("");
  const [newStudentAvatar, setNewStudentAvatar] = useState("🦁");
  const [addError, setAddError] = useState<string | null>(null);

  const tables = [2, 3, 4, 5, 6, 7, 8, 9];

  // Classroom metrics calculation
  const totalStudents = students.length;
  const totalSolvedClass = students.reduce((acc, s) => acc + s.totalSolved, 0);

  // Class mastery per table (average across all students)
  const classTableMastery: Record<number, number> = {};
  tables.forEach((tbl) => {
    const sum = students.reduce((acc, s) => acc + (s.tableMastery[tbl] || 0), 0);
    classTableMastery[tbl] = totalStudents > 0 ? Number((sum / totalStudents).toFixed(2)) : 0;
  });

  // Overall class average mastery
  const overallClassMastery = Math.round(
    (tables.reduce((acc, tbl) => acc + classTableMastery[tbl], 0) / tables.length) * 100
  );

  // Find table with lowest class mastery
  let lowestTable = 2;
  let lowestMastery = 1;
  tables.forEach((tbl) => {
    if (classTableMastery[tbl] < lowestMastery) {
      lowestMastery = classTableMastery[tbl];
      lowestTable = tbl;
    }
  });

  // Filter students by search
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pin.includes(searchQuery)
  );

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newStudentName.trim()) {
      setAddError("Please enter a student name");
      return;
    }
    if (!/^\d{4}$/.test(newStudentPin.trim())) {
      setAddError("PIN must be exactly 4 digits");
      return;
    }
    if (students.some((s) => s.pin === newStudentPin.trim())) {
      setAddError("This PIN is already assigned to another student");
      return;
    }

    createStudent(newStudentName, newStudentPin, newStudentAvatar);
    onRefreshStudents();
    setNewStudentName("");
    setNewStudentPin("");
    setIsAddStudentOpen(false);
  };

  const handleResetStudent = (id: string, name: string) => {
    if (confirm(`Are you sure you want to reset all progress for ${name}?`)) {
      resetStudentProgress(id);
      onRefreshStudents();
      if (selectedStudentForDetail && selectedStudentForDetail.id === id) {
        setSelectedStudentForDetail(null);
      }
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (confirm(`Remove ${name} from classroom roster?`)) {
      deleteStudent(id);
      onRefreshStudents();
      if (selectedStudentForDetail && selectedStudentForDetail.id === id) {
        setSelectedStudentForDetail(null);
      }
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#090a0f] text-slate-100 overflow-y-auto select-none p-3 sm:p-6">
      
      {/* TOP HEADER */}
      <header className="w-full flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Teacher Command Center
            </h1>
            <p className="text-[11px] sm:text-xs text-white/50 uppercase tracking-widest font-bold">
              Classroom Progress & Multiples Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Student Button */}
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden xs:inline">Add Student</span>
          </button>

          {/* Back to App */}
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Math</span>
          </button>
        </div>
      </header>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 my-3 sm:my-5 shrink-0">
        {/* Card 1: Active Students */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 shadow-md">
          <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-white/50 uppercase font-bold tracking-wider block">
              Enrolled Students
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{totalStudents}</span>
          </div>
        </div>

        {/* Card 2: Class Average Mastery */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 shadow-md">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-white/50 uppercase font-bold tracking-wider block">
              Class Mastery
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400">
              {overallClassMastery}%
            </span>
          </div>
        </div>

        {/* Card 3: Total Facts Solved */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 shadow-md">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-white/50 uppercase font-bold tracking-wider block">
              Facts Solved
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{totalSolvedClass}</span>
          </div>
        </div>

        {/* Card 4: Focus Area Table */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 shadow-md">
          <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-white/50 uppercase font-bold tracking-wider block">
              Needs Focus
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-300">
              Table ×{lowestTable} ({Math.round(lowestMastery * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* CLASS TABLE MASTERY HEATMAP / MATRIX */}
      <div className="w-full p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/10 mb-4 sm:mb-6 shadow-xl shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              Class Table Mastery Distribution (×2 through ×9)
            </h2>
            <p className="text-[10px] sm:text-xs text-white/50 font-medium">
              Real-time proficiency breakdown across all registered student PINs
            </p>
          </div>
          <span className="text-[10px] sm:text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20 hidden xs:inline">
            Class Goal: 80%+
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {tables.map((tbl) => {
            const mastery = classTableMastery[tbl] || 0;
            const percent = Math.round(mastery * 100);

            let statusColor = "from-slate-600 to-slate-700 text-slate-300";
            let statusLabel = "Emerging";
            if (percent >= 80) {
              statusColor = "from-emerald-500 to-teal-500 text-emerald-300";
              statusLabel = "Mastered";
            } else if (percent >= 50) {
              statusColor = "from-amber-500 to-orange-500 text-amber-300";
              statusLabel = "Developing";
            } else if (percent > 0) {
              statusColor = "from-rose-500 to-pink-500 text-rose-300";
              statusLabel = "Needs Focus";
            }

            return (
              <div
                key={tbl}
                className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-center gap-1.5"
              >
                <span className="text-xs sm:text-sm font-black text-white">×{tbl}</span>
                {/* Vertical bar meter */}
                <div className="w-full h-12 sm:h-16 bg-white/5 rounded-lg p-0.5 flex flex-col justify-end overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(percent, 8)}%` }}
                    transition={{ duration: 0.6 }}
                    className={`w-full rounded-md bg-gradient-to-t ${statusColor}`}
                  />
                </div>
                <span className="text-xs sm:text-sm font-black text-white">{percent}%</span>
                <span className="text-[8px] uppercase tracking-wider text-white/40 font-bold truncate max-w-full">
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STUDENT ROSTER TABLE */}
      <div className="w-full flex-1 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/10 shadow-xl flex flex-col">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">Student Roster & Profiles</h2>
            <p className="text-xs text-white/50">
              Students sign in via their 4-digit PIN on the home screen.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or PIN..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] sm:text-[11px] uppercase tracking-wider text-white/40">
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-2">PIN</th>
                <th className="py-2.5 px-2">Mastery</th>
                <th className="py-2.5 px-2">Tables Breakdown (2..9)</th>
                <th className="py-2.5 px-2 text-center">Solved</th>
                <th className="py-2.5 px-2 text-center">Streak</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
              {filteredStudents.map((student) => {
                // Average student mastery
                const studentAvgMastery = Math.round(
                  (tables.reduce((acc, t) => acc + (student.tableMastery[t] || 0), 0) / tables.length) * 100
                );

                return (
                  <tr key={student.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Student Avatar + Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl">{student.avatar}</span>
                        <div>
                          <span className="font-bold text-white block">{student.name}</span>
                          <span className="text-[10px] text-white/40 block">Last: {student.lastActive}</span>
                        </div>
                      </div>
                    </td>

                    {/* PIN Badge */}
                    <td className="py-3 px-2">
                      <span className="font-mono font-bold text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md">
                        {student.pin}
                      </span>
                    </td>

                    {/* Overall Mastery */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              studentAvgMastery >= 75
                                ? "bg-emerald-400"
                                : studentAvgMastery >= 45
                                ? "bg-amber-400"
                                : "bg-indigo-400"
                            }`}
                            style={{ width: `${studentAvgMastery}%` }}
                          />
                        </div>
                        <span className="font-bold text-xs">{studentAvgMastery}%</span>
                      </div>
                    </td>

                    {/* Mini Table Pills */}
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        {tables.map((t) => {
                          const m = student.tableMastery[t] || 0;
                          return (
                            <span
                              key={t}
                              className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                                m >= 0.8
                                  ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                                  : m >= 0.4
                                  ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                                  : "bg-white/5 text-white/30 border border-white/5"
                              }`}
                              title={`Table ×${t}: ${Math.round(m * 100)}%`}
                            >
                              {t}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Solved Count */}
                    <td className="py-3 px-2 text-center font-bold text-white">
                      {student.totalSolved}
                    </td>

                    {/* Flame Streak */}
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-orange-400 text-xs">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {student.streak}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Switch to this student to practice */}
                        <button
                          onClick={() => onSelectStudentToPractice(student)}
                          className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Practice as this student"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span className="hidden sm:inline">Practice</span>
                        </button>

                        {/* View History Detail */}
                        <button
                          onClick={() => setSelectedStudentForDetail(student)}
                          className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Details
                        </button>

                        {/* Reset button */}
                        <button
                          onClick={() => handleResetStudent(student.id, student.name)}
                          className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Reset progress"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD NEW STUDENT */}
      <AnimatePresence>
        {isAddStudentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#11131c] border border-white/15 rounded-3xl p-5 text-white shadow-2xl"
            >
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                Add Student to Roster
              </h3>
              <p className="text-xs text-white/50 mb-4">
                Assign a student name and their personal 4-digit PIN.
              </p>

              <form onSubmit={handleCreateStudent} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-white/70 block mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="e.g. Mason Miller"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/70 block mb-1">
                    4-Digit Student PIN
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={newStudentPin}
                    onChange={(e) => setNewStudentPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 5555"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm font-mono text-cyan-300 placeholder:text-white/30 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/70 block mb-1">
                    Student Mascot Avatar
                  </label>
                  <div className="flex items-center gap-2">
                    {["🦁", "🚀", "🌟", "⚡", "🦊", "🐬", "🐯", "🐼"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewStudentAvatar(emoji)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all cursor-pointer ${
                          newStudentAvatar === emoji
                            ? "bg-indigo-600 border-indigo-400 scale-110 shadow-md"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {addError && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2 rounded-xl font-bold">
                    {addError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 cursor-pointer mt-2"
                >
                  Save Student
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: STUDENT DETAILS DRILLDOWN */}
      <AnimatePresence>
        {selectedStudentForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#11131c] border border-white/15 rounded-3xl p-5 text-white shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                <span className="text-3xl">{selectedStudentForDetail.avatar}</span>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedStudentForDetail.name}</h3>
                  <span className="text-xs font-mono text-cyan-300">
                    PIN: {selectedStudentForDetail.pin} • Score: {selectedStudentForDetail.score}
                  </span>
                </div>
              </div>

              {/* Individual Table Breakdown */}
              <div className="mb-4">
                <span className="text-xs uppercase font-bold text-white/50 tracking-wider block mb-2">
                  Table Mastery Breakdown:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {tables.map((t) => {
                    const m = selectedStudentForDetail.tableMastery[t] || 0;
                    return (
                      <div
                        key={t}
                        className="p-2 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col items-center"
                      >
                        <span className="font-bold text-xs text-white">×{t}</span>
                        <span className="font-black text-sm text-cyan-400">{Math.round(m * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Problem History */}
              <div className="flex-1 overflow-y-auto pr-1">
                <span className="text-xs uppercase font-bold text-white/50 tracking-wider block mb-2">
                  Recent Activity:
                </span>
                {selectedStudentForDetail.history.length === 0 ? (
                  <p className="text-xs text-white/40 italic py-2">No problems recorded yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedStudentForDetail.history.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-white">{h.fact}</span>
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded ${
                            h.correct
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {h.correct ? "Solved" : "Attempted"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Practice as this student button */}
              <div className="pt-3 border-t border-white/10 mt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    const s = selectedStudentForDetail;
                    setSelectedStudentForDetail(null);
                    onSelectStudentToPractice(s);
                  }}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Practice as {selectedStudentForDetail.name}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
