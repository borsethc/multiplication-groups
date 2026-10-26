"use client";

import { motion } from "framer-motion";
import { X, ArrowLeft, Eye, Type, Sun, Sparkles } from "lucide-react";

export interface AccessibilitySettings {
  fontSize: "normal" | "large";
  highContrast: boolean;
  colorBlindSafe: boolean;
  dyslexiaFont: boolean;
}

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: AccessibilitySettings) => void;
}

export function AccessibilityModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: AccessibilityModalProps) {
  if (!isOpen) return null;

  const toggle = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#0c0e17] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col text-white gap-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Accessibility & Display</h2>
              <p className="text-[11px] text-white/50">Personalize contrast and text size</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-colors cursor-pointer"
              title="Return to Main Menu"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>Main Menu</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3.5 py-1 text-xs sm:text-sm">
          {/* Font Size */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2.5">
              <Type className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-bold block text-white">Font Size</span>
                <span className="text-[10px] text-white/50">Enlarge equation numbers and instructions</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => toggle("fontSize", "normal")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settings.fontSize === "normal" ? "bg-cyan-500 text-black shadow-sm" : "text-white/60 hover:text-white"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => toggle("fontSize", "large")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  settings.fontSize === "large" ? "bg-cyan-500 text-black shadow-sm" : "text-white/60 hover:text-white"
                }`}
              >
                Large (+20%)
              </button>
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold block text-white">High Contrast</span>
                <span className="text-[10px] text-white/50">Bold borders & vivid text for easier reading</span>
              </div>
            </div>
            <button
              onClick={() => toggle("highContrast", !settings.highContrast)}
              className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
                settings.highContrast ? "bg-amber-400 justify-end" : "bg-white/20 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-black shadow-sm" />
            </button>
          </div>

          {/* Color-Blind Safe Palette */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="font-bold block text-white">Color-Blind Safe Palette</span>
                <span className="text-[10px] text-white/50">High-differentiation blue & orange patterns</span>
              </div>
            </div>
            <button
              onClick={() => toggle("colorBlindSafe", !settings.colorBlindSafe)}
              className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
                settings.colorBlindSafe ? "bg-indigo-500 justify-end" : "bg-white/20 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>

          {/* Dyslexia-Friendly Font */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="font-serif font-black text-xs text-emerald-400">Aa</span>
              <div>
                <span className="font-bold block text-white">Dyslexia-Friendly Spacing</span>
                <span className="text-[10px] text-white/50">Enhanced letter spacing and weighted bottoms</span>
              </div>
            </div>
            <button
              onClick={() => toggle("dyslexiaFont", !settings.dyslexiaFont)}
              className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
                settings.dyslexiaFont ? "bg-emerald-500 justify-end" : "bg-white/20 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-black shadow-sm" />
            </button>
          </div>
        </div>

        {/* Done */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-sm transition-all cursor-pointer mt-1"
        >
          Save & Apply
        </button>
      </motion.div>
    </div>
  );
}
