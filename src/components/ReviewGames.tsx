/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Star, ArrowRight, CheckCircle2, Trophy, HelpCircle, Heart, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VocabularyItem, ReviewGameType } from "../types";
import { SoundButton } from "./SoundButton";
import { playSound } from "../utils/audioSynth";

interface ReviewGamesProps {
  words: VocabularyItem[];
  onFinishAll: (starsEarned: number) => void;
  onExit: () => void;
  onEarnStars?: (starsEarned: number) => void;
}

export const ReviewGames: React.FC<ReviewGamesProps> = ({
  words,
  onFinishAll,
  onExit,
  onEarnStars,
}) => {
  const [currentGameType, setCurrentGameType] = useState<ReviewGameType>("listen_match");
  const [gameIndex, setGameIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [correctGamesCount, setCorrectGamesCount] = useState(0);
  const [failedCurrentGame, setFailedCurrentGame] = useState(false);
  const TOTAL_GAMES = 5;
  const [gameCompleted, setGameCompleted] = useState(false);
  const [lives, setLives] = useState(3);

  // States for individual games
  const [shuffledOptions, setShuffledOptions] = useState<VocabularyItem[]>([]);
  const [targetWord, setTargetWord] = useState<VocabularyItem | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Match meaning game states
  const [selectedEnglish, setSelectedEnglish] = useState<string | null>(null);
  const [selectedVietnamese, setSelectedVietnamese] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // list of English words matched
  const [vocabShuffledEnglish, setVocabShuffledEnglish] = useState<VocabularyItem[]>([]);
  const [vocabShuffledVietnamese, setVocabShuffledVietnamese] = useState<VocabularyItem[]>([]);

  // Arrange sentence game states
  const [sentenceWords, setSentenceWords] = useState<{ id: string; word: string; used: boolean }[]>([]);
  const [assembledSentence, setAssembledSentence] = useState<string[]>([]);

  // Balloon popping game states
  const [balloons, setBalloons] = useState<{ id: string; emoji: string; word: string; color: string; popped: boolean; x: number; y: number; speed: number }[]>([]);
  const [balloonTarget, setBalloonTarget] = useState<VocabularyItem | null>(null);

  const [gameOrder, setGameOrder] = useState<ReviewGameType[]>([]);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const genericEmojis = ["✨", "🌟", "💫", "⭐", "🎯", "🧩", "💡", "🔔", "🎵", "🎶", "💮", "💠", "🌈", "💎", "🔮", "🪄", "🏆", "🏅", "🎨", "🎈", "🎉", "🎊", "🎀", "🎁", "🧸"];
    const validLookWords = words.filter(w => !genericEmojis.includes(w.illustration));
    const validMeaningWords = words.filter(w => w.word.toLowerCase() !== w.translation.toLowerCase());
    
    const types: ReviewGameType[] = ["listen_match", "balloon_pop", "arrange_sentence"];
    if (validLookWords.length > 0) types.push("look_match");
    if (validMeaningWords.length >= 2) types.push("match_meaning");

    const generatedOrder: ReviewGameType[] = [];
    for (let i = 0; i < 30; i++) {
      generatedOrder.push(types[i % types.length]);
    }
    const finalOrder = generatedOrder.sort(() => 0.5 - Math.random());
    
    setGameOrder(finalOrder);
    setGameIndex(0);
    setCurrentGameType(finalOrder[0]);
  }, [words]);

  useEffect(() => {
    initCurrentGame();
    setFeedback(null);
    setSelectedAnswer(null);
  }, [currentGameType, words]);

  const initCurrentGame = () => {
    if (!words || words.length === 0) return;
    const genericEmojis = ["✨", "🌟", "💫", "⭐", "🎯", "🧩", "💡", "🔔", "🎵", "🎶", "💮", "💠", "🌈", "💎", "🔮", "🪄", "🏆", "🏅", "🎨", "🎈", "🎉", "🎊", "🎀", "🎁", "🧸"];

    if (currentGameType === "listen_match" || currentGameType === "look_match") {
      let validTargets = words;
      if (currentGameType === "look_match") {
        validTargets = words.filter(w => !genericEmojis.includes(w.illustration));
        if (validTargets.length === 0) {
          setCurrentGameType("listen_match");
          return;
        }
      }

      // Pick a random target word from valid targets
      const target = validTargets[Math.floor(Math.random() * validTargets.length)];
      setTargetWord(target);

      // Generate 3 unique alternatives
      const pool = words.filter((w) => w.id !== target.id);
      const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
      
      const options = [target, ...shuffledPool.slice(0, 3)].sort(() => 0.5 - Math.random());
      setShuffledOptions(options);
    } 
    else if (currentGameType === "match_meaning") {
      const validMeaningWords = words.filter(w => w.word.toLowerCase() !== w.translation.toLowerCase());
      if (validMeaningWords.length < 2) {
        setCurrentGameType("listen_match");
        return;
      }
      // Pick up to 5 words to match
      const subset = [...validMeaningWords].sort(() => 0.5 - Math.random()).slice(0, 5);
      setVocabShuffledEnglish([...subset].sort(() => 0.5 - Math.random()));
      setVocabShuffledVietnamese([...subset].sort(() => 0.5 - Math.random()));
      setMatchedPairs([]);
      setSelectedEnglish(null);
      setSelectedVietnamese(null);
    } 
    else if (currentGameType === "arrange_sentence") {
      // Choose word with basic sample sentence
      const target = words[Math.floor(Math.random() * words.length)];
      setTargetWord(target);
      
      const cleanWords = target.sentence
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(" ");
      
      const parts = cleanWords.map((word, idx) => ({
        id: `pw-${idx}-${Math.random()}`,
        word,
        used: false,
      }));
      
      setSentenceWords([...parts].sort(() => 0.5 - Math.random()));
      setAssembledSentence([]);
    } 
    else if (currentGameType === "balloon_pop") {
      // Pick up to 6 random words, making sure target is in them
      const shuffled = [...words].sort(() => 0.5 - Math.random());
      const selectedWords = shuffled.slice(0, Math.min(6, words.length));
      
      // Target word to pop
      const target = selectedWords[Math.floor(Math.random() * selectedWords.length)];
      setBalloonTarget(target);

      const colors = ["bg-rose-400", "bg-sky-400", "bg-emerald-400", "bg-amber-400", "bg-purple-400", "bg-orange-400"];
      
      // Make distinct balloon objects floating
      const list = selectedWords.map((w, idx) => ({
        id: `bal-${idx}-${w.id}`,
        emoji: w.illustration,
        word: w.word,
        color: colors[idx % colors.length],
        popped: false,
        x: 10 + (idx * (80 / Math.max(1, selectedWords.length - 1))), // distribute evenly from 10% to 90%
        y: 60 + (idx % 2) * 20, // offset heights
        speed: 1 + Math.random() * 1.5,
      }));
      
      setBalloons(list);
    }
  };

  // Generic Choice Handlers
  const handleChoiceSelect = (item: VocabularyItem) => {
    if (feedback !== null) return;
    setSelectedAnswer(item.word);

    if (item.id === targetWord?.id) {
      playSound.playSuccess();
      setFeedback("correct");
      if (!failedCurrentGame) setCorrectGamesCount(v => v + 1);
      setStars((val) => val + 10);
      if (onEarnStars) onEarnStars(10);
    } else {
      playSound.playFail();
      setFeedback("wrong");
      setFailedCurrentGame(true);
    }
  };

  // Match meaning interactions
  const handleEnglishClick = (word: string) => {
    playSound.playTing();
    if (selectedEnglish === word) {
      setSelectedEnglish(null);
      return;
    }
    setSelectedEnglish(word);
    checkMatch(word, selectedVietnamese);
  };

  const handleVietnameseClick = (translation: string) => {
    playSound.playTing();
    if (selectedVietnamese === translation) {
      setSelectedVietnamese(null);
      return;
    }
    setSelectedVietnamese(translation);
    checkMatch(selectedEnglish, translation);
  };

  const checkMatch = (eng: string | null, vie: string | null) => {
    if (!eng || !vie) return;

    // Find if the english matches the vietnamese
    const matchedWord = words.find((w) => w.word === eng && w.translation === vie);
    if (matchedWord) {
      playSound.playSuccess();
      setMatchedPairs((arr) => [...arr, eng]);
      setStars((val) => val + 5);
      if (onEarnStars) onEarnStars(5);
      setSelectedEnglish(null);
      setSelectedVietnamese(null);

      // Check if all matched
      const subsetLength = Math.min(4, words.length);
      if (matchedPairs.length + 1 >= subsetLength) {
        setFeedback("correct");
        if (!failedCurrentGame) setCorrectGamesCount(v => v + 1);
        setStars((val) => val + 15);
        if (onEarnStars) onEarnStars(15);
      }
    } else {
      playSound.playFail();
      setSelectedEnglish(null);
      setSelectedVietnamese(null);
      setFailedCurrentGame(true);
    }
  };

  // Arrange sentence interactions
  const selectSentenceWord = (wordObj: { id: string; word: string; used: boolean }) => {
    if (feedback !== null) return;
    playSound.playTing();

    // Toggle
    setSentenceWords((arr) =>
      arr.map((item) => (item.id === wordObj.id ? { ...item, used: true } : item))
    );
    setAssembledSentence((arr) => [...arr, wordObj.word]);
  };

  const removeAssembledWord = (word: string, index: number) => {
    if (feedback !== null) return;
    playSound.playClick();

    // Remove from assembled
    const updated = [...assembledSentence];
    updated.splice(index, 1);
    setAssembledSentence(updated);

    // Free back to pool (find the first matching word marked used and unuse it)
    let found = false;
    setSentenceWords((arr) =>
      arr.map((item) => {
        if (!found && item.word === word && item.used) {
          found = true;
          return { ...item, used: false };
        }
        return item;
      })
    );
  };

  const checkSentenceSubmit = () => {
    if (!targetWord) return;
    
    const assembledText = assembledSentence.join(" ").toLowerCase();
    const originalText = targetWord.sentence
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (assembledText === originalText) {
      playSound.playSuccess();
      setFeedback("correct");
      setStars((val) => val + 15);
      if (onEarnStars) onEarnStars(15);
    } else {
      playSound.playFail();
      setFeedback("wrong");
      setFailedCurrentGame(true);
    }
  };

  // Pop balloons trigger
  const handlePopBalloon = (balloon: typeof balloons[0]) => {
    if (feedback !== null || balloon.popped) return;
    playSound.playPop();

    setBalloons((arr) =>
      arr.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b))
    );

    if (balloon.word === balloonTarget?.word) {
      playSound.playSuccess();
      setFeedback("correct");
      setStars((val) => val + 20);
      if (onEarnStars) onEarnStars(20);
    } else {
      playSound.playFail();
      setFailedCurrentGame(true);
      // Float it again
      setTimeout(() => {
        setBalloons((arr) =>
          arr.map((b) => (b.id === balloon.id ? { ...b, popped: false } : b))
        );
      }, 1000);
    }
  };

  // Skip / Continue handlers
  const handleNextGame = () => {
    const nextIdx = gameIndex + 1;
    if (nextIdx < gameOrder.length) {
      setGameIndex(nextIdx);
      setCurrentGameType(gameOrder[nextIdx]);
    } else {
      playSound.playFanfare();
      setGameCompleted(true);
      if (onEarnStars) {
        onEarnStars(stars);
      }
    }
  };

  const handleRestart = () => {
    setCorrectGamesCount(0);
    setFailedCurrentGame(false);
    setStars(0);
    setGameIndex(0);
    setGameCompleted(false);
    setCurrentGameType("listen_match");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-gradient-to-b from-sky-100 to-green-50 rounded-3xl border-8 border-yellow-200 shadow-2xl overflow-hidden">
      
      {/* Game Head Status Pane */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white shrink-0 rounded-2xl p-4 border-4 border-dashed border-sky-200">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎮</span>
          <div>
            <h3 className="font-sans font-black text-sky-800 text-lg md:text-xl">
              {currentGameType === "listen_match" && "1. Nghe & Chọn Hình (Listen & Match) 🎧"}
              {currentGameType === "look_match" && "2. Nhìn Hình Đoán Từ (Look & Guess) 🎨"}
              {currentGameType === "match_meaning" && "3. Ghép Cặp Từ Vựng (Match Meaning) 🧩"}
              {currentGameType === "arrange_sentence" && "4. Xếp Câu Tiếng Anh (Sentence Builder) 🔠"}
              {currentGameType === "balloon_pop" && "5. Bắn Bóng Bay (Balloon Pop) 🎈"}
            </h3>
            <p className="text-xs text-sky-500 font-sans font-bold uppercase tracking-wider">
              Thử Thách Luyện Tập {gameIndex + 1} / {gameOrder.length}
            </p>
          </div>
        </div>

        {/* Level Stats Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1.5 rounded-full border-2 border-yellow-300">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 animate-pulse" />
            <span className="font-mono font-black text-yellow-700">{stars}</span>
          </div>

          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className={`h-6 w-6 transition-all duration-300 ${
                  i < lives
                    ? "text-rose-500 fill-rose-500 scale-100"
                    : "text-gray-300 fill-gray-200 scale-75"
                }`}
              />
            ))}
          </div>

          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-full bg-red-100 text-red-600 font-sans font-bold text-xs hover:bg-red-200 cursor-pointer"
          >
            Quay Lại Dashboard 🏠
          </button>
        </div>
      </div>

      {gameCompleted ? (
        // Spectacular Game Completion Screen with Clear Back Button
        <div className="text-center py-10 flex flex-col items-center justify-center min-h-[380px] bg-white rounded-3xl p-6 border-4 border-yellow-300 shadow-inner">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.8 }}
            className="text-8xl mb-4"
          >
            👑
          </motion.div>
          
          <h4 className="font-sans font-black text-emerald-600 text-2xl md:text-3xl mb-3">
            BÉ HOÀN THÀNH XUẤT SẮC! 🎉
          </h4>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm md:text-base font-medium">
            Con đã cực kỳ thông minh vượt qua cả 5 thử thách luyện tập tiếng Anh đầy xuất sắc! Cô Thảo khen ngợi bé nhiều nhé! 💕
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-yellow-50 border-2 border-yellow-200 p-4 rounded-2xl mb-8 max-w-sm w-full shadow-inner animate-bounce">
            <span className="text-4xl">🌟</span>
            <div className="text-left">
              <h5 className="font-sans font-black text-amber-900 text-sm leading-none">PHẦN THƯỞNG CỦA BÉ</h5>
              <p className="text-xs text-amber-700 font-extrabold mt-1">Bé nhận được {stars} Sao Vàng danh giá!</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 rounded-full bg-slate-100 text-slate-600 font-sans font-black text-sm hover:bg-slate-200 cursor-pointer flex items-center gap-2 transition"
            >
              <RotateCcw className="h-4 w-4" /> Chơi Lại Lượt Mới
            </button>
            
            <button
              onClick={() => onFinishAll(stars)}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 border-b-4 border-amber-700 text-white font-sans font-black text-sm md:text-base shadow-lg cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95 duration-100"
            >
              Quay Lại Học Tiếp 🏠
            </button>
          </div>
        </div>
      ) : (
        <div className="relative min-h-[380px] bg-white rounded-3xl p-6 border-4 border-sky-100 flex flex-col justify-between">
          
          {/* Game Modules Rendering */}
          <div className="flex-1 w-full">
            
            {/* GAME 1: LISTEN MATCH */}
            {currentGameType === "listen_match" && targetWord && (
              <div className="text-center">
                <p className="text-sky-600 font-bold mb-4">
                  Bấm vào loa để nghe và chọn hình ảnh đúng nhé! (Click to listen & choose)
                </p>
                <div className="flex justify-center mb-6">
                  <SoundButton text={targetWord.word} size="lg" slow />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {shuffledOptions.map((item) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={item.id}
                      onClick={() => handleChoiceSelect(item)}
                      disabled={feedback !== null}
                      className={`relative aspect-square flex flex-col items-center justify-center p-3 rounded-2xl border-4 transition-all duration-300 cursor-pointer ${
                        selectedAnswer === item.word
                          ? item.id === targetWord.id
                            ? "bg-green-100 border-green-500"
                            : "bg-red-100 border-red-500"
                          : "bg-amber-50 border-amber-200 hover:bg-amber-100"
                      }`}
                    >
                      <span className="text-5xl md:text-6xl mb-1">{item.illustration}</span>
                      <span className="font-sans font-black text-indigo-900 text-xs sm:text-sm text-center line-clamp-2 leading-tight">
                        {item.word}
                      </span>
                      {feedback !== null && (
                        <span className="font-sans font-medium text-slate-500 text-[10px] sm:text-xs text-center line-clamp-1 mt-0.5">
                          {item.translation}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* GAME 2: LOOK MATCH */}
            {currentGameType === "look_match" && targetWord && (
              <div className="text-center">
                <p className="text-sky-600 font-bold mb-4">
                  Đây là gì nhỉ? Hãy chọn từ tiếng Anh tương ứng! (What is this?)
                </p>
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-8xl md:text-9xl p-4 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full shadow-inner border-2 border-yellow-200"
                  >
                    {targetWord.illustration}
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                  {shuffledOptions.map((item) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={item.id}
                      onClick={() => handleChoiceSelect(item)}
                      disabled={feedback !== null}
                      className={`py-4 px-6 rounded-2xl border-4 font-sans font-black text-lg md:text-xl transition-all duration-300 cursor-pointer ${
                        selectedAnswer === item.word
                          ? item.id === targetWord.id
                            ? "bg-green-100 border-green-500 text-green-700"
                            : "bg-red-100 border-red-500 text-red-700"
                          : "bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-700"
                      }`}
                    >
                      {item.word}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* GAME 3: MATCH MEANING */}
            {currentGameType === "match_meaning" && (
              <div className="text-center">
                <p className="text-sky-600 font-bold mb-6">
                  Ghép từ tiếng Anh với nghĩa đúng của chúng! (Match words with meanings!)
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-8 max-w-2xl mx-auto">
                  {/* English Column */}
                  <div className="flex flex-col gap-2.5">
                    <h5 className="font-sans font-bold text-purple-600 text-xs sm:text-sm mb-2 uppercase tracking-wide">English Word</h5>
                    {vocabShuffledEnglish.map((item) => {
                      const isMatched = matchedPairs.includes(item.word);
                      const isSelected = selectedEnglish === item.word;
                      return (
                        <motion.button
                          whileHover={!isMatched ? { scale: 1.02 } : {}}
                          key={`eng-${item.id}`}
                          onClick={() => !isMatched && handleEnglishClick(item.word)}
                          disabled={isMatched}
                          className={`p-2 py-3 sm:p-4 rounded-xl text-center border-2 sm:border-4 font-sans font-black text-xs sm:text-sm transition-all cursor-pointer ${
                            isMatched
                              ? "bg-gray-100 border-gray-200 text-gray-400 line-through opacity-50"
                              : isSelected
                              ? "bg-purple-100 border-purple-500 text-purple-700"
                              : "bg-white border-purple-200 hover:bg-purple-50 text-purple-800"
                          }`}
                        >
                          {item.word} {isMatched && "✅"}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Meaning Column */}
                  <div className="flex flex-col gap-2.5">
                    <h5 className="font-sans font-bold text-orange-600 text-xs sm:text-sm mb-2 uppercase tracking-wide">Vietnamese Meaning</h5>
                    {vocabShuffledVietnamese.map((item) => {
                      // Check if matches
                      const isMatched = matchedPairs.includes(item.word);
                      const isSelected = selectedVietnamese === item.translation;
                      return (
                        <motion.button
                          whileHover={!isMatched ? { scale: 1.02 } : {}}
                          key={`vie-${item.id}`}
                          onClick={() => !isMatched && handleVietnameseClick(item.translation)}
                          disabled={isMatched}
                          className={`p-2 py-3 sm:p-4 rounded-xl text-center border-2 sm:border-4 font-sans font-black text-xs sm:text-sm transition-all cursor-pointer ${
                            isMatched
                              ? "bg-gray-100 border-gray-200 text-gray-400 line-through opacity-50"
                              : isSelected
                              ? "bg-orange-100 border-orange-500 text-orange-700"
                              : "bg-white border-orange-200 hover:bg-orange-50 text-orange-800"
                          }`}
                        >
                          {item.translation} {isMatched && "✅"}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* GAME 4: ARRANGE SENTENCE */}
            {currentGameType === "arrange_sentence" && targetWord && (
              <div className="text-center">
                <p className="text-sky-600 font-bold mb-2">
                  Sắp xếp các thẻ chữ để tạo thành một câu hoàn chỉnh có chứa từ{" "}
                  <span className="font-extrabold text-purple-600">"{targetWord.word}"</span>!
                </p>
                
                {/* Visual Hint */}
                <div className="bg-amber-50 p-3 rounded-xl border-2 border-amber-200 max-w-lg mx-auto mb-6 flex items-center justify-center gap-3">
                  <span className="text-4xl">{targetWord.illustration}</span>
                  <div className="text-left">
                    <p className="text-xs text-amber-600 font-bold uppercase">Hint</p>
                    <p className="font-bold text-amber-800 text-sm leading-tight">
                      {targetWord.sentenceTranslation}
                    </p>
                  </div>
                </div>

                {/* Scrambled Pool */}
                <div className="min-h-16 border-4 border-dashed border-sky-100 p-4 rounded-xl mb-4 flex flex-wrap gap-2 justify-center bg-sky-50/50">
                  {assembledSentence.map((word, index) => (
                    <motion.button
                      layoutId={`word-${word}-${index}`}
                      key={`assembled-${index}`}
                      onClick={() => removeAssembledWord(word, index)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-sans font-black rounded-lg shadow cursor-pointer hover:scale-105"
                    >
                      {word}
                    </motion.button>
                  ))}
                  {assembledSentence.length === 0 && (
                    <span className="text-sm text-gray-400 font-mono italic flex items-center">
                      (Bấm vào các từ bên dưới để xếp câu)
                    </span>
                  )}
                </div>

                {/* Source Selection Pool */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {sentenceWords.map((item) => (
                    <motion.button
                      disabled={item.used}
                      key={item.id}
                      onClick={() => selectSentenceWord(item)}
                      className={`px-4 py-2 border-2 text-md font-sans font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
                        item.used
                          ? "bg-gray-100 border-gray-200 text-gray-300 opacity-40 cursor-not-allowed"
                          : "bg-white border-purple-300 text-purple-700 hover:bg-purple-100"
                      }`}
                    >
                      {item.word}
                    </motion.button>
                  ))}
                </div>

                {assembledSentence.length > 0 && feedback === null && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={checkSentenceSubmit}
                    className="px-6 py-2 rounded-xl bg-green-500 text-white font-sans font-black shadow hover:bg-green-600 cursor-pointer"
                  >
                    Kiểm Tra Câu 🚀
                  </motion.button>
                )}
              </div>
            )}

            {/* GAME 5: BALLOON POP */}
            {currentGameType === "balloon_pop" && balloonTarget && (
              <div className="text-center relative">
                <p className="text-sky-600 font-bold mb-3">
                  Bắn quả bóng có từ mang nghĩa là:{" "}
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-sans font-black text-sm">
                    "{balloonTarget.translation}"
                  </span>
                </p>

                {/* Floating Canvas Box */}
                <div className="h-64 border-4 border-dashed border-sky-100 rounded-2xl relative overflow-hidden bg-gradient-to-b from-blue-50/30 to-sky-100/30 shadow-inner">
                  {balloons.map((balloon) => (
                    <AnimatePresence key={balloon.id}>
                      {!balloon.popped && (
                        <motion.button
                          onClick={() => handlePopBalloon(balloon)}
                          animate={{
                            y: [0, -40, 0, -20, 0],
                            x: [0, (balloon.x % 2 === 0 ? 10 : -10), 0],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 3 + balloon.speed,
                            ease: "easeInOut",
                          }}
                          style={{ left: `${balloon.x}%`, bottom: `${balloon.y}px` }}
                          className={`absolute h-18 w-18 ${balloon.color} hover:brightness-105 rounded-full flex flex-col items-center justify-center text-white font-sans font-bold shadow-lg border-b-4 border-black/20 cursor-pointer select-none`}
                        >
                          <span className="text-3xl">{balloon.emoji}</span>
                          <span className="text-[10px] bg-black/30 px-1 rounded shadow-sm">{balloon.word}</span>
                          {/* Balloon String element */}
                          <div className="absolute top-18 w-0.5 h-6 bg-slate-300 left-8.5"></div>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Correct/Wrong Dynamic Feedback Box */}
          <div className="mt-6 shrink-0 h-18 flex items-center justify-center">
            {feedback !== null && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-full max-w-md rounded-2xl p-3 border-4 flex items-center justify-between shadow ${
                  feedback === "correct"
                    ? "bg-green-100 border-green-400 text-green-800"
                    : "bg-red-100 border-red-400 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{feedback === "correct" ? "🎉" : "🦖"}</span>
                  <div>
                    <h5 className="font-sans font-black text-sm md:text-md">
                      {feedback === "correct" ? "Great Job! (+10⭐)" : "Oops! Try again!"}
                    </h5>
                    <p className="text-xs">
                      {feedback === "correct" ? "Awesome, keep matching!" : "Check the picture and try again!"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNextGame}
                  className="px-4 py-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white font-sans font-black text-xs md:text-sm flex items-center gap-1.5 border-b-2 border-orange-700 cursor-pointer"
                >
                  {gameIndex + 1 < gameOrder.length ? "Next Game" : "Get Reward"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
