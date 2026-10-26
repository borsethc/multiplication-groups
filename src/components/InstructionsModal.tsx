"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

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
            <div className="absolute top-5 right-5 flex items-center gap-1.5">
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
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  Take the fact: <span className="text-cyan-400 font-bold">2</span> × <span className="text-purple-400 font-bold">3</span> = <span className="text-amber-400 font-bold">6</span>
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-2.5">
                    <span className="text-cyan-400 font-bold text-xs block mb-1">1st Factor (2)</span>
                    <strong className="text-white">Groups</strong> (lines to draw).
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5">
                    <span className="text-purple-400 font-bold text-xs block mb-1">2nd Factor (3)</span>
                    <strong className="text-white">Items</strong> on each line.
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                    <span className="text-amber-400 font-bold text-xs block mb-1">Product (6)</span>
                    <strong className="text-white">Answer</strong> (the product).
                  </div>
                </div>
              </div>

              {/* Step Flow */}
              <div className="space-y-2.5">
                <h3 className="font-bold text-white text-base">Mastery Steps:</h3>
                
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-black font-black flex items-center justify-center text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">How Many Groups? (1st Factor)</h4>
                    <p className="text-xs text-slate-400">
                      Look at the 1st Factor to see how many groups you need. Add groups by drawing horizontal lines with your finger!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-purple-500 text-white font-black flex items-center justify-center text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Place Items for 2nd Factor</h4>
                    <p className="text-xs text-slate-400">
                      Tap each line to place the number of items specified by the 2nd Factor.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Spot the Pattern!</h4>
                    <p className="text-xs text-slate-400">
                      Notice the repeated addition pattern (e.g. 4 + 4 + 4). Can you find the Product before counting?
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Count Dots or Enter Product</h4>
                    <p className="text-xs text-slate-400">
                      Tap dots to count aloud, or enter the Product directly on the numpad at any time.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                Got It! Let&apos;s Solve <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
