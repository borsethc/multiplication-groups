"use client";

import { motion } from "framer-motion";
import { Delete, Check } from "lucide-react";

interface NumpadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  onKeyPressSound?: () => void;
}

export function Numpad({
  value,
  onChange,
  onSubmit,
  disabled = false,
  onKeyPressSound,
}: NumpadProps) {
  const handleDigit = (digit: string) => {
    if (disabled) return;
    if (value.length >= 4) return;
    onKeyPressSound?.();
    onChange(value + digit);
  };

  const handleDelete = () => {
    if (disabled || value.length === 0) return;
    onKeyPressSound?.();
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled) return;
    onKeyPressSound?.();
    onChange("");
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["C", "0", "del"],
  ];

  return (
    <div className="w-full max-w-[210px] flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-xl shrink-0">
      <div className="grid grid-cols-3 gap-1 w-full">
        {keys.flat().map((key) => {
          if (key === "del") {
            return (
              <motion.button
                key="del"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                disabled={disabled || value.length === 0}
                className="h-8 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/70 hover:text-white border border-white/10 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Delete"
              >
                <Delete className="w-3.5 h-3.5" />
              </motion.button>
            );
          }

          if (key === "C") {
            return (
              <motion.button
                key="clear"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClear}
                disabled={disabled || value.length === 0}
                className="h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 font-bold text-xs flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Clear"
              >
                C
              </motion.button>
            );
          }

          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDigit(key)}
              disabled={disabled}
              className="h-8 rounded-lg bg-white/5 hover:bg-cyan-500/20 active:bg-cyan-500/30 text-white hover:text-cyan-300 font-black text-sm border border-white/10 hover:border-cyan-500/40 flex items-center justify-center transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {key}
            </motion.button>
          );
        })}
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onSubmit}
        disabled={disabled || value.length === 0}
        className="w-full h-8 mt-0.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
      >
        <Check className="w-3.5 h-3.5 stroke-[3]" />
        Submit Answer
      </motion.button>
    </div>
  );
}
