/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import { playSound } from "../utils/audioSynth";

let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

interface SoundButtonProps {
  text: string;
  slow?: boolean; // Slower pronunciation rate for preschool
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

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound.playTing();

    if ("speechSynthesis" in window) {
      // Cancel active speech to avoid overlaps
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      
      // Get all voices
      const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
      
      const englishVoices = voices.filter(v => {
        const lang = v.lang.toLowerCase().replace("_", "-");
        return lang.startsWith("en");
      });

      // 0. ABSOLUTE TOP PRIORITY: Search specifically for premium natural voices requested by user (Autonoe, Leda)
      let femaleNativeUSVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        return name.includes("autonoe") || name.includes("leda");
      });

      // 1. Try to find extreme high quality Neural / Natural / Online / Premium female US English voice
      if (!femaleNativeUSVoice) {
        femaleNativeUSVoice = englishVoices.find(v => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase().replace("_", "-");
          const isUS = lang === "en-us";
          const isExpressive = name.includes("natural") || name.includes("neural") || name.includes("online") || name.includes("premium") || name.includes("journey") || name.includes("wavenet") || name.includes("expressive") || name.includes("studio");
          const isFemale = name.includes("aria") || name.includes("samantha") || name.includes("zira") || name.includes("siri") || name.includes("female") || name.includes("google us english") || name.includes("jenny") || name.includes("sara");
          return isUS && isExpressive && isFemale;
        });
      }

      // 2. Try to find general high quality Neural / Natural / Online / Premium English voices (e.g. UK, Australia)
      if (!femaleNativeUSVoice) {
        femaleNativeUSVoice = englishVoices.find(v => {
          const name = v.name.toLowerCase();
          const isExpressive = name.includes("natural") || name.includes("neural") || name.includes("online") || name.includes("premium") || name.includes("journey") || name.includes("wavenet") || name.includes("expressive") || name.includes("studio");
          const isFemale = name.includes("aria") || name.includes("samantha") || name.includes("karen") || name.includes("zira") || name.includes("siri") || name.includes("female") || name.includes("jenny") || name.includes("sara");
          return isExpressive && isFemale;
        });
      }

      // 3. Try to find standard high-quality female US voices (Google US English, Samantha, Zira, etc.)
      if (!femaleNativeUSVoice) {
        femaleNativeUSVoice = englishVoices.find(v => {
          const name = v.name.toLowerCase();
          const lang = v.lang.toLowerCase().replace("_", "-");
          const isUS = lang === "en-us";
          return isUS && (
            name.includes("google us english") || 
            name.includes("samantha") || 
            name.includes("zira") || 
            name.includes("siri") || 
            name.includes("female") ||
            name.includes("jenny") ||
            name.includes("sara")
          );
        });
      }

      // 4. Default to any US English voice
      if (!femaleNativeUSVoice) {
        femaleNativeUSVoice = englishVoices.find(v => {
          const lang = v.lang.toLowerCase().replace("_", "-");
          return lang === "en-us";
        });
      }

      // 5. Default to the first English voice found
      if (!femaleNativeUSVoice) {
        femaleNativeUSVoice = englishVoices[0];
      }

      if (femaleNativeUSVoice) {
        utterance.voice = femaleNativeUSVoice;
      }
      
      // Fine-tune rate and pitch for a natural, expressive, storytelling intonation for children
      utterance.rate = slow ? 0.72 : 0.85; 
      utterance.pitch = 1.12; // Friendly, engaging, expressive, and warm pitch without sounding robotic or squeaky

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support text-to-speech. Please try utilizing Google Chrome.");
    }
  };

  const btnSizes = {
    sm: "p-2 text-sm",
    md: "p-3 text-base",
    lg: "p-4 text-xl",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: [0, -2, 2, -2, 0] }}
      whileTap={{ scale: 0.9 }}
      onClick={speak}
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg hover:from-yellow-500 hover:to-amber-600 focus:outline-none transition-all duration-300 ${btnSizes[size]} ${className}`}
      title="Listen to pronunciation"
    >
      <motion.div
        animate={isPlaying ? { scale: [1, 1.2, 1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.6 }}
      >
        {isPlaying ? (
          <Volume2 className="h-5 w-5 animate-bounce" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </motion.div>
      {isPlaying && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      )}
    </motion.button>
  );
};
