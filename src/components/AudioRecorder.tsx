/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, RefreshCw, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { playSound } from "../utils/audioSynth";

interface AudioRecorderProps {
  expectedText?: string;
  onRecordComplete?: (audioUrl: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  expectedText = "Hello",
  onRecordComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playbackActive, setPlaybackActive] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop tracking canvas transitions when destroyed
  useEffect(() => {
    return () => {
      stopVisualizer();
      cleanupMedia();
    };
  }, []);

  const cleanupMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    playSound.playClick();
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onRecordComplete) onRecordComplete(url);
        playSound.playSuccess();
      };

      // Set up simple canvas visualizer
      setupVisualizer(stream);

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn("Mirophone authorization denied", err);
      alert(
        "This app needs microphone access for speaking practice. Please click Allow in the browser prompt!"
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopVisualizer();
      cleanupMedia();
    }
  };

  const playRecordedAudio = () => {
    if (!audioUrl) return;
    playSound.playTing();
    setPlaybackActive(true);
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      setPlaybackActive(false);
    };
    audio.play();
  };

  const setupVisualizer = (stream: MediaStream) => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const draw = () => {
      if (!ctx || !canvas) return;
      const width = canvas.width;
      const height = canvas.height;

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      // Design: Bright neon purple or pastel sky color visual representation
      ctx.fillStyle = "#FAF5FF"; // soft baby purple
      ctx.fillRect(0, 0, width, height);

      // Outer border circle
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#E9D5FF";
      ctx.strokeRect(0, 0, width, height);

      ctx.lineWidth = 4;
      ctx.strokeStyle = "#A855F7"; // purple neon kids
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };

    draw();
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center bg-amber-50 rounded-2xl p-6 border-4 border-dashed border-amber-300 shadow-inner max-w-md w-full mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
        <h4 className="font-sans font-bold text-amber-900 text-lg">Speak English Practice</h4>
      </div>
      <p className="text-sm text-amber-700 text-center mb-4">
        Read out loud: <span className="font-bold text-purple-600 bg-white px-2 py-0.5 rounded shadow-sm">"{expectedText}"</span>
      </p>

      {/* Visual Canvas Area */}
      <div className="relative w-full h-24 mb-4 rounded-xl overflow-hidden shadow-md bg-white">
        <canvas
          ref={canvasRef}
          width={320}
          height={96}
          className="w-full h-full block"
        />
        {!isRecording && !audioUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-purple-400 font-mono">
            Press the red button to record!
          </div>
        )}
        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-sans font-bold px-2 py-0.5 rounded-full animate-pulse">
            <span className="h-2 w-2 rounded-full bg-white block"></span>
            * RECORDING *
          </div>
        )}
      </div>

      {/* Interactive Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={startRecording}
            className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg cursor-pointer border-2 border-white"
            title="Start recording"
          >
            <Mic className="h-7 w-7" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={stopRecording}
            className="h-14 w-14 rounded-full bg-gray-800 flex items-center justify-center text-white shadow-lg cursor-pointer animate-pulse border-2 border-white"
            title="Stop recording"
          >
            <Square className="h-6 w-6" />
          </motion.button>
        )}

        {audioUrl && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={playRecordedAudio}
            className={`h-12 w-12 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white transition-colors duration-200 ${
              playbackActive
                ? "bg-purple-600 animate-spin"
                : "bg-purple-500 hover:bg-purple-600"
            }`}
            title="Play recording"
          >
            <Play className="h-5 w-5" />
          </motion.button>
        )}

        {audioUrl && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={startRecording}
            className="h-10 w-10 rounded-full bg-blue-400 hover:bg-blue-500 flex items-center justify-center text-white shadow-md border-2 border-white"
            title="Retry"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {audioUrl && (
        <p className="text-xs text-green-600 font-bold mt-3 animate-bounce">
          🎉 Great job! Listen to your pronunciation!
        </p>
      )}
    </div>
  );
};
