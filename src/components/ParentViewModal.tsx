"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ShieldCheck, Download, Trash2, Edit3, Key, CheckCircle2, AlertCircle, TrendingUp, HelpCircle } from "lucide-react";
import { StudentProfile, updateStudentProfile, deleteStudent } from "@/lib/studentStorage";

interface ParentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  onStudentUpdated: (student: StudentProfile | null) => void;
}

export function ParentViewModal({
  isOpen,
  onClose,
  student,
  onStudentUpdated,
}: ParentViewModalProps) {
  // Parent Gate state
  const [gateAnswer, setGateAnswer] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [gateError, setGateError] = useState(false);

  // Edit Profile state
  const [newName, setNewName] = useState(student?.name || "");
  const [newPin, setNewPin] = useState(student?.pin || "");
  const [enablePrivatePin, setEnablePrivatePin] = useState(student?.hasPrivatePin || false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple math challenge: 7 × 8 = 56
    if (gateAnswer.trim() === "56") {
      setIsUnlocked(true);
      setGateError(false);
    } else {
      setGateError(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const updated = updateStudentProfile(student.id, {
      name: newName.trim(),
      pin: newPin.trim(),
      hasPrivatePin: enablePrivatePin,
    });

    if (updated) {
      onStudentUpdated(updated);
      setEditSuccessMsg("Profile updated successfully!");
      setTimeout(() => setEditSuccessMsg(null), 3000);
    }
  };

  const handleDeleteProfile = () => {
    if (confirm(`Are you sure you want to delete profile "${student.name}"? This cannot be undone.`)) {
      deleteStudent(student.id);
      onStudentUpdated(null);
      onClose();
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ["ChadMath Groups Progress Report"],
      ["Student Name", student.name],
      ["Student ID", student.id],
      ["Date Exported", new Date().toLocaleString()],
      ["Score", student.score],
      ["Streak", student.streak],
      ["Total Solved", student.totalSolved],
      ["Total Attempts", student.totalAttempts],
      [],
      ["Multiplication Table", "Free Recall Mastery (%)", "Multiple-Choice Recognition (%)"],
      ...[2, 3, 4, 5, 6, 7, 8, 9].map((tbl) => [
        `×${tbl}`,
        `${Math.round((student.tableMastery[tbl] || 0) * 100)}%`,
        `${Math.round(((student.mcMastery && student.mcMastery[tbl]) || 0) * 100)}%`,
      ]),
      [],
      ["Fact History Log"],
      ["Time", "Fact", "Result", "Solve Method", "First Try"],
      ...student.history.map((h) => [
        h.date,
        h.fact,
        h.correct ? "Correct" : "Incorrect",
        h.solveType === "free_recall"
          ? "Free Recall"
          : h.solveType === "multiple_choice"
          ? "Multiple Choice (Scaffold)"
          : h.solveType === "assisted"
          ? "Model Counted (Scaffold)"
          : "Missed",
        h.firstTry ? "Yes" : "No",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ChadMath_${student.name.replace(/\s+/g, "_")}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const missedFacts = Array.from(
    new Set(student.history.filter((h) => !h.correct).map((h) => h.fact.split(" = ")[0]))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[92vh] bg-[#0c0e17] border border-white/15 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col text-white overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Parent & Progress View</h2>
              <p className="text-[10px] sm:text-xs text-white/50">
                Detailed learning insights, recall vs recognition breakdown, & privacy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer"
              title="Return to Main Menu"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Main Menu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isUnlocked ? (
          /* PARENT GATE */
          <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold mb-1">Parent Verification Gate</h3>
            <p className="text-xs text-white/60 max-w-sm mb-4">
              To view detailed fact history, export reports, or manage profile privacy, please solve:
            </p>
            <div className="text-2xl font-black font-mono text-amber-300 mb-3 bg-white/5 px-6 py-2 rounded-2xl border border-white/10">
              7 × 8 = ?
            </div>
            <form onSubmit={handleGateSubmit} className="flex flex-col items-center gap-3 w-full max-w-xs">
              <input
                type="text"
                inputMode="numeric"
                value={gateAnswer}
                onChange={(e) => setGateAnswer(e.target.value)}
                placeholder="Enter answer"
                className="w-full bg-black/60 border border-white/20 rounded-xl px-4 py-2.5 text-center text-lg font-bold text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
              {gateError && <p className="text-xs text-rose-400 font-bold">Incorrect answer. Try again.</p>}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm transition-all cursor-pointer"
              >
                Unlock Parent Controls
              </button>
            </form>
          </div>
        ) : (
          /* DETAILED PARENT DASHBOARD */
          <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs sm:text-sm">
            {/* Student Header & Export Button */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">{student.avatar}</span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">{student.name}</h3>
                  <p className="text-[11px] text-white/40">
                    Solved: <strong className="text-white">{student.totalSolved}</strong> facts • Attempts:{" "}
                    <strong className="text-white">{student.totalAttempts}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Report</span>
              </button>
            </div>

            {/* RECALL VS MULTIPLE CHOICE RECOGNITION EXPLANATION & BREAKDOWN */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Free Recall (Mastery) vs Multiple Choice (Recognition Scaffold)
                </h4>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Clean recall requires typing the answer without prompts, which represents true mastery. Multiple-choice is a learning scaffold and is tracked separately so guesses do not inflate true recall.
              </p>

              {/* Mastery Table Comparison */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                {[2, 3, 4, 5, 6, 7, 8, 9].map((tbl) => {
                  const recall = Math.round((student.tableMastery[tbl] || 0) * 100);
                  const mc = Math.round(((student.mcMastery && student.mcMastery[tbl]) || 0) * 100);
                  return (
                    <div key={tbl} className="p-2 rounded-xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                      <span className="font-mono font-black text-xs text-white">×{tbl}</span>
                      <div className="mt-1 w-full space-y-1">
                        <div>
                          <div className="flex justify-between text-[8px] text-white/50">
                            <span>Recall</span>
                            <span className="font-bold text-emerald-400">{recall}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${recall}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[8px] text-white/50">
                            <span>MC</span>
                            <span className="font-bold text-purple-300">{mc}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-400 rounded-full" style={{ width: `${mc}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MISSED FACTS / RE-DRILL LIST */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Facts Requiring Re-Drill ({missedFacts.length})
              </h4>
              {missedFacts.length === 0 ? (
                <p className="text-xs text-emerald-400 font-semibold">
                  🎉 Fantastic! No recent missed facts. All practiced facts solved cleanly!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missedFacts.map((fact, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold"
                    >
                      {fact}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* FACT LOG TABLE */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
                Recent Fact History (Recall vs Scaffold Breakdown)
              </h4>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-white/5 text-white/50 sticky top-0">
                    <tr>
                      <th className="py-1.5 px-2.5 font-bold">Time</th>
                      <th className="py-1.5 px-2.5 font-bold">Fact</th>
                      <th className="py-1.5 px-2.5 font-bold">Method</th>
                      <th className="py-1.5 px-2.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {student.history.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-white/40">
                          No practice history recorded yet.
                        </td>
                      </tr>
                    ) : (
                      student.history.slice(0, 30).map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-1.5 px-2.5 text-white/40 font-mono">{item.date}</td>
                          <td className="py-1.5 px-2.5 font-bold font-mono text-white">{item.fact}</td>
                          <td className="py-1.5 px-2.5">
                            {item.solveType === "free_recall" ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                                Free Recall
                              </span>
                            ) : item.solveType === "multiple_choice" ? (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[9px] font-bold">
                                Multiple Choice
                              </span>
                            ) : item.solveType === "assisted" ? (
                              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold">
                                Model Counted
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[9px] font-bold">
                                Missed
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-2.5">
                            {item.correct ? (
                              <span className="text-emerald-400 font-bold">
                                {item.firstTry ? "✅ 1st Try" : "🔄 Solved"}
                              </span>
                            ) : (
                              <span className="text-rose-400 font-bold">❌ Missed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PROFILE MANAGEMENT & PRIVACY (Rename, PIN, Delete) */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                Profile Settings & Privacy Lock
              </h4>

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/50 block mb-1">
                      Learner Username
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-white/50 block mb-1">
                      Private 4-Digit PIN
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 1234"
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enablePin"
                    checked={enablePrivatePin}
                    onChange={(e) => setEnablePrivatePin(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="enablePin" className="text-xs text-white/80 cursor-pointer">
                    Require PIN to login (protects learner progress from others on this device)
                  </label>
                </div>

                {editSuccessMsg && (
                  <p className="text-xs text-emerald-400 font-bold">{editSuccessMsg}</p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteProfile}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Profile</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
