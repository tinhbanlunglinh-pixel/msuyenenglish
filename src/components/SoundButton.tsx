/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { motion } from "motion/react";

// =====================================================
// PREMIUM NATIVE FEMALE VOICE ENGINE
// Giọng nữ bản ngữ nhấn nhá ngữ điệu cực hay
// =====================================================

let cachedVoices: SpeechSynthesisVoice[] = [];
let bestFemaleVoice: SpeechSynthesisVoice | null = null;

// Voice quality scoring system - higher = better
function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase().replace("_", "-");
  let score = 0;

  // Must be English
  if (!lang.startsWith("en")) return -1;

  // US English bonus
  if (lang === "en-us") score += 20;
  // UK English also excellent
  if (lang === "en-gb") score += 15;
  // Australian English
  if (lang === "en-au") score += 12;

  // ===== PREMIUM TIER (Google's best neural voices) =====
  // Google Journey voices (most expressive, storytelling-like)
  if (name.includes("journey")) score += 200;
  // Google Studio voices (broadcast quality)
  if (name.includes("studio")) score += 180;
  // Google WaveNet voices (deep learning)
  if (name.includes("wavenet")) score += 160;
  // Google Neural2 voices
  if (name.includes("neural2") || name.includes("neural")) score += 150;
  // Google Polyglot voices
  if (name.includes("polyglot")) score += 140;

  // ===== HIGH-QUALITY TIER =====
  if (name.includes("natural")) score += 130;
  if (name.includes("premium")) score += 120;
  if (name.includes("enhanced")) score += 110;
  if (name.includes("online")) score += 100;
  if (name.includes("expressive")) score += 100;

  // ===== NAMED FEMALE VOICES (known high quality) =====
  // Microsoft Edge / Windows voices
  if (name.includes("aria")) score += 90;  // Microsoft Aria - very natural
  if (name.includes("jenny")) score += 88; // Microsoft Jenny
  if (name.includes("ana")) score += 85;
  if (name.includes("sara")) score += 83;
  if (name.includes("sonia")) score += 80; // en-GB Sonia

  // Apple voices
  if (name.includes("samantha")) score += 85;
  if (name.includes("karen")) score += 80;  // Australian
  if (name.includes("moira")) score += 78;  // Irish English

  // Google Chrome voices  
  if (name.includes("google us english")) score += 70;
  if (name.includes("google uk english female")) score += 68;
  
  // Windows built-in
  if (name.includes("zira")) score += 60;
  if (name.includes("hazel")) score += 58;
  if (name.includes("susan")) score += 55;

  // Generic female markers
  if (name.includes("female")) score += 40;
  if (name.includes("woman")) score += 35;

  // User's specifically requested voices
  if (name.includes("skye")) score += 500;
  if (name.includes("autonoe")) score += 300;
  if (name.includes("leda")) score += 300;

  // Penalize male-sounding voices
  if (name.includes("david")) score -= 50;
  if (name.includes("mark")) score -= 50;
  if (name.includes("james")) score -= 50;
  if (name.includes("guy")) score -= 50;
  if (name.includes("male") && !name.includes("female")) score -= 50;

  // Bonus for non-local (usually cloud/streamed = better quality)
  if (!v.localService) score += 30;

  return score;
}

function findBestFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;

  for (const v of voices) {
    const s = scoreVoice(v);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }

  if (best) {
    console.log(`[TTS] Selected voice: "${best.name}" (lang: ${best.lang}, score: ${bestScore}, local: ${best.localService})`);
  }
  return best;
}

// Initialize voices
function refreshVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  cachedVoices = window.speechSynthesis.getVoices();
  if (cachedVoices.length > 0) {
    bestFemaleVoice = findBestFemaleVoice(cachedVoices);
  }
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
  // Some browsers need a delay
  setTimeout(refreshVoices, 500);
  setTimeout(refreshVoices, 2000);
}

// =====================================================
// EXPRESSIVE SPEECH PARAMETERS
// Tạo ngữ điệu nhấn nhá tự nhiên cho từng loại nội dung
// =====================================================
interface SpeechConfig {
  rate: number;
  pitch: number;
  volume: number;
}

