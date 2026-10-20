"use client";

import { useRef, useCallback, useState, useEffect } from "react";

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Initialize Audio Context on user interaction
  const initAudio = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.35;
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;
      } else if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch((e) => console.warn("Audio resume failed", e));
      }
    } catch (e) {
      console.warn("Audio Context init failed", e);
    }
  }, []);

  const playHover = useCallback(() => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx || !masterGainRef.current) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, [initAudio, isMuted]);

  const playAddLine = useCallback(() => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx || !masterGainRef.current) return;

    // Swoosh glide sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);
  }, [initAudio, isMuted]);

  const playRemoveLine = useCallback(() => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx || !masterGainRef.current) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.14);
  }, [initAudio, isMuted]);

  const playAddToken = useCallback((slotIndex: number = 0) => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx || !masterGainRef.current) return;

    // Pop / water drop sound with pitch based on slot
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGainRef.current);

    const baseFreq = 440 + (slotIndex % 8) * 35;
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.13);
  }, [initAudio, isMuted]);

  const playCountToken = useCallback((count: number) => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx || !masterGainRef.current) return;

    // Musical scale chime: pentatonic scale ascending
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
    const freq = scale[(count - 1) % scale.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }, [initAudio, isMuted]);

  const playGroupComplete = useCallback((groupIndex: number = 0) => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx || !masterGainRef.current) return;

    // Harmonious chord chime
    const chords = [
      [523.25, 659.25, 783.99], // C major
      [587.33, 739.99, 880.00], // D major
      [659.25, 830.61, 987.77], // E major
      [698.46, 880.00, 1046.50], // F major
      [783.99, 987.77, 1174.66], // G major
    ];
    const notes = chords[groupIndex % chords.length];
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGainRef.current!);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.45);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.5);
    });
  }, [initAudio, isMuted]);

  const playFactSuccess = useCallback(() => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx || !masterGainRef.current) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(masterGainRef.current!);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.7);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.75);
    });
  }, [initAudio, isMuted]);

  const playIncorrect = useCallback(() => {
    if (isMuted) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx || !masterGainRef.current) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.23);
  }, [initAudio, isMuted]);

  // Voice narration helper using Web Speech API
  const speak = useCallback(
    (text: string) => {
      if (isMuted || !speechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis error", e);
      }
    },
    [isMuted, speechEnabled]
  );

  return {
    initAudio,
    playHover,
    playAddLine,
    playRemoveLine,
    playAddToken,
    playCountToken,
    playGroupComplete,
    playFactSuccess,
    playIncorrect,
    speak,
    isMuted,
    setIsMuted,
    speechEnabled,
    setSpeechEnabled,
  };
}
