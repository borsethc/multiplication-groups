"use client";

import { Volume2, VolumeX, Mic, MicOff, HelpCircle, Sliders, Sparkles } from "lucide-react";

interface NavbarProps {
  factorA: number;
  factorB: number;
  isMuted: boolean;
  onToggleMute: () => void;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  onOpenSelector: () => void;
  onOpenInstructions: () => void;
}

export function Navbar({
  factorA,
  factorB,
  isMuted,
  onToggleMute,
  speechEnabled,
  onToggleSpeech,
  onOpenSelector,
  onOpenInstructions,
}: NavbarProps) {
  return (
    <header className="w-full flex items-center justify-between py-3 px-4 sm:px-8 border-b border-white/5 bg-[#090a0f]/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-cyan-500/20">
          ×
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg sm:text-xl tracking-tight text-white">
              ChadMath
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Groups
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-white/40 hidden sm:block">
            Visual Grouping & Token Mastery
          </p>
        </div>
      </div>

      {/* Center Fact Tag */}
      <button
        onClick={onOpenSelector}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all shadow-sm group"
        title="Change Math Fact"
      >
        <Sliders className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
        <span className="text-xs sm:text-sm font-bold">
          Fact: <span className="text-cyan-400">{factorA}</span> × <span className="text-purple-400">{factorB}</span>
        </span>
      </button>

      {/* Audio & Settings Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Sound toggle */}
        <button
          onClick={onToggleMute}
          className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
            isMuted
              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
              : "bg-white/5 hover:bg-white/10 border-white/10 text-white/80 hover:text-white"
          }`}
          title={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Speech toggle */}
        <button
          onClick={onToggleSpeech}
          className={`p-2 sm:p-2.5 rounded-xl border transition-colors ${
            !speechEnabled
              ? "bg-white/5 border-white/10 text-white/40"
              : "bg-purple-500/10 border-purple-500/30 text-purple-300"
          }`}
          title={speechEnabled ? "Voice narration ON" : "Voice narration OFF"}
        >
          {speechEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Instructions */}
        <button
          onClick={onOpenInstructions}
          className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
          title="How it works"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
        </button>
      </div>
    </header>
  );
}
