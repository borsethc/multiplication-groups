"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#10121a] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">How Grouping Works</h2>
                <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                  Multiplication Visualized
                </p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-slate-300">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-base font-semibold text-white mb-2">
                  Take the fact: <span className="text-cyan-400 font-bold">2</span> × <span className="text-purple-400 font-bold">3</span>
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
                    <span className="text-cyan-400 font-bold text-sm block mb-1">First Number = 2</span>
                    The <strong className="text-white">number of groups</strong> (lines to draw).
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                    <span className="text-purple-400 font-bold text-sm block mb-1">Second Number = 3</span>
                    The <strong className="text-white">count per group</strong> (tokens per line).
                  </div>
                </div>
              </div>

              {/* Variable Line Lengths */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-white/10">
                <h3 className="font-bold text-white text-base mb-1 flex items-center gap-2">
                  <span>📏 Variable Line Lengths</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Notice how line lengths adapt! A line for <strong>2 tokens</strong> is compact, while a line for <strong>7 tokens</strong> is longer.
                </p>
                <div className="space-y-3 bg-black/40 p-3 rounded-xl border border-white/5">
                  <div>
                    <div className="text-[11px] text-white/60 mb-1">2 × 2 (Short lines for 2 tokens):</div>
                    <div className="w-36 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-around">
                      <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                      <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-white/60 mb-1">2 × 6 (Longer lines for 6 tokens):</div>
                    <div className="w-full max-w-xs h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-around">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-white shadow-sm" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Step Flow */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-base">Your 3 Simple Steps:</h3>
                
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-cyan-500 text-black font-black flex items-center justify-center text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Add the Lines (Groups)</h4>
                    <p className="text-xs text-slate-400">
                      Tap "+ Add Line" until you have the exact number of groups specified by the first factor.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-purple-500 text-white font-black flex items-center justify-center text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Add Tokens to Each Line</h4>
                    <p className="text-xs text-slate-400">
                      Touch each line or empty slot to place tokens until each line has the second multiple.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Touch to Count & Color Groups</h4>
                    <p className="text-xs text-slate-400">
                      Touch tokens in order. When a full group is counted, the group changes color to reveal the total product!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                Got It! Let&apos;s Build <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
