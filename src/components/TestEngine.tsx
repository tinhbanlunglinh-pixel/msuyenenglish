/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Check, X, Award, RotateCw, AlertTriangle, Play, Sparkles, Trophy, ListOrdered, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VocabularyItem, QuizQuestion, Badge, TestResult } from "../types";
import { SoundButton } from "./SoundButton";
import { playSound } from "../utils/audioSynth";

interface TestEngineProps {
  words: VocabularyItem[];
  questionCount: 10 | 20 | 30;
  level: "preschool" | "elementary";
  onFinish: (result: TestResult) => void;
  onExit: () => void;
}

export const TestEngine: React.FC<TestEngineProps> = ({
  words,
  questionCount,
  level,
  onFinish,
  onExit,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  // Drag selection matching helpers for Match Picture category
  const [matchingSelectedPic, setMatchingSelectedPic] = useState<string | null>(null);
  const [matchingSelectedWord, setMatchingSelectedWord] = useState<string | null>(null);
  const [currentMatchPairs, setCurrentMatchPairs] = useState<Record<string, string>>({}); // emoji to word

  // Scrambled local helper for arrange_sentence in Test
  const [testScrambledWords, setTestScrambledWords] = useState<{ id: string; word: string; used: boolean }[]>([]);
  const [testAssembleSentence, setTestAssembleSentence] = useState<string[]>([]);

  // Written inputs
  const [fillVal, setFillVal] = useState("");

  useEffect(() => {
    generateQuestions();
  }, [words, questionCount, level]);

  // Handle re-align sentence resets on question index shift
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      const q = questions[currentIndex];
      if (q.type === "arrange_sentence") {
        const parts = q.questionText
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .split(" ")
          .map((word, idx) => ({
            id: `tpw-${idx}-${Math.random()}`,
            word,
            used: false,
          }));
        setTestScrambledWords([...parts].sort(() => 0.5 - Math.random()));
        setTestAssembleSentence([]);
      } else if (q.type === "match_picture") {
        setCurrentMatchPairs({});
        setMatchingSelectedPic(null);
        setMatchingSelectedWord(null);
      } else {
        setFillVal("");
      }
    }
  }, [currentIndex, questions]);

  // Algorithmic rich quiz generator
  const generateQuestions = () => {
    if (!words || words.length === 0) return;

    const list: QuizQuestion[] = [];
    const poolSize = words.length;

    // Helper to fetch random vocab that isn't the target
    const getClashOptions = (target: VocabularyItem, count = 3) => {
      const clashes = words.filter((w) => w.id !== target.id);
      const shuffled = [...clashes].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count).map((w) => w.word);
    };

    const getArticle = (w: string) => /^[aeiou]/i.test(w) ? "an" : "a";

    const questionTypes: QuizQuestion["type"][] = [
      "multiple_choice",
      "listen_choice",
      "fill_blank",
      "match_picture",
      "arrange_sentence",
      "true_false",
    ];

    const shuffledWords = [...words].sort(() => 0.5 - Math.random());

    for (let i = 0; i < questionCount; i++) {
      // Pick target word sequentially or randomly
      const target = shuffledWords[i % poolSize];
      let type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      
      if (type === "multiple_choice" && target.translation.toLowerCase() === target.word.toLowerCase()) {
        type = "listen_choice";
      }
      
      const id = `test-q-${i}-${Date.now()}`;

      if (type === "multiple_choice") {
        const isTranslationSame = target.translation.toLowerCase() === target.word.toLowerCase();
        const opts = [target.word, ...getClashOptions(target, 3)].sort(() => 0.5 - Math.random());
        list.push({
          id,
          type,
          questionText: isTranslationSame ? `Look at the picture. What is this?` : `Which word means: "${target.translation}"?`,
          options: opts,
          correctAnswer: target.word,
          imageUrl: target.illustration,
        });
      } 
      else if (type === "listen_choice") {
        const isTranslationSame = target.translation.toLowerCase() === target.word.toLowerCase();
        
        let opts = [];
        if (isTranslationSame) {
          opts = [target.word, ...words.filter((w) => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3).map((w) => w.word)];
        } else {
          const clashWords = words.filter((w) => w.id !== target.id && w.translation.toLowerCase() !== w.word.toLowerCase());
          const finalClash = clashWords.length >= 3 
            ? clashWords.sort(() => 0.5 - Math.random()).slice(0, 3) 
            : words.filter((w) => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
          opts = [target.translation, ...finalClash.map((w) => w.translation)];
        }
        opts = opts.sort(() => 0.5 - Math.random());

        list.push({
          id,
          type,
          questionText: isTranslationSame ? "Listen and choose the correct word:" : "Listen and choose the correct meaning:",
          audioText: target.word,
          options: opts,
          correctAnswer: isTranslationSame ? target.word : target.translation,
        });
      } 
      else if (type === "fill_blank") {
        const isTranslationSame = target.translation.toLowerCase() === target.word.toLowerCase();
        const w = target.word;
        let masked = "";
        if (w.length > 2) {
          const split = w.split("");
          split[Math.floor(split.length / 2)] = "_";
          masked = split.join("");
        } else {
          masked = w[0] + "_";
        }
        list.push({
          id,
          type,
          questionText: isTranslationSame ? `Fill in the missing letter: ${masked}` : `Fill in the missing letter for "${target.translation}": ${masked}`,
          correctAnswer: target.word.toLowerCase(),
          imageUrl: target.illustration,
        });
      } 
      else if (type === "match_picture") {
        const slice = [...words].sort(() => 0.5 - Math.random()).slice(0, 3);
        const pairs = slice.map((w) => ({ image: w.illustration, word: w.word }));
        
        list.push({
          id,
          type,
          questionText: "Match each picture with the correct word:",
          matchPairs: pairs,
          correctAnswer: JSON.stringify(pairs),
        });
      } 
      else if (type === "arrange_sentence") {
        const cleanStr = target.sentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
        list.push({
          id,
          type,
          questionText: cleanStr,
          correctAnswer: cleanStr.toLowerCase(),
          imageUrl: target.illustration,
        });
      } 
      else if (type === "true_false") {
        const isTranslationSame = target.translation.toLowerCase() === target.word.toLowerCase();
        const isTrue = Math.random() > 0.5;
        let info = "";
        let correct = "False";
        
        if (isTrue) {
          info = isTranslationSame ? `Is this ${getArticle(target.word)} "${target.word}"?` : `Does "${target.word}" mean "${target.translation}"?`;
          correct = "True";
        } else {
          const validClashes = words.filter((w) => w.id !== target.id && w.translation.toLowerCase() !== w.word.toLowerCase());
          let incorrectOne = validClashes.sort(() => 0.5 - Math.random())[0];
          if (!incorrectOne) {
              const anyClashes = words.filter((w) => w.id !== target.id);
              incorrectOne = anyClashes.sort(() => 0.5 - Math.random())[0] || target;
          }
          info = isTranslationSame ? `Is this ${getArticle(incorrectOne.word)} "${incorrectOne.word}"?` : `Does "${target.word}" mean "${incorrectOne.translation}"?`;
          correct = "False";
        }

        list.push({
          id,
          type,
          questionText: info,
          options: ["True", "False"],
          correctAnswer: correct,
          imageUrl: target.illustration,
        });
      }
    }

    setQuestions(list);
    setCurrentIndex(0);
    setUserAnswers({});
    setTestSubmitted(false);
    setResult(null);
  };

  const handleTextChoiceClick = (option: string) => {
    if (userAnswers[questions[currentIndex].id]) return; // lock answer after selection
    
    const isCorrect = option === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      playSound.playTing(); // correct sound
    } else {
      playSound.playClick(); // wrong sound
    }
    
    setUserAnswers({ ...userAnswers, [questions[currentIndex].id]: option });
  };

  const getActiveSelection = (): string => {
    return userAnswers[questions[currentIndex].id] || "";
  };

  // Match Picture Sub-module Selection Mechanics
  const selectMatchPic = (emoji: string) => {
    playSound.playTing();
    if (matchingSelectedPic === emoji) {
      setMatchingSelectedPic(null);
      return;
    }
    setMatchingSelectedPic(emoji);
    processInnerMatch(emoji, matchingSelectedWord);
  };

  const selectMatchWord = (word: string) => {
    playSound.playTing();
    if (matchingSelectedWord === word) {
      setMatchingSelectedWord(null);
      return;
    }
    setMatchingSelectedWord(word);
    processInnerMatch(matchingSelectedPic, word);
  };

  const processInnerMatch = (emoji: string | null, w: string | null) => {
    if (!emoji || !w) return;
    const currentQ = questions[currentIndex];
    
    // Track match coordinates
    const updated = { ...currentMatchPairs, [emoji]: w };
    setCurrentMatchPairs(updated);
    setMatchingSelectedPic(null);
    setMatchingSelectedWord(null);

    // Auto update userAnswers state as serialized representation
    setUserAnswers({ ...userAnswers, [currentQ.id]: JSON.stringify(updated) });
  };

  // Arrange Sentence Sub-module Selection Mechanics
  const selectArrangeWord = (wordObj: typeof testScrambledWords[0]) => {
    playSound.playTing();
    setTestScrambledWords((arr) =>
      arr.map((item) => (item.id === wordObj.id ? { ...item, used: true } : item))
    );
    const updatedAssembled = [...testAssembleSentence, wordObj.word];
    setTestAssembleSentence(updatedAssembled);

    // Sync to user answers
    const currentQ = questions[currentIndex];
    setUserAnswers({ ...userAnswers, [currentQ.id]: updatedAssembled.join(" ").toLowerCase() });
  };

  const removeArrangeWord = (word: string, index: number) => {
    playSound.playClick();
    const updated = [...testAssembleSentence];
    updated.splice(index, 1);
    setTestAssembleSentence(updated);

    let cleared = false;
    setTestScrambledWords((arr) =>
      arr.map((item) => {
        if (!cleared && item.word === word && item.used) {
          cleared = true;
          return { ...item, used: false };
        }
        return item;
      })
    );

    // Sync to user answers
    const currentQ = questions[currentIndex];
    setUserAnswers({ ...userAnswers, [currentQ.id]: updated.join(" ").toLowerCase() });
  };

  // Skip or go back
  const nextQuestion = () => {
    playSound.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitAllTest();
    }
  };

  const prevQuestion = () => {
    playSound.playClick();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Submit test calculations
  const submitAllTest = () => {
    setTestSubmitted(true);
    let scoreTotal = 0;
    let correctCount = 0;
    const wrongWords: VocabularyItem[] = [];

    questions.forEach((q) => {
      const userAnswer = (userAnswers[q.id] || "").trim().toLowerCase();
      
      if (q.type === "match_picture") {
        // Check serialization matches
        try {
          const userPairs = JSON.parse(userAnswers[q.id] || "{}");
          const correctPairs = JSON.parse(q.correctAnswer);
          let matchCount = 0;
          correctPairs.forEach((cp: any) => {
            if (userPairs[cp.image] === cp.word) {
              matchCount++;
            }
          });
          if (matchCount === correctPairs.length) {
            correctCount++;
          }
        } catch (e) {
          // parse failed, counted wrong
        }
      } else {
        const correctText = q.correctAnswer.trim().toLowerCase();
        if (userAnswer === correctText) {
          correctCount++;
        } else {
          // Identify wrong words categories to review
          const matchedVocab = words.find(
            (w) =>
              w.word.toLowerCase() === correctText ||
              w.translation.toLowerCase() === correctText ||
              w.sentence.toLowerCase().includes(correctText)
          );
          if (matchedVocab && !wrongWords.some((ww) => ww.id === matchedVocab.id)) {
            wrongWords.push(matchedVocab);
          }
        }
      }
    });

    // Score out of 100
    const rawScore = Math.round((correctCount / questions.length) * 100);
    
    // Standard Badging system
    const badgesEarned: Badge[] = [];
    if (rawScore === 100) {
      badgesEarned.push({
        id: "b-perfect",
        title: "Anh Ngữ Vô Địch 🏆",
        description: "Bé làm đúng tất cả 100% câu hỏi xuất sắc!",
        icon: "👑",
        color: "from-yellow-400 to-amber-500",
      });
    } else if (rawScore >= 80) {
      badgesEarned.push({
        id: "b-expert",
        title: "Ngôi Sao Sáng ⭐",
        description: "Đạt thành tích cao trên 80% câu hỏi chính xác!",
        icon: "🌟",
        color: "from-indigo-400 to-indigo-600",
      });
    }

    if (level === "preschool") {
      badgesEarned.push({
        id: "b-mầm non",
        title: "Bé Ngoan Học Giỏi 🧸",
        description: "Được khen ngợi chăm chỉ hoàn thành bài tập của Bé!",
        icon: "🐰",
        color: "from-rose-400 to-rose-500",
      });
    } else {
      badgesEarned.push({
        id: "b-elementary",
        title: "Trí Tuệ Việt ⚡",
        description: "Vượt qua thử thách tiếng Anh Tiểu học đầy tự tin!",
        icon: "⚡",
        color: "from-teal-400 to-emerald-500",
      });
    }

    playSound.playFanfare();

    const finalResult: TestResult = {
      score: rawScore,
      totalQuestions: questions.length,
      correctCount,
      wrongWords,
      badgesEarned,
      timestamp: Date.now(),
    };

    setResult(finalResult);
    onFinish(finalResult);
  };

  const getQuestionProgress = () => {
    return Math.round(((currentIndex) / questions.length) * 100);
  };

  const q = questions[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 bg-gradient-to-tr from-purple-100 via-indigo-50 to-pink-50 rounded-3xl border-8 border-indigo-200 shadow-xl overflow-hidden">
      {!q ? (
        <div className="text-center py-20">
          <GraduationCap className="h-16 w-16 text-indigo-500 animate-spin mx-auto mb-4" />
          <h4 className="font-sans font-black text-indigo-800 text-xl">Loading fun quiz questions...</h4>
        </div>
      ) : (
        <div>
          {/* Quiz Top status */}
          <div className="flex items-center justify-between gap-4 mb-4 bg-white/80 p-4 rounded-2xl shadow-sm border-2 border-dashed border-indigo-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-indigo-600 animate-bounce" />
              <div>
                <h4 className="font-sans font-black text-indigo-900 text-md md:text-lg">TEST ZONE</h4>
                <p className="text-xs text-indigo-500 font-sans font-bold uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
            </div>

            <button
              onClick={onExit}
              className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer font-sans font-bold text-xs"
            >
              Quay Lại Dashboard 🏠
            </button>
          </div>

          {/* Core progress tracker bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full mb-6 overflow-hidden">
            <motion.div
              animate={{ width: `${getQuestionProgress()}%` }}
              className="h-full bg-gradient-to-r from-pink-500 to-indigo-600"
            />
          </div>

          {/* Active Question Panel Layout */}
          <div className="bg-white rounded-3xl p-6 border-4 border-indigo-100/50 min-h-[320px] flex flex-col justify-between shadow-inner">
            <div className="w-full">
              {/* Question Type tag */}
              <div className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 mb-4 text-xs font-sans font-black text-indigo-600 uppercase">
                {q.type === "multiple_choice" && "Chọn Đáp Án Đúng"}
                {q.type === "listen_choice" && "Nghe & Chọn 🎧"}
                {q.type === "fill_blank" && "Điền Chữ Còn Thiếu 🧩"}
                {q.type === "match_picture" && "Nối Hình & Từ ⭐"}
                {q.type === "arrange_sentence" && "Xếp Câu Hoàn Chỉnh 👑"}
                {q.type === "true_false" && "Đúng hay Sai? 🎯"}
              </div>

              {/* Dynamic content rendering */}
              <h3 className="font-sans font-black text-lg md:text-xl text-gray-800 leading-snug mb-6">
                {q.type === "arrange_sentence" ? "Arrange the words to make a sentence:" : q.questionText}
              </h3>

              {/* QUESTION FORM 1: Multiple choice standard with illustration */}
              {q.type === "multiple_choice" && (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {q.imageUrl && (
                    <div className="text-8xl md:text-9xl p-4 bg-amber-50 rounded-2xl shadow-inner border-2 border-amber-100 animate-pulse shrink-0">
                      {q.imageUrl}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {q.options?.map((opt) => {
                      const isSelected = getActiveSelection() === opt;
                      const hasAnswered = getActiveSelection() !== "";
                      const isCorrect = opt === q.correctAnswer;
                      
                      let btnClass = "bg-gray-50 border-gray-200 hover:bg-indigo-50 text-gray-700";
                      if (hasAnswered) {
                        if (isCorrect) {
                          btnClass = "bg-green-100 border-green-500 text-green-700";
                        } else if (isSelected) {
                          btnClass = "bg-red-100 border-red-500 text-red-700";
                        } else {
                          btnClass = "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed";
                        }
                      } else if (isSelected) {
                        btnClass = "bg-indigo-100 border-indigo-500 text-indigo-700";
                      }

                      return (
                        <button
                          key={opt}
                          disabled={hasAnswered}
                          onClick={() => handleTextChoiceClick(opt)}
                          className={`p-4 rounded-xl border-4 text-center font-sans font-black text-md transition-all ${btnClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION FORM 2: Listen Choice */}
              {q.type === "listen_choice" && q.audioText && (
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <SoundButton text={q.audioText} size="lg" slow={level === "preschool"} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                    {q.options?.map((opt) => {
                      const isSelected = getActiveSelection() === opt;
                      const hasAnswered = getActiveSelection() !== "";
                      const isCorrect = opt === q.correctAnswer;
                      
                      let btnClass = "bg-gray-50 border-gray-200 hover:bg-indigo-50 text-gray-700";
                      if (hasAnswered) {
                        if (isCorrect) {
                          btnClass = "bg-green-100 border-green-500 text-green-700";
                        } else if (isSelected) {
                          btnClass = "bg-red-100 border-red-500 text-red-700";
                        } else {
                          btnClass = "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed";
                        }
                      } else if (isSelected) {
                        btnClass = "bg-indigo-100 border-indigo-500 text-indigo-700";
                      }

                      return (
                        <button
                          key={opt}
                          disabled={hasAnswered}
                          onClick={() => handleTextChoiceClick(opt)}
                          className={`p-4 rounded-xl border-4 text-center font-sans font-black text-md transition-all ${btnClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUESTION FORM 3: Fill Blank */}
              {q.type === "fill_blank" && (
                <div className="flex flex-col items-center gap-4">
                  {q.imageUrl && <div className="text-8xl mb-2 animate-bounce">{q.imageUrl}</div>}
                  <div className="relative max-w-xs w-full">
                    {/* Multi selection options or simple text input */}
                    <input
                      type="text"
                      placeholder="Type the correct word here..."
                      value={fillVal}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        setFillVal(val);
                        setUserAnswers({ ...userAnswers, [q.id]: val });
                      }}
                      className="w-full p-4 rounded-xl border-4 border-indigo-200 focus:border-indigo-500 font-sans font-black text-center text-lg uppercase outline-none"
                    />
                  </div>
                </div>
              )}

              {/* QUESTION FORM 4: Match Picture Emojis */}
              {q.type === "match_picture" && q.matchPairs && (
                <div className="text-center">
                  <p className="text-xs text-indigo-500 font-bold mb-4">
                    Click a picture on the left, then select the matching English word on the right!
                  </p>

                  <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                    {/* Picture buttons column */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-black uppercase text-pink-500">Pictures</p>
                      {q.matchPairs.map((pair) => {
                        const matchesObj: Record<string, string> = JSON.parse(userAnswers[q.id] || "{}");
                        const isMatched = matchesObj[pair.image] !== undefined;
                        const isSelected = matchingSelectedPic === pair.image;

                        return (
                          <button
                            key={pair.image}
                            disabled={isMatched}
                            onClick={() => selectMatchPic(pair.image)}
                            className={`p-3 rounded-xl border-4 text-center transition-all cursor-pointer ${
                              isMatched
                                ? "bg-slate-100 border-slate-300 opacity-70 text-slate-600"
                                : isSelected
                                ? "bg-pink-100 border-pink-400"
                                : "bg-white border-pink-100 hover:bg-pink-50"
                            }`}
                          >
                            <span className="text-4xl">{pair.image}</span>
                            {isMatched && <span className="block text-xs font-bold text-slate-500">🔗 Linked</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Word buttons column */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-black uppercase text-indigo-500">Words</p>
                      {q.matchPairs
                        .map((x) => x.word)
                        .sort()
                        .map((word) => {
                          const matchesObj: Record<string, string> = JSON.parse(userAnswers[q.id] || "{}");
                          // Find if word is matched
                          const isMatched = Object.values(matchesObj).includes(word);
                          const isSelected = matchingSelectedWord === word;

                          return (
                            <button
                              key={word}
                              disabled={isMatched}
                              onClick={() => selectMatchWord(word)}
                              className={`p-4 rounded-xl border-4 text-center font-sans font-black transition-all cursor-pointer ${
                                isMatched
                                  ? "bg-slate-100 border-slate-300 opacity-70 text-slate-600"
                                  : isSelected
                                  ? "bg-indigo-100 border-indigo-400"
                                  : "bg-white border-indigo-100 hover:bg-indigo-50 text-indigo-800"
                              }`}
                            >
                              {word}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* QUESTION FORM 5: Arrange scrambled sentences */}
              {q.type === "arrange_sentence" && (
                <div className="text-center">
                  <div className="min-h-16 border-4 border-dashed border-indigo-100 p-4 rounded-xl mb-4 flex flex-wrap gap-2 justify-center bg-indigo-50/50">
                    {testAssembleSentence.map((word, index) => (
                      <button
                        key={`assembled-${index}`}
                        onClick={() => removeArrangeWord(word, index)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-sans font-black rounded-lg shadow cursor-pointer hover:scale-105"
                      >
                        {word}
                      </button>
                    ))}
                    {testAssembleSentence.length === 0 && (
                      <span className="text-sm text-gray-400 font-mono italic flex items-center">
                        (Tap words below to arrange them)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {testScrambledWords.map((item) => (
                      <button
                        disabled={item.used}
                        key={item.id}
                        onClick={() => selectArrangeWord(item)}
                        className={`px-4 py-2 border-2 text-md font-sans font-semibold rounded-lg shadow-sm transition-all cursor-pointer ${
                          item.used
                            ? "bg-gray-100 border-gray-200 text-gray-300 opacity-40 cursor-not-allowed"
                            : "bg-white border-purple-300 text-purple-700 hover:bg-purple-100"
                        }`}
                      >
                        {item.word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUESTION FORM 6: True False */}
              {q.type === "true_false" && (
                <div className="text-center">
                  {q.imageUrl && <div className="text-8xl mb-4 animate-bounce">{q.imageUrl}</div>}
                  <div className="flex justify-center gap-6 max-w-sm mx-auto">
                    {q.options?.map((opt) => {
                      const isSelected = getActiveSelection() === opt;
                      const hasAnswered = getActiveSelection() !== "";
                      const isCorrect = opt === q.correctAnswer;
                      
                      let btnClass = "bg-gray-50 border-gray-200 hover:bg-indigo-50 text-gray-700";
                      if (hasAnswered) {
                        if (isCorrect) {
                          btnClass = "bg-green-100 border-green-500 text-green-700";
                        } else if (isSelected) {
                          btnClass = "bg-red-100 border-red-500 text-red-700";
                        } else {
                          btnClass = "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed";
                        }
                      } else if (isSelected) {
                        btnClass = "bg-indigo-100 border-indigo-500 text-indigo-700";
                      }

                      return (
                        <button
                          key={opt}
                          disabled={hasAnswered}
                          onClick={() => handleTextChoiceClick(opt)}
                          className={`flex-1 p-6 rounded-2xl border-4 font-sans font-black text-lg md:text-xl transition-all ${btnClass}`}
                        >
                          {opt === "True" ? "True ✓" : "False ✗"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Pagination / navigation controllers */}
            <div className="flex items-center justify-between gap-4 border-t-2 border-dashed border-indigo-50 pt-6 mt-6 shrink-0">
              <button
                disabled={currentIndex === 0}
                onClick={prevQuestion}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-sans font-black transition-colors ${
                  currentIndex === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-150 text-indigo-700 hover:bg-indigo-200 cursor-pointer"
                }`}
              >
                ◀ Back
              </button>

              <button
                onClick={nextQuestion}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-sans font-black text-sm md:text-md border-b-4 border-indigo-800 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 duration-200"
              >
                {currentIndex + 1 < questions.length ? "Next ▶" : "Submit 🚀"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
