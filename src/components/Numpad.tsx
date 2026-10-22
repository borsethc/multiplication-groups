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

  return (
    <div className="w-full shrink-0 select-none">
      {/* 1. MOBILE LAYOUT (iPhone Portrait): Ergonomic 2-row thumb bar (< 90px height) */}
      <div className="block md:hidden w-full max-w-sm mx-auto px-2 py-1">
        <div className="flex flex-col gap-1.5 bg-black/40 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl shadow-lg">
          {/* Row 1: 1 2 3 4 5 */}
          <div className="flex items-center justify-between gap-1 w-full">
            {["1", "2", "3", "4", "5"].map((num) => (
              <button
                key={num}
                onClick={() => handleDigit(num)}
                disabled={disabled}
                className="flex-1 h-9 rounded-xl bg-white/10 active:bg-cyan-500/30 text-white font-black text-base border border-white/5 flex items-center justify-center transition-all disabled:opacity-30 touch-manipulation cursor-pointer"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Row 2: 6 7 8 9 0 ⌫ ✓ */}
          <div className="flex items-center justify-between gap-1 w-full">
            {["6", "7", "8", "9", "0"].map((num) => (
              <button
                key={num}
                onClick={() => handleDigit(num)}
                disabled={disabled}
                className="flex-1 h-9 rounded-xl bg-white/10 active:bg-cyan-500/30 text-white font-black text-base border border-white/5 flex items-center justify-center transition-all disabled:opacity-30 touch-manipulation cursor-pointer"
              >
                {num}
              </button>
            ))}

            {/* Backspace */}
            <button
              onClick={handleDelete}
              disabled={disabled || value.length === 0}
              className="w-10 h-9 rounded-xl bg-white/5 active:bg-red-500/30 text-white/70 border border-white/5 flex items-center justify-center transition-all disabled:opacity-30 touch-manipulation cursor-pointer"
              title="Delete"
            >
              <Delete className="w-4 h-4" />
            </button>

            {/* Submit */}
            <button
              onClick={onSubmit}
              disabled={disabled || value.length === 0}
              className="flex-1 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 active:scale-95 text-black font-black text-xs uppercase flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 disabled:opacity-35 touch-manipulation cursor-pointer"
              title="Submit Answer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. TABLET & DESKTOP LAYOUT (iPad / Mac): Classic tactile 3x4 dial grid on side */}
      <div className="hidden md:flex flex-col items-center gap-2.5 md:gap-3 p-3.5 md:p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-3xl shadow-2xl w-full max-w-[280px] lg:max-w-[320px]">
        <div className="grid grid-cols-3 gap-2 md:gap-2.5 w-full">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.18)" }}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleDigit(key)}
              disabled={disabled}
              className="h-12 sm:h-13 md:h-14 lg:h-15 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/30 text-white hover:text-cyan-300 font-black text-xl md:text-2xl border border-white/5 flex items-center justify-center transition-all shadow-sm disabled:opacity-30 touch-manipulation cursor-pointer"
            >
              {key}
            </motion.button>
          ))}

          {/* Clear */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleClear}
            disabled={disabled || value.length === 0}
            className="h-12 sm:h-13 md:h-14 lg:h-15 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/50 hover:text-white border border-white/5 font-bold text-xs md:text-sm flex items-center justify-center transition-colors disabled:opacity-30 touch-manipulation cursor-pointer"
            title="Clear"
          >
            C
          </motion.button>

          {/* 0 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => handleDigit("0")}
            disabled={disabled}
            className="h-12 sm:h-13 md:h-14 lg:h-15 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/30 text-white hover:text-cyan-300 font-black text-xl md:text-2xl border border-white/5 flex items-center justify-center transition-all shadow-sm disabled:opacity-30 touch-manipulation cursor-pointer"
          >
            0
          </motion.button>

          {/* Delete */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleDelete}
            disabled={disabled || value.length === 0}
            className="h-12 sm:h-13 md:h-14 lg:h-15 rounded-2xl bg-white/5 hover:bg-red-500/20 active:bg-red-500/30 text-white/70 hover:text-red-400 border border-white/5 flex items-center justify-center transition-colors disabled:opacity-30 touch-manipulation cursor-pointer"
            title="Delete"
          >
            <Delete className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onSubmit}
          disabled={disabled || value.length === 0}
          className="w-full h-12 md:h-13 lg:h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-35 transition-all touch-manipulation cursor-pointer"
        >
          <Check className="w-4 h-4 md:w-5 md:h-5 stroke-[3]" />
          Submit Answer
        </motion.button>
      </div>
    </div>
  );
}
