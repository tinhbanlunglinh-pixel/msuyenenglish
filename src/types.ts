/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  phonetic: string;
  sentence: string;
  sentenceTranslation: string;
  illustration: string; // Dynamic Emoji symbol that represents the word
  category: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: "preschool" | "elementary" | "pre-starter" | "starter" | "mover" | "flyer" | string; // mầm non | tiểu học | YLE levels
  words: VocabularyItem[];
  createdAt: number;
  classId?: string;
  deadline?: number; // timestamp hạn nộp bài
}

export type ReviewGameType =
  | "listen_match"      // Nghe chọn tranh
  | "look_match"        // Nhìn tranh chọn từ
  | "match_meaning"      // Ghép từ với nghĩa
  | "arrange_sentence"   // Sắp xếp câu
  | "balloon_pop";       // Bong bóng từ vựng

export type QuestionType =
  | "multiple_choice"   // Trắc nghiệm
  | "listen_choice"     // Nghe chọn đáp án
  | "fill_blank"        // Điền từ
  | "match_picture"     // Nối tranh với từ
  | "arrange_sentence"   // Sắp xếp câu
  | "true_false";       // Đúng sai

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  questionText: string;
  audioText?: string;       // Text to be spoken for audio question types
  options?: string[];       // Options for multiple choice questions
  correctAnswer: string;    // String representation of correct answer or index
  imageUrl?: string;        // Emoji or character representing picture context
  matchPairs?: { image: string; word: string }[]; // For coordinate or direct matching
}

export interface TestSettings {
  questionCount: 10 | 20 | 30;
  level: "preschool" | "elementary" | "pre-starter" | "starter" | "mover" | "flyer" | string;
}

export interface TestResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongWords: VocabularyItem[];
  badgesEarned: Badge[];
  timestamp: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Cute emoji representation of the badge
  color: string; // Color scheme tailwind classes
}

export interface StudentParticipant {
  name: string;
  phone: string;
}

export interface Classroom {
  id: string;
  name: string;
  students: StudentParticipant[]; // List of student names and phone numbers
  createdAt: number;
}

export interface TestAttempt {
  id: string;
  studentName: string;
  classId: string;
  className: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  level: "preschool" | "elementary" | "pre-starter" | "starter" | "mover" | "flyer" | string;
  timestamp: number;
  teacherName: string;
  isLate?: boolean;
}

export interface StudentStudySession {
  lessonId: string;
  studentName: string;
  classId: string;
  timestamp: number;
}