function getExpressiveConfig(text: string, slow: boolean): SpeechConfig {
  const wordCount = text.trim().split(/\s+/).length;
  const isSingleWord = wordCount <= 2;
  const isShortSentence = wordCount <= 5;

  if (isSingleWord) {
    // Single word: Speak clearly, slightly slower, with warm pitch
    return {
      rate: slow ? 0.6 : 0.85,
      pitch: 1.4,   // Youthful, energetic, high pitch
      volume: 1.0,
    };
  } else if (isShortSentence) {
    // Short sentence (Pre-starters/Starters): Clear, playful, engaging
    return {
      rate: slow ? 0.65 : 0.9,
      pitch: 1.35,   // Playful and energetic
      volume: 1.0,
    };
  } else {
    // Longer sentence (Movers/Flyers): Natural flow with good rhythm
    return {
      rate: slow ? 0.7 : 0.95,
      pitch: 1.25,   // Expressive and young
      volume: 1.0,
    };
  }
}

// Safeguard to strip any Vietnamese characters or translations from the speech text
function cleanSpeechText(text: string): string {
  const vnChars = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i;
  
  if (vnChars.test(text)) {
    const separators = [" - ", " – ", " : ", " / ", " (", "=>"];
    for (const sep of separators) {
      const idx = text.indexOf(sep);
      if (idx !== -1) {
        return text.substring(0, idx).trim();
      }
    }
    
    // If it contains Vietnamese and has no standard separators, strip any Vietnamese-looking words
    // to protect against reading Vietnamese.
    return text.replace(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ\w]*[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ\w]*/gi, "").trim();
  }
  return text;
}

// =====================================================
// COMPONENT
// =====================================================
interface SoundButtonProps {
  text: string;
  slow?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SoundButton: React.FC<SoundButtonProps> = ({
  text,
  slow = false,
  className = "",
  size = "md",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (!("speechSynthesis" in window)) {
      alert("Trình duyệt chưa hỗ trợ phát âm. Hãy dùng Google Chrome nhé!");
      return;
    }

    // If already playing, stop
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();

    // Chrome bug workaround: resume synthesis if paused
    window.speechSynthesis.resume();

    // Re-check voices (some browsers lazy-load)
    if (!bestFemaleVoice) {
      refreshVoices();
    }

    const cleanedText = cleanSpeechText(text);
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = "en-US";
    utteranceRef.current = utterance;

    // Apply best voice
    if (bestFemaleVoice) {
      utterance.voice = bestFemaleVoice;
    }

    // Apply expressive speech parameters
    const config = getExpressiveConfig(cleanedText, slow);
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    // Chrome bug: long utterances stop mid-speech. Workaround: periodic resume.
    const resumeInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(resumeInterval);
        return;
      }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 10000);

    utterance.onend = () => {
      clearInterval(resumeInterval);
      setIsPlaying(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      clearInterval(resumeInterval);
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  }, [text, slow, isPlaying]);

  const btnSizes = {
    sm: "p-1.5",
    md: "p-3",
    lg: "p-4",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: [0, -3, 3, -3, 0] }}
      whileTap={{ scale: 0.88 }}
      onClick={speak}
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400 text-white shadow-lg hover:shadow-xl hover:from-orange-500 hover:via-amber-600 hover:to-yellow-500 focus:outline-none transition-all duration-300 cursor-pointer ${btnSizes[size]} ${className}`}
      title="Listen to pronunciation 🔊"
      aria-label={`Listen to: ${text}`}
    >
      <motion.div
        animate={isPlaying ? { 
          scale: [1, 1.25, 1, 1.25, 1],
          rotate: [0, -5, 5, -5, 0] 
        } : {}}
        transition={{ repeat: Infinity, duration: 0.7 }}
      >
        <Volume2 className={`${iconSizes[size]} ${isPlaying ? "animate-pulse" : ""}`} />
      </motion.div>

      {/* Active playback indicator */}
      {isPlaying && (
        <>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          {/* Sound wave rings */}
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-white/20"
            animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
          />
        </>
      )}
    </motion.button>
  );
};
