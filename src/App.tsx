/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Volume2,
  Gamepad2,
  Trophy,
  PlusCircle,
  Upload,
  User,
  Settings,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkle,
  Home,
  Share2,
  Users,
  Copy,
  Award,
  Trash2,
  Printer,
  Calendar,
  LogOut,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VocabularyItem, Lesson, TestResult, Classroom, TestAttempt, StudentStudySession } from "./types";
import { SoundButton } from "./components/SoundButton";
import { AudioRecorder } from "./components/AudioRecorder";
import { ReviewGames } from "./components/ReviewGames";
import { TestEngine } from "./components/TestEngine";
import { playSound } from "./utils/audioSynth";

interface DictionaryEntry {
  translation: string;
  phonetic: string;
  sentence?: string;
  sentenceTranslation?: string;
}

const commonWordsDictClient: Record<string, DictionaryEntry> = {
  "teacher": { translation: "Giáo viên", phonetic: "/ˈtiːtʃə(r)/", sentence: "I love my teacher.", sentenceTranslation: "Tôi yêu cô giáo của tôi." },
  "student": { translation: "Học sinh", phonetic: "/ˈstjuːdnt/", sentence: "I am a good student.", sentenceTranslation: "Tôi là một học sinh ngoan." },
  "classroom": { translation: "Lớp học", phonetic: "/ˈklɑːsruːm/", sentence: "I like my classroom.", sentenceTranslation: "Tôi yêu lớp học của tôi." },
  "school": { translation: "Trường học", phonetic: "/skuːl/", sentence: "I go to school every day.", sentenceTranslation: "Tôi đi học mỗi ngày." },
  "book": { translation: "Quyển sách", phonetic: "/bʊk/", sentence: "I read a fun book.", sentenceTranslation: "Tôi đọc một quyển sách thú vị." },
  "pencil": { translation: "Bút chì", phonetic: "/ˈtensl/", sentence: "I write with my pencil.", sentenceTranslation: "Tôi vẽ bằng bút chì của tôi." },
  "desk": { translation: "Bàn học", phonetic: "/desk/", sentence: "I sit at my desk.", sentenceTranslation: "Tôi ngồi ở bàn học của tôi." },
  "chair": { translation: "Ghế", phonetic: "/tʃeə(r)/", sentence: "I sit on my chair.", sentenceTranslation: "Tôi ngồi trên ghế của tôi." },
  "blackboard": { translation: "Bảng đen", phonetic: "/ˈblækbɔːd/", sentence: "The teacher writes on the blackboard.", sentenceTranslation: "Cô giáo viết trên bảng đen." },
  "pen": { translation: "Bút mực", phonetic: "/pen/", sentence: "I write with my pen.", sentenceTranslation: "Tôi viết bằng bút mực của tôi." },
  "eraser": { translation: "Cục tẩy", phonetic: "/ɪˈreɪzə(r)/", sentence: "I rub with my eraser.", sentenceTranslation: "Tôi tẩy bằng cục tẩy của tôi." },
  "ruler": { translation: "Thước kẻ", phonetic: "/ˈruːlə(r)/", sentence: "I use my ruler to draw lines.", sentenceTranslation: "Tôi dùng thước kẻ để vẽ các đường thẳng." },
  "notebook": { translation: "Vở ghi", phonetic: "/ˈnəʊtbʊk/", sentence: "I write in my notebook.", sentenceTranslation: "Tôi viết vào vở của tôi." },
  "cat": { translation: "Con mèo", phonetic: "/kæt/", sentence: "I like my cat.", sentenceTranslation: "Tôi yêu con mèo của tôi." },
  "dog": { translation: "Con chó", phonetic: "/dɒɡ/", sentence: "I like my dog.", sentenceTranslation: "Tôi yêu con chó của tôi." },
  "bird": { translation: "Con chim", phonetic: "/bɜːd/", sentence: "The bird sings sweet songs.", sentenceTranslation: "Chú chim hót những khúc ca ngọt ngào." },
  "monkey": { translation: "Con khỉ", phonetic: "/ˈmʌŋki/", sentence: "The monkey eats sweet bananas.", sentenceTranslation: "Chú khỉ ăn những quả chuối ngọt lịm." },
  "rabbit": { translation: "Con thỏ", phonetic: "/ˈræbɪt/", sentence: "The white rabbit hops fast.", sentenceTranslation: "Chú thỏ trắng nhảy thật nhanh." },
  "lion": { translation: "Sư tử", phonetic: "/ˈlaɪən/", sentence: "The big lion rules the jungle.", sentenceTranslation: "Sư tử to lớn thống trị khu rừng." },
  "elephant": { translation: "Con voi", phonetic: "/ˈelɪfənt/", sentence: "The elephant has a very long nose.", sentenceTranslation: "Chú voi có một chiếc mũi rất dài." },
  "frog": { translation: "Con ếch", phonetic: "/frɒɡ/", sentence: "The green frog jumps high.", sentenceTranslation: "Chú ếch xanh nhảy thật cao." },
  "apple": { translation: "Quả táo", phonetic: "/ˈæpl/", sentence: "I eat a crunchy red apple.", sentenceTranslation: "Tôi ăn một quả táo đỏ giòn rụm." },
  "banana": { translation: "Quả chuối", phonetic: "/bəˈnɑːnə/", sentence: "I love eating sweet yellow bananas.", sentenceTranslation: "Tôi thích ăn những quả chuối vàng ngọt lịm." },
  "orange": { translation: "Quả cam", phonetic: "/ˈɒrɪndʒ/", sentence: "I drink orange juice in the morning.", sentenceTranslation: "Tôi uống nước cam vào buổi sáng." },
  "hello": { translation: "Xin chào", phonetic: "/həˈləʊ/", sentence: "I say hello to my friends.", sentenceTranslation: "Tôi chào các bạn của tôi." },
  "goodbye": { translation: "Tạm biệt", phonetic: "/ˌɡʊdˈbaɪ/", sentence: "I say goodbye to my teacher.", sentenceTranslation: "Tôi chào tạm biệt cô giáo của tôi." },
  "mother": { translation: "Mẹ", phonetic: "/ˈmʌðə(r)/", sentence: "I love my mother very much.", sentenceTranslation: "Tôi yêu mẹ của tôi rất nhiều." },
  "father": { translation: "Bố", phonetic: "/ˈfɑːðə(r)/", sentence: "My father plays games with me.", sentenceTranslation: "Bố chơi trò chơi với tôi." },
  "brother": { translation: "Anh/Em trai", phonetic: "/ˈbrʌðə(r)/", sentence: "I play football with my brother.", sentenceTranslation: "Tôi chơi đá bóng với anh/em trai của tôi." },
  "sister": { translation: "Chị/Em gái", phonetic: "/ˈsɪstə(r)/", sentence: "I share my toys with my sister.", sentenceTranslation: "Tôi chia sẻ đồ chơi với chị/em gái của tôi." },
  "baby": { translation: "Em bé", phonetic: "/ˈbeɪbi/", sentence: "The cute baby is sleeping.", sentenceTranslation: "Em bé đáng yêu đang ngủ." },
  "family": { translation: "Gia đình", phonetic: "/ˈfæməli/", sentence: "I love my happy family.", sentenceTranslation: "Tôi yêu gia đình hạnh phúc của tôi." },
  "house": { translation: "Ngôi nhà", phonetic: "/haʊs/", sentence: "This is my lovely house.", sentenceTranslation: "Đây là ngôi nhà đáng yêu của tôi." },
  "door": { translation: "Cửa ra vào", phonetic: "/dɔː(r)/", sentence: "I open the door for my mom.", sentenceTranslation: "Tôi mở cửa cho mẹ." },
  "window": { translation: "Cửa sổ", phonetic: "/ˈwɪndəʊ/", sentence: "I look out of the window.", sentenceTranslation: "Tôi nhìn ra ngoài cửa sổ." },
  "bag": { translation: "Cặp sách", phonetic: "/bæɡ/", sentence: "I pack my books into my bag.", sentenceTranslation: "Tôi xếp sách vào cặp học sinh." },
  "board": { translation: "Bảng học", phonetic: "/bɔːd/", sentence: "Please look at the board.", sentenceTranslation: "Xin vui lòng nhìn lên bảng." },
  "marker": { translation: "Bút viết bảng", phonetic: "/ˈmɑːkə(r)/", sentence: "I write on the white board with a marker.", sentenceTranslation: "Tôi viết lên bảng trắng bằng bút lông." },
  "computer": { translation: "Máy tính", phonetic: "/kəmˈpjuːtə(r)/", sentence: "We learn English on the computer.", sentenceTranslation: "Chúng tôi học tiếng Anh trên máy tính." },
  "crayon": { translation: "Bút sáp màu", phonetic: "/ˈkreɪɒn/", sentence: "I draw a picture with my crayon.", sentenceTranslation: "Tôi vẽ một bức tranh bằng bút sáp màu của tôi." },
  "crayons": { translation: "Bút sáp màu", phonetic: "/ˈkreɪɒnz/", sentence: "I color with my crayons.", sentenceTranslation: "Tôi tô màu bằng bút sáp màu của tôi." }
};

function getOrGenerateEntryClient(word: string): DictionaryEntry | undefined {
  const key = word.toLowerCase().trim();
  const cleanKey = key.endsWith(".") ? key.slice(0, -1).trim() : key;
  const entry = commonWordsDictClient[key] || commonWordsDictClient[cleanKey];
  if (!entry) return undefined;
  
  if (entry.sentence && entry.sentenceTranslation) {
    return entry;
  }
  
  // Heuristic sentence generation
  let sentence = "";
  let sentenceTranslation = "";
  const translation = entry.translation;
  
  // Check if it is a color
  const colors = ["red", "blue", "green", "yellow", "pink", "purple", "black", "white", "brown", "grey", "gray"];
  // Check if it is a number
  const numbers = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  // Check if it is a greeting
  const greetings = ["hello", "goodbye"];
  
  if (colors.includes(cleanKey)) {
    sentence = `I like ${cleanKey}.`;
    sentenceTranslation = `Tôi thích màu ${translation.toLowerCase()}.`;
  } else if (numbers.includes(cleanKey)) {
    sentence = `I have ${cleanKey} apples.`;
    sentenceTranslation = `Tôi có ${translation.toLowerCase()} quả táo.`;
  } else if (greetings.includes(cleanKey)) {
    sentence = `I say ${cleanKey} to you.`;
    sentenceTranslation = `Tôi nói ${translation.toLowerCase()} với bạn.`;
  } else {
    sentence = `I like my ${cleanKey}.`;
    sentenceTranslation = `Tôi yêu ${translation.toLowerCase()} của tôi.`;
  }
  
  return {
    ...entry,
    sentence,
    sentenceTranslation
  };
}

function parseRawContentClient(rawContent: string): { english: string; vietnamese: string }[] {
  let lines = rawContent.split(/[\n;]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  if (lines.length === 1 && lines[0].includes(",")) {
    lines = lines[0].split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }
  
  return lines.map(line => {
    let english = line;
    let vietnamese = "";
    
    const separators = [" - ", " – ", " : ", " / ", " (", "=>"];
    for (const sep of separators) {
      const idx = line.indexOf(sep);
      if (idx !== -1) {
        english = line.substring(0, idx).trim();
        vietnamese = line.substring(idx + sep.length).replace(/\)$/, "").trim();
        break;
      }
    }
    
    english = english.replace(/^\d+[\s.\-_)]+/, "").trim();
    return { english, vietnamese };
  }).filter(item => item.english.length > 0);
}

function getFallbackIllustrationClient(word: string): string {
  const dict: Record<string, string> = {
    "classroom": "🏫",
    "teacher": "👩‍🏫",
    "student": "🧑‍🎓",
    "school": "🎒",
    "book": "📖",
    "pencil": "✏️",
    "desk": "✍️",
    "chair": "🪑",
    "blackboard": "📋",
    "pen": "🖊️",
    "eraser": "🧽",
    "ruler": "📏",
    "notebook": "📓",
    "cat": "🐱",
    "dog": "🐶",
    "bird": "🐦",
    "monkey": "🐵",
    "rabbit": "🐰",
    "lion": "🦁",
    "elephant": "🐘",
    "frog": "🐸",
    "apple": "🍎",
    "banana": "🍌",
    "orange": "🍊"
  };
  const key = word.toLowerCase().trim().replace(/[.,?!]/g, "");
  if (dict[key]) return dict[key];
  
  const list = ["🎨", "🎭", "🎪", "🎢", "🚂", "🚀", "🛸", "🚁", "🚲", "🛹", "⚽", "🏀", "🎈", "🎁", "🧸", "🎉", "👑", "🌈", "☀️", "🍀", "🍎", "🥝", "🍉", "🍇", "🥕", "🍕", "🧁", "🍿", "🍩", "🥤", "🐾", "🦁", "🐼", "🐻", "🦊", "🐱", "🐶", "🐰", "🐨", "🐸"];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % list.length;
  return list[index];
}

// Helper function to group and sort lessons by day (newest first)
const groupLessonsByDate = (lessons: Lesson[]): { [dateStr: string]: Lesson[] } => {
  const groups: { [dateStr: string]: Lesson[] } = {};
  if (!lessons || !Array.isArray(lessons)) return groups;
  const sorted = [...lessons].sort((sourceA, sourceB) => (sourceB.createdAt || 0) - (sourceA.createdAt || 0));
  
  sorted.forEach((lesson) => {
    const ts = lesson.createdAt || Date.now();
    const d = new Date(ts);
    const dateStr = `Ngày ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(lesson);
  });
  return groups;
};

const formatLessonDate = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatLessonDeadline = (timestamp?: number) => {
  if (!timestamp) return "Không giới hạn";
  const d = new Date(timestamp);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} lúc ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }
    };
    img.onerror = () => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };
  });
};

// Dynamic gorgeous image logo for "Trung Tâm Ngoại Ngữ Cô Phượng Uyên"
const LogoSVG = ({ className = "h-14 w-14" }) => (
  <img
    src="https://i.postimg.cc/L4nGqs4D/650361495-1628861905304764-7370063187505837857-n.jpg"
    alt="Logo Cô Phượng Uyên"
    referrerPolicy="no-referrer"
    className={`${className} object-cover rounded-xl border border-blue-200 shadow-sm`}
  />
);

export default function App() {
  // Portal State: 'landing' (Default Trang Chủ) | 'student' | 'teacher'
  const [activePortal, setActivePortal] = useState<"landing" | "student" | "teacher">("landing");
  const [activeTab, setActiveTab] = useState<"learn" | "listen" | "read" | "games" | "test" | "create">("learn");
  
  // Teacher View Subtab: 'lessons' (Soạn bài) | 'classes' (Quản lý lớp học)
  const [teacherSubtab, setTeacherSubtab] = useState<"lessons" | "classes">("lessons");

  // Lessons list with localStorage hydration
  const [lessonsList, setLessonsList] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem("minion_lessons");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "lesson-1",
        title: "🤖 Từ Vựng Động Vật Đáng Yêu",
        level: "preschool",
        createdAt: Date.now(),
        words: [
          {
            id: "m1",
            word: "Cat",
            translation: "Con mèo",
            phonetic: "/kæt/",
            sentence: "The little cat is sleeping.",
            sentenceTranslation: "Chú mèo nhỏ đang ngủ.",
            illustration: "🐱",
            category: "Animals"
          },
          {
            id: "m2",
            word: "Dog",
            translation: "Con chó",
            phonetic: "/dɒɡ/",
            sentence: "The happy dog wags its tail.",
            sentenceTranslation: "Chú chó vui vẻ vẫy đuôi.",
            illustration: "🐶",
            category: "Animals"
          },
          {
            id: "m3",
            word: "Bird",
            translation: "Con chim",
            phonetic: "/bɜːd/",
            sentence: "The colorful bird sings softly.",
            sentenceTranslation: "Chú chim nhiều màu sắc hót líu lo ngọt ngào.",
            illustration: "🐦",
            category: "Animals"
          },
          {
            id: "m4",
            word: "Monkey",
            translation: "Con khỉ",
            phonetic: "/ˈmʌŋ.ki/",
            sentence: "The banana is yummy for the monkey.",
            sentenceTranslation: "Trái chuối ngọt ngào ngon miệng cho chú khỉ.",
            illustration: "🐵",
            category: "Animals"
          },
          {
            id: "m5",
            word: "Rabbit",
            translation: "Con thỏ",
            phonetic: "/ˈræb.ɪt/",
            sentence: "The fast white rabbit hops to me.",
            sentenceTranslation: "Chú thỏ trắng chạy nhảy thật nhanh về phía tớ.",
            illustration: "🐰",
            category: "Animals"
          },
          {
            id: "m6",
            word: "Lion",
            translation: "Sư tử mẫu",
            phonetic: "/ˈlaɪ.ən/",
            sentence: "The big lion rules the savanna jungle.",
            sentenceTranslation: "Chú sư tử to lớn thống trị vùng thảo nguyên cỏ.",
            illustration: "🦁",
            category: "Animals"
          }
        ]
      }
    ];
  });

  const [selectedLessonId, setSelectedLessonId] = useState<string>("lesson-1");

  // Classrooms list with localStorage hydration & default seed classroom
  const [classroomsList, setClassroomsList] = useState<Classroom[]>(() => {
    const saved = localStorage.getItem("minion_classrooms");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "class-1",
        name: "Lớp Lá mầm non 🌟",
        students: [
          { name: "Bé Minh Anh", phone: "0912345678" },
          { name: "Bé Hương Giang", phone: "0987654321" },
          { name: "Bé Bảo Nam", phone: "0345678901" },
          { name: "Bé Khánh Vy", phone: "0356789012" }
        ],
        createdAt: Date.now() - 86400000 * 5,
      },
      {
        id: "class-2",
        name: "Lớp 3A Tiểu học 🦁",
        students: [
          { name: "Nguyễn Hoàng Lâm", phone: "0911223344" },
          { name: "Trần Thúy Vân", phone: "0922334455" },
          { name: "Lê Gia Bảo", phone: "0933445566" },
          { name: "Vũ Tuấn Tú", phone: "0944556677" }
        ],
        createdAt: Date.now() - 86400000 * 2,
      }
    ];
  });

  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("class-1");

  // Test Attempts list with localStorage hydration & default mock performance database
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(() => {
    const saved = localStorage.getItem("minion_attempts");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "att-1",
        studentName: "Bé Minh Anh",
        classId: "class-1",
        className: "Lớp Lá mầm non 🌟",
        lessonId: "lesson-1",
        lessonTitle: "🤖 Từ Vựng Động Vật Đáng Yêu",
        score: 100,
        level: "preschool",
        timestamp: Date.now() - 3600000 * 4,
        teacherName: "Cô Thảo"
      },
      {
        id: "att-2",
        studentName: "Bé Bảo Nam",
        classId: "class-1",
        className: "Lớp Lá mầm non 🌟",
        lessonId: "lesson-1",
        lessonTitle: "🤖 Từ Vựng Động Vật Đáng Yêu",
        score: 80,
        level: "preschool",
        timestamp: Date.now() - 3600000 * 24,
        teacherName: "Cô Thảo"
      },
      {
        id: "att-3",
        studentName: "Nguyễn Hoàng Lâm",
        classId: "class-2",
        className: "Lớp 3A Tiểu học 🦁",
        lessonId: "lesson-1",
        lessonTitle: "🤖 Từ Vựng Động Vật Đáng Yêu",
        score: 90,
        level: "elementary",
        timestamp: Date.now() - 3600000 * 2,
        teacherName: "Thầy Hùng"
      }
    ];
  });

  // Logged-in current student profile
  const [loggedInStudent, setLoggedInStudent] = useState<{
    name: string;
    classId: string;
    className: string;
    teacherName: string;
  } | null>(() => {
    const saved = localStorage.getItem("minion_student_session");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: localStorage.getItem("minion_student_name") || "",
      classId: "free",
      className: "Lớp Học Cô Phượng Uyên",
      teacherName: "Cô Phượng Uyên"
    };
  });

  // Phone number linking states for student
  const [studentPhoneInput, setStudentPhoneInput] = useState("");
  const [isLinkingPhone, setIsLinkingPhone] = useState(false);
  const [phoneLinkError, setPhoneLinkError] = useState<string | null>(null);
  const [phoneLinkSuccess, setPhoneLinkSuccess] = useState<string | null>(null);
  const [studentLoginMode, setStudentLoginMode] = useState<"phone" | "manual">("manual");

  // UI inputs - Student Profile entry on landing page
  const [studentSelectClassId, setStudentSelectClassId] = useState("class-1");
  const [studentSelectName, setStudentSelectName] = useState("");
  const [studentCustomName, setStudentCustomName] = useState(() => {
    const saved = localStorage.getItem("minion_student_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed.name;
      } catch (e) {}
    }
    return localStorage.getItem("minion_student_name") || "";
  });
  const [studentTeacherInput, setStudentTeacherInput] = useState("Cô Phượng Uyên");

  // UI inputs - Class creation state
  const [newClassNameInput, setNewClassNameInput] = useState("");
  // UI inputs - Students structural roster
  const [newClassStudents, setNewClassStudents] = useState<{ name: string; phone: string }[]>([
    { name: "", phone: "" }
  ]);

  // Teacher Input State for Lesson Generation
  const [teacherTopic, setTeacherTopic] = useState("");
  const [teacherLevel, setTeacherLevel] = useState<"preschool" | "elementary">("preschool");
  const [teacherUploadText, setTeacherUploadText] = useState("");
  const [teacherClassroomId, setTeacherClassroomId] = useState<string>("");
  const [teacherDeadline, setTeacherDeadline] = useState<string>("");
  const [teacherUploadedFile, setTeacherUploadedFile] = useState<{ name: string; base64: string; type: string } | null>(null);

  // Student AI Lesson Creator States
  const [studentTopic, setStudentTopic] = useState("");
  const [studentRawContent, setStudentRawContent] = useState("");
  const [studentLevel, setStudentLevel] = useState<string>("starter");
  const [language, setLanguage] = useState<"en" | "bilingual">("en");
  const [createMethod, setCreateMethod] = useState<"topic" | "text" | "image">("topic");
  
  const t = (en: string, vi: string) => {
    return en;
  };

  const [studentUploadedFile, setStudentUploadedFile] = useState<{ name: string; base64: string; type: string } | null>(null);
  const [isStudentDraggingFile, setIsStudentDraggingFile] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [apiSuccessMsg, setApiSuccessMsg] = useState<string | null>(null);
  const [showStudentRecentLessonsModal, setShowStudentRecentLessonsModal] = useState(false);
  const [hasAutoOpenedRecentLessons, setHasAutoOpenedRecentLessons] = useState(false);


  // Auto-connect/link student with the newly created lessons of their class
  useEffect(() => {
    if (loggedInStudent && lessonsList.length > 0) {
      const classLessons = lessonsList.filter((l) => l.classId === loggedInStudent.classId);
      if (classLessons.length > 0) {
        // Sort by createdAt descending to get the newest lesson for this classroom
        const sorted = [...classLessons].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const latestClassLesson = sorted[0];
        
        // Check if the current selectedLessonId belongs to this student's class
        const currentLesson = lessonsList.find((l) => l.id === selectedLessonId);
        const currentBelongsToClass = currentLesson && currentLesson.classId === loggedInStudent.classId;
        
        // If the current selected lesson doesn't belong to the student's class (e.g. it's the global animal lesson),
        // or if it's missing, automatically switch them to the latest class lesson!
        if (!currentBelongsToClass) {
          setSelectedLessonId(latestClassLesson.id);
          setActiveWordIdx(0);
        }
      }
    }
  }, [loggedInStudent, lessonsList, selectedLessonId]);

  // Student list inline edit and single addition states
  const [editingStudentIdx, setEditingStudentIdx] = useState<number | null>(null);
  const [editStudentName, setEditStudentName] = useState("");
  const [editStudentPhone, setEditStudentPhone] = useState("");
  const [addStudentName, setAddStudentName] = useState("");
  const [addStudentPhone, setAddStudentPhone] = useState("");

  // Student Learning interactions state
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Gamification & Star stats from localStorage
  const [currentGoldStars, setCurrentGoldStars] = useState<number>(() => {
    const saved = localStorage.getItem("minion_stars");
    return saved ? Number(saved) : 150;
  });
  const [showStarPopEffect, setShowStarPopEffect] = useState(false);

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  };

  const [dailyStars, setDailyStars] = useState<number>(() => {
    const todayStr = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
    const savedDay = localStorage.getItem("daily_stars_day");
    if (savedDay === todayStr) {
      const savedStars = localStorage.getItem("daily_stars_count");
      return savedStars ? Number(savedStars) : 0;
    }
    return 0;
  });

  useEffect(() => {
    const todayStr = getTodayString();
    localStorage.setItem("daily_stars_day", todayStr);
    localStorage.setItem("daily_stars_count", String(dailyStars));
  }, [dailyStars]);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [quizSettingsCount, setQuizSettingsCount] = useState<10 | 20 | 30>(10);

  const [studySessions, setStudySessions] = useState<StudentStudySession[]>(() => {
    const saved = localStorage.getItem("minion_study_sessions");
    if (saved) {
      try {
        const parsed: StudentStudySession[] = JSON.parse(saved);
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return parsed.filter((s) => s.timestamp >= oneWeekAgo);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const activeSessions = studySessions.filter((s) => s.timestamp >= oneWeekAgo);
    localStorage.setItem("minion_study_sessions", JSON.stringify(activeSessions));
  }, [studySessions]);

  // Active quiz & games triggers
  const [activeTestActive, setActiveTestActive] = useState(false);
  const [activeGamesActive, setActiveGamesActive] = useState(false);
  const [testReport, setTestReport] = useState<TestResult | null>(null);

  // Certificate Modal State
  const [selectedCertificateAttempt, setSelectedCertificateAttempt] = useState<TestAttempt | null>(null);
  const [certStudentName, setCertStudentName] = useState("");
  const [certTeacherName, setCertTeacherName] = useState("");
  const [certScore, setCertScore] = useState(100);
  const [certLessonTitle, setCertLessonTitle] = useState("");
  const [certDate, setCertDate] = useState("");

  const studentLessons = lessonsList.filter((lesson) => {
    if (!loggedInStudent) return false;
    const hasBeenStudiedThisWeek = studySessions.some(
      (s) =>
        s.lessonId === lesson.id &&
        s.studentName.toLowerCase() === loggedInStudent.name.toLowerCase() &&
        s.classId === loggedInStudent.classId &&
        s.timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    return (
      lesson.classId === loggedInStudent.classId ||
      !lesson.classId ||
      lesson.id === selectedLessonId ||
      hasBeenStudiedThisWeek
    );
  });

  const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const lastMonthLessons = studentLessons.filter((lesson) => (lesson.createdAt || Date.now()) >= oneMonthAgo);
  const lessonsToDisplay = lastMonthLessons.length > 0 ? lastMonthLessons : studentLessons;

  const activeLesson = lessonsList.find((l) => l.id === selectedLessonId) ||
    (loggedInStudent
      ? (lessonsList.find((l) => l.classId === loggedInStudent.classId) ||
         lessonsList.find((l) => !l.classId) ||
         lessonsList[0])
      : lessonsList[0]);

  const activeClassroom =
    classroomsList.find((c) => c.id === selectedClassroomId) || classroomsList[0];

  // Dynamic Level auto-calculations based on stars
  useEffect(() => {
    const calculatedLevel = Math.max(1, Math.floor(currentGoldStars / 100) + 1);
    if (calculatedLevel !== currentLevel) {
      setCurrentLevel(calculatedLevel);
    }
  }, [currentGoldStars]);

  // Synchronizers to localStorage
  useEffect(() => {
    localStorage.setItem("minion_lessons", JSON.stringify(lessonsList));
  }, [lessonsList]);

  useEffect(() => {
    localStorage.setItem("minion_classrooms", JSON.stringify(classroomsList));
  }, [classroomsList]);

  useEffect(() => {
    localStorage.setItem("minion_attempts", JSON.stringify(testAttempts));
  }, [testAttempts]);

  useEffect(() => {
    localStorage.setItem("minion_stars", String(currentGoldStars));
  }, [currentGoldStars]);

  useEffect(() => {
    if (loggedInStudent) {
      localStorage.setItem("minion_student_session", JSON.stringify(loggedInStudent));
    } else {
      localStorage.removeItem("minion_student_session");
    }
  }, [loggedInStudent]);

  // Handle Shared Lesson Deep Link loading
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedLessonId = params.get("lessonId");
    if (sharedLessonId) {
      const match = lessonsList.find((l) => l.id === sharedLessonId);
      if (match) {
        setSelectedLessonId(sharedLessonId);
        setActiveWordIdx(0);
        // Load default/previous student session if exists, otherwise open student screen directly
        setActivePortal("student");
        playSound.playSuccess();
        setApiSuccessMsg("🎈 Đã tải bài tập tiếng Anh chia sẻ trực tiếp từ Thầy Cô chuẩn xác!");
        // Clear param to avoid annoying pop-up repetition
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [lessonsList]);

  // Copy Link button handler
  const handleCopyShareLink = (lessonId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?lessonId=${lessonId}`;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
      } else {
        // Fallback for isolated framework iframes
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      playSound.playSuccess();
      setApiSuccessMsg("🔗 Đã sao chép liên kết chia sẻ của bài học! Thầy Cô có thể gửi link này cho Học Sinh.");
      setTimeout(() => setApiSuccessMsg(null), 8000);
    } catch (e) {
      alert(`Hãy sao chép thủ công liên kết bài học này nhé:\n${url}`);
    }
  };

  // Award stars with visual pop feedback notifier
  const triggerStarAward = (amt: number) => {
    setCurrentGoldStars((prev) => prev + amt);
    setDailyStars((prev) => prev + amt);
    setShowStarPopEffect(true);
    setTimeout(() => {
      setShowStarPopEffect(false);
    }, 1200);
  };

  // Actual study entrance helper with star reward
  const enterLessonToStudy = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setActiveWordIdx(0);
    setIsFlipped(false);
    playSound.playClick();

    if (!loggedInStudent) return;
    const studentName = loggedInStudent.name;
    const classId = loggedInStudent.classId || "free";

    // Add study session record
    const newSession: StudentStudySession = {
      lessonId,
      studentName,
      classId,
      timestamp: Date.now()
    };

    setStudySessions((prev) => {
      // Keep only one latest entry per student/class/lesson
      const filtered = prev.filter(
        (s) => !(s.lessonId === lessonId && s.studentName.toLowerCase() === studentName.toLowerCase() && s.classId === classId)
      );
      return [newSession, ...filtered];
    });

    // Reward entry stars: "vào học thực tế"
    // Award +10 stars once per lesson per day
    const todayStr = getTodayString();
    const storageKey = `entered_${studentName.replace(/\s+/g, "_")}_${classId}_${lessonId}_${todayStr}`;
    const alreadyAwardedToday = localStorage.getItem(storageKey);
    if (!alreadyAwardedToday) {
      triggerStarAward(10);
      localStorage.setItem(storageKey, "true");
      setApiSuccessMsg(`🎉 You have entered the lesson "${lessonsList.find(l => l.id === lessonId)?.title || ''}"! Earned +10 Gold Stars! 🎒`);
      setTimeout(() => setApiSuccessMsg(null), 4000);
    } else {
      setApiSuccessMsg(`📖 Re-studying lesson: "${lessonsList.find(l => l.id === lessonId)?.title || ''}"!`);
      setTimeout(() => setApiSuccessMsg(null), 3000);
    }
  };

  // Vocal recognition sample completion
  const handleVocalComplete = (url: string) => {
    playSound.playSuccess();
    triggerStarAward(15);
  };

  // Switch Word Flash Card helper
  const nextWord = () => {
    if (!activeLesson) return;
    playSound.playClick();
    setIsFlipped(false);
    setActiveWordIdx((idx) => (idx + 1) % activeLesson.words.length);
    // Tiny incentive for flipping lessons catalog
    triggerStarAward(1);
  };

  const prevWord = () => {
    if (!activeLesson) return;
    playSound.playClick();
    setIsFlipped(false);
    setActiveWordIdx((idx) => (idx - 1 + activeLesson.words.length) % activeLesson.words.length);
    triggerStarAward(1);
  };

  // Switch student profile session login on landing page
  const handleStudentProfileSelectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedName = studentCustomName.trim() || "Bé Học Tiếng Anh";
    
    // Sync latest lessons database from server
    try {
      const resLessons = await fetch("/api/lessons");
      if (resLessons.ok) {
        const data = await resLessons.json();
        if (data && data.length > 0) setLessonsList(data);
      }
    } catch (err) {
      console.warn("Lỗi tải bài học khi đăng nhập:", err);
    }

    // Save login structure
    setLoggedInStudent({
      name: matchedName,
      classId: "class-1",
      className: "Lớp Học Cô Phượng Uyên",
      teacherName: studentTeacherInput || "Cô Phượng Uyên"
    });

    playSound.playSuccess();
    setActivePortal("student");
    setActiveTab("create"); // Take them directly to the AI creation tab as requested
  };

  // Load backend data from Express on startup
  useEffect(() => {
    const loadApiData = async () => {
      try {
        const resLessons = await fetch("/api/lessons");
        if (resLessons.ok) {
          const data = await resLessons.json();
          if (data && data.length > 0) setLessonsList(data);
        }
      } catch (err) { console.error("Error fetching lessons", err); }

      try {
        const resClassrooms = await fetch("/api/classrooms");
        if (resClassrooms.ok) {
          const data = await resClassrooms.json();
          if (data && data.length > 0) setClassroomsList(data);
        }
      } catch (err) { console.error("Error fetching classrooms", err); }

      try {
        const resAttempts = await fetch("/api/attempts");
        if (resAttempts.ok) {
          const data = await resAttempts.json();
          if (data && data.length > 0) setTestAttempts(data);
        }
      } catch (err) { console.error("Error fetching attempts", err); }
    };
    loadApiData();
  }, []);

  // Handle Resolution and Linking of Student by Phone Number
  const handlePhoneLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = studentPhoneInput.trim().replace(/[\s-]/g, "");
    if (!cleanPhone) {
      setPhoneLinkError("Vui lòng nhập số điện thoại của học viên!");
      return;
    }

    setIsLinkingPhone(true);
    setPhoneLinkError(null);
    setPhoneLinkSuccess(null);

    // Sync latest lessons and classrooms database from server first so student browser immediately represents new teacher creations
    try {
      const resLessons = await fetch("/api/lessons");
      if (resLessons.ok) {
        const lData = await resLessons.json();
        if (lData && lData.length > 0) setLessonsList(lData);
      }
    } catch (err) {
      console.warn("Lỗi đồng bộ bài học:", err);
    }

    try {
      const response = await fetch(`/api/student/resolve?phone=${encodeURIComponent(cleanPhone)}`);
      if (response.ok) {
        const data = await response.json();
        setLoggedInStudent({
          name: data.name,
          classId: data.classId,
          className: data.className,
          teacherName: data.teacherName,
        });

        if (data.linkedLesson) {
          setSelectedLessonId((prev) => (prev && prev !== "lesson-1") ? prev : data.linkedLesson.id);
        }

        localStorage.setItem("minion_student_session", JSON.stringify({
          name: data.name,
          classId: data.classId,
          className: data.className,
          teacherName: data.teacherName,
        }));

        playSound.playSuccess();
        setPhoneLinkSuccess(`🎉 Liên kết thành công! Chào Bé ${data.name}, con đã được kết nối đến lớp "${data.className}" của ${data.teacherName}.`);
        
        setTimeout(() => {
          setActivePortal("student");
          setPhoneLinkSuccess(null);
        }, 1500);
      } else {
        const errData = await response.json();
        setPhoneLinkError(errData.error || "Không tìm thấy số điện thoại!");
        playSound.playFail();
      }
    } catch (err) {
      console.error(err);
      // Offline fallback
      const foundClass = classroomsList.find(c => 
        c.students.some(s => s.phone.replace(/[\s-]/g, "") === cleanPhone)
      );
      if (foundClass) {
        const foundStudent = foundClass.students.find(s => s.phone.replace(/[\s-]/g, "") === cleanPhone);
        if (foundStudent) {
          const isMamNon = foundClass.name.toLowerCase().includes("mầm") || foundClass.name.toLowerCase().includes("lá");
          const teacherName = isMamNon ? "Cô Thảo" : "Thầy Hùng";
          setLoggedInStudent({
            name: foundStudent.name,
            classId: foundClass.id,
            className: foundClass.name,
            teacherName: teacherName
          });
          playSound.playSuccess();
          setPhoneLinkSuccess(`🎉 Kết nối thành công bé ${foundStudent.name} (lớp ${foundClass.name})`);
          setTimeout(() => {
            setActivePortal("student");
            setPhoneLinkSuccess(null);
          }, 1500);
          return;
        }
      }
      setPhoneLinkError("Không tìm thấy lớp học nào khớp với số điện thoại này! Hãy nhờ Thầy Cô nhập số điện thoại của con vào thông tin học viên nhé.");
      playSound.playFail();
    } finally {
      setIsLinkingPhone(false);
    }
  };

  // Teacher portal - Create Class submission
  const handleCreateClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassNameInput.trim()) {
      alert("Hãy điền tên lớp học ví dụ: Lớp Lá 1!");
      return;
    }

    const finalStudents = newClassStudents
      .map(s => ({
        name: s.name.trim(),
        phone: s.phone.trim().replace(/[\s-]/g, "")
      }))
      .filter(s => s.name.length > 0 && s.phone.length > 0);

    if (finalStudents.length === 0) {
      alert("Hãy điền đầy đủ họ tên học sinh và số điện thoại thực tế của ít nhất 1 học viên!");
      return;
    }

    const classroomPayload = {
      name: newClassNameInput.trim(),
      students: finalStudents
    };

    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(classroomPayload)
      });
      if (res.ok) {
        const data = await res.json();
        const createdClass = data.classroom;
        setClassroomsList(prev => [createdClass, ...prev.filter(c => c.id !== createdClass.id)]);
        setSelectedClassroomId(createdClass.id);
        setApiSuccessMsg(`🎉 Tạo lớp "${createdClass.name}" thành công với ${createdClass.students.length} học viên có sđt thực tế!`);
      } else {
        throw new Error("API post classrooms failed");
      }
    } catch (err) {
      console.error(err);
      // Fallback local save
      const fallbackClass: Classroom = {
        id: `class-${Date.now()}`,
        name: newClassNameInput.trim(),
        students: finalStudents,
        createdAt: Date.now()
      };
      setClassroomsList(prev => [fallbackClass, ...prev]);
      setSelectedClassroomId(fallbackClass.id);
      setApiSuccessMsg(`🎉 [Ngoại tuyến] Tạo lớp "${fallbackClass.name}" thành công!`);
    }

    setNewClassNameInput("");
    setNewClassStudents([{ name: "", phone: "" }]);
    playSound.playSuccess();
  };

  // Teacher portal - Delete specific classroom helper
  const handleDeleteClass = async (id: string) => {
    if (confirm("Thầy Cô có chắc chắn muốn xóa lớp học này không? (Toàn bộ danh sách học sinh sẽ bị gỡ bỏ)")) {
      try {
        await fetch("/api/classrooms/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
      } catch (err) { console.error("Error deleting classroom", err); }

      setClassroomsList(prev => prev.filter(c => c.id !== id));
      playSound.playClick();
    }
  };

  // Add a new student to the active class
  const handleAddStudentToClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClassroom) {
      alert("Vui lòng chọn hoặc tạo lớp học trước!");
      return;
    }
    const cleanName = addStudentName.trim();
    const cleanPhone = addStudentPhone.trim().replace(/[\s-]/g, "");

    if (!cleanName || !cleanPhone) {
      alert("Vui lòng nhập đầy đủ Họ tên và Số điện thoại!");
      return;
    }

    // Check if duplicate student in the same class
    const duplicate = activeClassroom.students.some(
      (s) => s.name.toLowerCase() === cleanName.toLowerCase() || s.phone === cleanPhone
    );
    if (duplicate) {
      if (!confirm("Bé có tên hoặc SĐT này đã tồn tại trong lớp. Thầy Cô có muốn tiếp tục thêm?")) {
        return;
      }
    }

    const updatedStudents = [...activeClassroom.students, { name: cleanName, phone: cleanPhone }];
    
    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeClassroom.id,
          name: activeClassroom.name,
          students: updatedStudents,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedClass = data.classroom;
        setClassroomsList((prev) =>
          prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
        );
        setAddStudentName("");
        setAddStudentPhone("");
        setApiSuccessMsg(`🎉 Đã thêm thành công học sinh "${cleanName}" vào lớp "${activeClassroom.name}"!`);
        playSound.playSuccess();
      } else {
        throw new Error("API failed");
      }
    } catch (err) {
      console.error("Lỗi thêm bé vào lớp", err);
      // Fallback update on UI
      const fallbackClass = { ...activeClassroom, students: updatedStudents };
      setClassroomsList((prev) =>
        prev.map((c) => (c.id === fallbackClass.id ? fallbackClass : c))
      );
      setAddStudentName("");
      setAddStudentPhone("");
      setApiSuccessMsg(`🎉 Đã cập nhật ngoại tuyến học sinh "${cleanName}"!`);
    }
  };

  // Edit / Save details of a student
  const handleSaveEditedStudent = async (studentIdx: number) => {
    if (!activeClassroom) return;
    const cleanName = editStudentName.trim();
    const cleanPhone = editStudentPhone.trim().replace(/[\s-]/g, "");

    if (!cleanName || !cleanPhone) {
      alert("Vui lòng nhập đầy đủ tên và số điện thoại học sinh!");
      return;
    }

    const updatedStudents = activeClassroom.students.map((student, idx) => {
      if (idx === studentIdx) {
        return { name: cleanName, phone: cleanPhone };
      }
      return student;
    });

    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeClassroom.id,
          name: activeClassroom.name,
          students: updatedStudents,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedClass = data.classroom;
        setClassroomsList((prev) =>
          prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
        );
        setEditingStudentIdx(null);
        setApiSuccessMsg(`📝 Đã cập nhật thành công thông tin học sinh!`);
        playSound.playSuccess();
      } else {
        throw new Error("API update failed");
      }
    } catch (err) {
      console.error("Lỗi cập nhật học sinh", err);
      const fallbackClass = { ...activeClassroom, students: updatedStudents };
      setClassroomsList((prev) =>
        prev.map((c) => (c.id === fallbackClass.id ? fallbackClass : c))
      );
      setEditingStudentIdx(null);
      setApiSuccessMsg(`📝 Đã cập nháp ngoại tuyến thông tin học sinh!`);
    }
  };

  // Open Achievement Certificate
  const openCertificate = (attempt: TestAttempt) => {
    setCertStudentName(attempt.studentName);
    setCertTeacherName(attempt.teacherName || "Cô Thảo");
    setCertScore(attempt.score);
    setCertLessonTitle(attempt.lessonTitle);
    
    const d = new Date(attempt.timestamp);
    setCertDate(`Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`);
    
    setSelectedCertificateAttempt(attempt);
    playSound.playFanfare();
  };

  // API Trigger: Generate Lesson with Gemini
  const handleGenerateLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherTopic && !teacherUploadText && !teacherUploadedFile) {
      alert("Hãy nhập chủ đề bài học, danh sách từ hoặc tải tệp tài liệu nhé!");
      return;
    }
    if (!teacherClassroomId) {
      alert("Vui lòng chọn lớp học áp dụng cho bài học này!");
      return;
    }

    setIsGenerating(true);
    setApiSuccessMsg(null);
    playSound.playClick();

    try {
      const response = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: teacherTopic || undefined,
          rawContent: teacherUploadText || undefined,
          level: teacherLevel,
          fileData: teacherUploadedFile ? teacherUploadedFile.base64 : undefined,
          fileMime: teacherUploadedFile ? teacherUploadedFile.type : undefined,
        }),
      });

      const data = await response.json();
      const parsedDeadline = teacherDeadline ? new Date(teacherDeadline).getTime() : undefined;

      if (response.ok && data.words && data.words.length > 0) {
        let lessonTitle = data.title;
        if (!lessonTitle) {
          if (teacherTopic) {
            lessonTitle = `Bài học: ${teacherTopic}`;
          } else if (teacherUploadedFile) {
            lessonTitle = `📄 Giáo trình tệp: ${teacherUploadedFile.name}`;
          } else {
            lessonTitle = "Tập từ vựng tự soạn";
          }
        }

        const newLesson: Lesson = {
          id: `lesson-${Date.now()}`,
          title: lessonTitle,
          level: teacherLevel,
          words: data.words,
          createdAt: Date.now(),
          classId: teacherClassroomId,
          deadline: parsedDeadline,
        };

        try {
          await fetch("/api/lessons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLesson),
          });
        } catch (err) {
          console.error("Lỗi đồng bộ bài học lên máy chủ", err);
        }

        setLessonsList((prev) => [newLesson, ...prev]);
        setSelectedLessonId(newLesson.id);
        setActiveWordIdx(0);
        setTeacherTopic("");
        setTeacherUploadText("");
        setTeacherUploadedFile(null);
        setTeacherClassroomId("");
        setTeacherDeadline("");
        
        if (data.fallback) {
          setApiSuccessMsg(data.errorMsg || "✨ Đã khởi tạo bài học thông minh dự phòng siêu dễ thương thành công!");
        } else {
          setApiSuccessMsg("🎉 Tuyệt vời! Giáo án tiếng Anh ngộ nghĩnh đã được khởi tạo thành công chuẩn giáo trình!");
        }
        playSound.playSuccess();
      } else {
        throw new Error(data.error || "Không thể nhận diện cấu trúc bài học");
      }
    } catch (err: any) {
      console.warn(err);
      // Load standard local fallback words for immediate resilience so there's never a broken state
      const fallbackTitle = teacherTopic ? `🎈 Giáo án: ${teacherTopic}` : "🎈 Giáo án Tiếng Anh";
      
      // If user provided a word list, build fallback from their actual words
      let defaultSamples: any[];
      if (teacherUploadText && teacherUploadText.trim()) {
        const inputItems = parseRawContentClient(teacherUploadText);
        defaultSamples = inputItems.map((item, idx) => {
          const capitalizedWord = item.english.charAt(0).toUpperCase() + item.english.slice(1);
          const isSentence = item.english.trim().split(/\s+/).length > 1;
          const dictEntry = getOrGenerateEntryClient(capitalizedWord);
          const translation = item.vietnamese || (dictEntry ? dictEntry.translation : capitalizedWord);
          const fallbackPhonetic = `/${item.english.toLowerCase().replace(/[^a-z\s]/g, "")}/`;
          
          return {
            id: `fa-input-${idx}`,
            word: capitalizedWord,
            translation: translation,
            phonetic: dictEntry ? dictEntry.phonetic : fallbackPhonetic,
            sentence: isSentence ? capitalizedWord : (dictEntry && dictEntry.sentence ? dictEntry.sentence : `I like my ${item.english.toLowerCase()}.`),
            sentenceTranslation: isSentence ? translation : (dictEntry && dictEntry.sentenceTranslation ? dictEntry.sentenceTranslation : `Tôi yêu ${translation.toLowerCase()} của tôi.`),
            illustration: getFallbackIllustrationClient(item.english),
            category: teacherTopic || "Uploaded List",
          };
        });
      } else {
        defaultSamples = teacherLevel === "preschool" ? [
          { id: "fa1", word: "Cat", translation: "Con mèo", phonetic: "/kæt/", sentence: "The little cat says meow meow.", sentenceTranslation: "Chú mèo nhỏ kêu meow meow.", illustration: "🐱", category: "Animals" },
          { id: "fa2", word: "Dog", translation: "Con chó", phonetic: "/dɒɡ/", sentence: "The happy dog wags its tail.", sentenceTranslation: "Chú chó vui vẻ vẫy đuôi.", illustration: "🐶", category: "Animals" },
          { id: "fa3", word: "Monkey", translation: "Con khỉ", phonetic: "/ˈmʌŋ.ki/", sentence: "The monkey loves eating sweet bananas.", sentenceTranslation: "Chú khỉ thích ăn những quả chuối ngọt lịm.", illustration: "🐵", category: "Animals" }
        ] : [
          { id: "fs1", word: "Book", translation: "Quyển sách", phonetic: "/bʊk/", sentence: "This book has funny stories.", sentenceTranslation: "Quyển sách này có những câu chuyện thú vị.", illustration: "📕", category: "School" },
          { id: "fs2", word: "Pencil", translation: "Bút chì", phonetic: "/ˈpen.səl/", sentence: "I draw a smiling flower with my pencil.", sentenceTranslation: "Tớ vẽ một bông hoa mỉm cười bằng bút chì của tớ.", illustration: "✏️", category: "School" }
        ];
      }

      const parsedDeadline = teacherDeadline ? new Date(teacherDeadline).getTime() : undefined;
      const newLesson: Lesson = {
        id: `lesson-${Date.now()}`,
        title: fallbackTitle,
        level: teacherLevel,
        words: defaultSamples,
        createdAt: Date.now(),
        classId: teacherClassroomId,
        deadline: parsedDeadline,
      };

      setLessonsList((prev) => [newLesson, ...prev]);
      setSelectedLessonId(newLesson.id);
      setActiveWordIdx(0);
      setTeacherTopic("");
      setTeacherUploadText("");
      setTeacherUploadedFile(null);
      setTeacherClassroomId("");
      setTeacherDeadline("");
      setApiSuccessMsg("🎒 Đã thiết kế bộ từ vựng thông minh dự phòng cực kỳ sinh động cho bé tương tác!");
      playSound.playSuccess();
    } finally {
      setIsGenerating(false);
    }
  };

  // Student API Trigger: Generate Lesson with Gemini (by topic, content, or file)
  const handleStudentGenerateLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedName = studentCustomName.trim();
    if (!matchedName) {
      alert("Con hãy nhập tên của con ở ô phía trên trước nhe! ⭐");
      return;
    }
    if (!studentTopic && !studentRawContent && !studentUploadedFile) {
      alert("Con hãy nhập chủ đề hoặc tải tệp ảnh/PDF bài tập lên nhé!");
      return;
    }

    const studentProfile = {
      name: matchedName,
      classId: "free",
      className: "Lớp Học Cô Phượng Uyên",
      teacherName: "Cô Phượng Uyên"
    };

    // Save profile to state and storage
    setLoggedInStudent(studentProfile);
    localStorage.setItem("minion_student_name", matchedName);
    localStorage.setItem("minion_student_session", JSON.stringify(studentProfile));

    setIsGenerating(true);
    setApiSuccessMsg(null);
    playSound.playClick();

    try {
      const response = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: studentTopic || undefined,
          rawContent: studentRawContent || undefined,
          level: studentLevel,
          fileData: studentUploadedFile ? studentUploadedFile.base64 : undefined,
          fileMime: studentUploadedFile ? studentUploadedFile.type : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.words && data.words.length > 0) {
        let lessonTitle = data.title;
        if (!lessonTitle) {
          if (studentTopic) {
            lessonTitle = `🪄 AI: ${studentTopic}`;
          } else if (studentUploadedFile) {
            lessonTitle = `📄 Tự tạo từ tệp: ${studentUploadedFile.name}`;
          } else if (studentRawContent) {
            lessonTitle = `📝 Từ vựng tự soạn`;
          } else {
            lessonTitle = `🎈 Bài học tự do`;
          }
        }

        const newLesson: Lesson = {
          id: `lesson-${Date.now()}`,
          title: lessonTitle,
          level: studentLevel,
          words: data.words,
          createdAt: Date.now(),
          classId: studentProfile.classId,
        };

        try {
          await fetch("/api/lessons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newLesson),
          });
        } catch (err) {
          console.error("Lỗi đồng bộ bài học lên máy chủ", err);
        }

        setLessonsList((prev) => [newLesson, ...prev]);
        setSelectedLessonId(newLesson.id);
        setActiveWordIdx(0);
        setIsFlipped(false);

        // Log to study history
        const studentName = studentProfile.name;
        const classId = studentProfile.classId;
        const newSess: StudentStudySession = {
          lessonId: newLesson.id,
          studentName,
          classId,
          timestamp: Date.now()
        };
        setStudySessions((prev) => [newSess, ...prev.filter(s => !(s.lessonId === newLesson.id && s.studentName.toLowerCase() === studentName.toLowerCase() && s.classId === classId))]);
        const todayStr = getTodayString();
        const storageKey = `entered_${studentName.replace(/\s+/g, "_")}_${classId}_${newLesson.id}_${todayStr}`;
        localStorage.setItem(storageKey, "true");
        
        // Reset student creator inputs
        setStudentTopic("");
        setStudentRawContent("");
        setStudentUploadedFile(null);
        
        triggerStarAward(15); // Award 15 golden stars to students for generation!
        setApiSuccessMsg(`🎉 Bé tạo bài học "${newLesson.title}" bằng AI thành công! Hãy học ngay thôi con nhé! 💕 +15 Sao Vàng 🌟`);
        playSound.playSuccess();
        setActivePortal("student");
        setActiveTab("learn"); // Go back to learn tab immediately
      } else {
        throw new Error(data.error || "Không thể nhận diện cấu trúc bài học");
      }
    } catch (err: any) {
      console.warn("Lỗi tạo bài học của học sinh, chuyển sang fallback:", err);
      // Fallback words
      const fallbackTitle = studentTopic ? `🎈 AI: ${studentTopic}` : "🎈 Bài Học Tiếng Anh";
      
      // If user provided a word list, build fallback from their actual words
      let defaultSamples: any[];
      if (studentRawContent && studentRawContent.trim()) {
        const inputItems = parseRawContentClient(studentRawContent);
        defaultSamples = inputItems.map((item, idx) => {
          const capitalizedWord = item.english.charAt(0).toUpperCase() + item.english.slice(1);
          const isSentence = item.english.trim().split(/\s+/).length > 1;
          const dictEntry = getOrGenerateEntryClient(capitalizedWord);
          const translation = item.vietnamese || (dictEntry ? dictEntry.translation : capitalizedWord);
          const fallbackPhonetic = `/${item.english.toLowerCase().replace(/[^a-z\s]/g, "")}/`;
          
          return {
            id: `sfa-input-${idx}`,
            word: capitalizedWord,
            translation: translation,
            phonetic: dictEntry ? dictEntry.phonetic : fallbackPhonetic,
            sentence: isSentence ? capitalizedWord : (dictEntry && dictEntry.sentence ? dictEntry.sentence : `I like my ${item.english.toLowerCase()}.`),
            sentenceTranslation: isSentence ? translation : (dictEntry && dictEntry.sentenceTranslation ? dictEntry.sentenceTranslation : `Tôi yêu ${translation.toLowerCase()} của tôi.`),
            illustration: getFallbackIllustrationClient(item.english),
            category: studentTopic || "Uploaded List",
          };
        });
      } else {
        defaultSamples = (studentLevel === "pre-starter" || studentLevel === "starter" || studentLevel === "preschool") ? [
          { id: "sfa1", word: "Apple", translation: "Quả táo", phonetic: "/ˈæp.əl/", sentence: "The red apple is sweet.", sentenceTranslation: "Quả táo đỏ rất là ngọt.", illustration: "🍎", category: "Fruits" },
          { id: "sfa2", word: "Banana", translation: "Quả chuối", phonetic: "/bəˈnɑː.nə/", sentence: "A yellow banana is yummy.", sentenceTranslation: "Quả chuối vàng ăn thật là ngon lành.", illustration: "🍌", category: "Fruits" },
          { id: "sfa3", word: "Orange", translation: "Quả cam", phonetic: "/ˈɒr.ɪndʒ/", sentence: "I love drinking orange juice.", sentenceTranslation: "Tớ rất thích uống nước cam.", illustration: "🍊", category: "Fruits" }
        ] : [
          { id: "sfs1", word: "Computer", translation: "Máy tính", phonetic: "/kəmˈpjuː.tər/", sentence: "We play fun educational games on the computer.", sentenceTranslation: "Chúng tớ chơi những trò chơi học tập bổ ích trên máy tính.", illustration: "💻", category: "Tech" },
          { id: "sfs2", word: "Schoolbag", translation: "Cặp sách", phonetic: "/ˈskuːl.bæɡ/", sentence: "I put my new books inside my schoolbag.", sentenceTranslation: "Tớ cất những quyển sách mới vào trong cặp học sinh của tớ.", illustration: "🎒", category: "School" }
        ];
      }

      const newLesson: Lesson = {
        id: `lesson-${Date.now()}`,
        title: fallbackTitle,
        level: studentLevel,
        words: defaultSamples,
        createdAt: Date.now(),
        classId: studentProfile.classId,
      };

      setLessonsList((prev) => [newLesson, ...prev]);
      setSelectedLessonId(newLesson.id);
      setActiveWordIdx(0);
      setIsFlipped(false);

      // Log to study history
      const studentName = studentProfile.name;
      const classId = studentProfile.classId;
      const newSess: StudentStudySession = {
        lessonId: newLesson.id,
        studentName,
        classId,
        timestamp: Date.now()
      };
      setStudySessions((prev) => [newSess, ...prev.filter(s => !(s.lessonId === newLesson.id && s.studentName.toLowerCase() === studentName.toLowerCase() && s.classId === classId))]);
      const todayStr = getTodayString();
      const storageKey = `entered_${studentName.replace(/\s+/g, "_")}_${classId}_${newLesson.id}_${todayStr}`;
      localStorage.setItem(storageKey, "true");
      
      setStudentTopic("");
      setStudentRawContent("");
      setStudentUploadedFile(null);
      
      triggerStarAward(15);
      setApiSuccessMsg("🎉 Đã thiết kế bộ từ vựng thông minh tương ứng siêu đáng yêu cho con tương tác học tập!");
      playSound.playSuccess();
      setActivePortal("student");
      setActiveTab("learn");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E1F0FF] via-[#F3F9FF] to-[#FFFFFF] text-slate-800 font-sans pb-12 relative">
      
      {/* Visual Floating Star Pop Notification */}
      <AnimatePresence>
        {showStarPopEffect && (
          <motion.div
            initial={{ scale: 0.5, y: 30, opacity: 0 }}
            animate={{ scale: 1.3, y: -20, opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-white font-black px-6 py-3 rounded-full flex items-center gap-2 shadow-lg border-2 border-yellow-300"
          >
            <span className="text-2xl">⭐</span>
            <span>Bé nhận được Sao Vàng Chăm Chỉ! (Hôm nay: {dailyStars} ⭐)</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Certificate of Achievement Modal Overlay */}
      <AnimatePresence>
        {selectedCertificateAttempt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-amber-50 rounded-3xl p-6 md:p-10 border-8 border-yellow-600 ring-4 ring-yellow-400 ring-offset-4 shadow-2xl text-slate-850"
            >
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedCertificateAttempt(null);
                  playSound.playClick();
                }}
                className="absolute top-4 right-4 z-50 bg-yellow-900/10 hover:bg-yellow-900/20 text-yellow-900 hover:text-black p-2 rounded-full cursor-pointer transition-colors"
                title="Đóng cửa sổ"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Certificate Frame Elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-yellow-700 rounded-tl-xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-8 border-r-8 border-yellow-700 rounded-tr-xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-8 border-l-8 border-yellow-700 rounded-bl-xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-8 border-r-8 border-yellow-700 rounded-br-xl pointer-events-none"></div>

              {/* Certificate Contents */}
              <div className="text-center">
                <span className="text-5xl md:text-6xl inline-block mb-3 animate-pulse">🏅</span>
                <p className="font-mono text-xs text-yellow-800 uppercase tracking-widest font-black leading-none mb-1">
                  CO PHUONG UYEN ENGLISH CENTER • DIPLOMA
                </p>
                {language === "bilingual" && (
                  <p className="text-[10px] text-slate-500 font-extrabold italic mb-2 uppercase leading-none">Trung Tâm Ngoại Ngữ Cô Phượng Uyên</p>
                )}
                
                <h2 className="font-sans font-black text-2xl md:text-3xl text-yellow-900 tracking-tight leading-snug uppercase mb-1 border-b-4 border-yellow-700 pb-2">
                  CERTIFICATE OF ACHIEVEMENT
                </h2>
                {language === "bilingual" && (
                  <p className="text-[10px] text-yellow-800 font-black tracking-wider uppercase mb-3 italic">Giấy Chứng Nhận Thành Tích Sát Hạch</p>
                )}
                
                <p className="text-xs text-slate-500 uppercase font-black tracking-widest leading-none mt-4 mb-1">This is proudly presented to</p>
                {language === "bilingual" && (
                  <p className="text-[9px] text-slate-400 italic mb-1 leading-none">(Vinh dự được trao tặng cho)</p>
                )}
                
                {/* Dynamically editable student name input directly inside certificate */}
                <div className="my-3 max-w-md mx-auto">
                  <input
                    type="text"
                    value={certStudentName}
                    onChange={(e) => setCertStudentName(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-dashed border-yellow-700 text-center font-sans font-black text-2xl md:text-3xl text-indigo-950 focus:outline-none placeholder-yellow-800/40 pb-1"
                    placeholder="Enter Student Name"
                  />
                  <p className="text-[9px] text-yellow-700 italic mt-1 font-semibold leading-none">
                    {t("(Click to edit spelling anytime if required)", "(Con hãy chạm vào để tự sửa đổi tên mình nếu cần nhé!)")}
                  </p>
                </div>

                <p className="text-sm text-slate-700 max-w-lg mx-auto leading-relaxed mt-4 font-bold">
                  for outstanding academic performance and successfully completing the interactive English evaluation on the specialized unit:
                </p>
                {language === "bilingual" && (
                  <p className="text-[10px] text-slate-400 italic progress-badge leading-relaxed max-w-md mx-auto">
                    (Vì thành tích học tập vượt trội và hoàn thành xuất sắc bài kiểm tra sát hạch thuộc chuyên đề chủ điểm học tập:)
                  </p>
                )}

                {/* Dynamically editable lesson topic input */}
                <div className="my-3 max-w-md mx-auto">
                  <input
                    type="text"
                    value={certLessonTitle}
                    onChange={(e) => setCertLessonTitle(e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-yellow-700 text-center font-sans font-black text-sm text-slate-900 focus:outline-none py-1"
                    placeholder="Lesson Topic"
                  />
                </div>

                {/* Score Layout representation */}
                <div className="inline-flex flex-col items-center justify-center my-4 bg-gradient-to-r from-red-500 via-amber-500 to-indigo-600 text-white font-mono px-6 py-2.5 rounded-2xl shadow-md border-2 border-white animate-bounce">
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-none">{t("EVALUATION SCORE", "ĐIỂM SỐ ĐẠT ĐƯỢC")}</span>
                  <span className="font-sans font-black text-xl md:text-2xl leading-none mt-1">
                    {certScore === 100 ? "EXCELLENT STATUS: " : certScore >= 80 ? "DISTINCTION STATUS: " : "COMPLETED STATUS: "} {certScore}/100 POINTS
                  </span>
                </div>

                {/* Credentials grid */}
                <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto mt-6 pt-6 border-t border-dashed border-yellow-700/35">
                  
                  {/* Teacher signature area */}
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-black text-slate-400">{t("INSTRUCTOR SIGNATURE", "CHỮ KÝ GIÁO VIÊN")}</p>
                    <input
                      type="text"
                      value={certTeacherName}
                      onChange={(e) => setCertTeacherName(e.target.value)}
                      className="w-full bg-transparent border-b border-dashed border-slate-700 text-center font-sans font-extrabold text-sm text-indigo-900 mt-2 focus:outline-none"
                      placeholder="instructor Name"
                    />
                  </div>

                  {/* Date completed area */}
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-black text-slate-400">{t("DATE ISSUED", "NGÀY CẤP")}</p>
                    <input
                      type="text"
                      value={certDate}
                      onChange={(e) => setCertDate(e.target.value)}
                      className="w-full bg-transparent border-b border-dashed border-slate-700 text-center font-sans font-extrabold text-sm text-slate-750 mt-2 focus:outline-none"
                      placeholder="Issue Date"
                    />
                  </div>

                </div>

                {/* Ribbons / Wax seals decorations */}
                <div className="flex justify-center items-center gap-2 mt-8">
                  <div className="text-4xl">💮</div>
                  <div className="text-left leading-none">
                    <p className="font-mono text-xs font-black text-yellow-800">Ms. Phuong Uyen Certified</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t("Golden Learning Laurels", "Huy hiệu vàng học tập tích lũy")}</p>
                  </div>
                </div>

                {/* Print action bar */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-8 pt-4">
                  <button
                    onClick={() => {
                      playSound.playTing();
                      window.print();
                    }}
                    className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-sans font-black text-xs flex items-center gap-1.5 shadow cursor-pointer transition-transform hover:scale-105"
                  >
                    <Printer className="h-4 w-4" /> {t("Print Certificate", "In Giấy Khen")}
                  </button>

                  <button
                    onClick={() => {
                      playSound.playSuccess();
                      alert(language === "bilingual" ? "Đã lưu Giấy Chứng Nhận vào hồ sơ của bé thành công!" : "Successfully saved certificate into student achievements!");
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-black text-xs shadow cursor-pointer"
                  >
                    {t("Save Digitally", "Lưu Bản Cứng")}
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delightful Bubble Header */}
      <header className="bg-gradient-to-r from-[#034CBD] via-[#0E73FF] to-[#0A4FB2] text-white py-4 px-6 shadow-md border-b-8 border-[#04337b]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo brand click to return home */}
          <div
            onClick={() => {
              setActivePortal("landing");
              playSound.playTing();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="bg-white p-1.5 rounded-2xl shadow-inner border-2 border-blue-200 transition-transform group-hover:scale-105 flex items-center justify-center shrink-0 w-16 h-16">
              <LogoSVG className="h-full w-auto" />
            </div>
            <div>
              <h1 className="font-sans font-black text-lg md:text-2xl tracking-tight text-white drop-shadow-md uppercase leading-none">
                Cô Phượng Uyên
              </h1>
              <p className="text-[10px] md:text-xs text-blue-100 font-extrabold font-sans tracking-wide mt-1">
                Learn today, better tomorrow 🌟
              </p>
            </div>
          </div>

          {/* User Score & Nav Control Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            
            {/* Dynamic Star rewards counter */}
            <div className="bg-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/30 backdrop-blur-sm">
              <span className="text-2xl animate-spin">🌟</span>
              <div>
                <p className="text-[10px] text-yellow-500 font-bold uppercase leading-tight">Tích lũy của bé</p>
                <p className="font-mono font-black text-white text-md tracking-wider leading-none">
                  {currentGoldStars} Sao Vàng
                </p>
              </div>
            </div>

            {/* Daily Stars tracker */}
            <div className="bg-[#FFF5D6]/20 px-4 py-2 rounded-2xl flex items-center gap-2 border border-yellow-300/30 backdrop-blur-sm">
              <span className="text-2xl animate-bounce">📅</span>
              <div>
                <p className="text-[10px] text-yellow-300 font-bold uppercase leading-tight">Hôm nay nhận</p>
                <p className="font-mono font-black text-white text-md tracking-wider leading-none">
                  +{dailyStars} Sao Vàng
                </p>
              </div>
            </div>

            {/* Level Counter badge */}
            <div className="bg-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/30 backdrop-blur-sm">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-[10px] text-yellow-500 font-bold uppercase leading-tight">Cấp độ</p>
                <p className="font-sans font-black text-white text-md tracking-wider leading-none uppercase">
                  {studentLevel === "pre-starter" ? "PRE-STARTER" : studentLevel === "mover" ? "MOVER" : studentLevel === "flyer" ? "FLYER" : studentLevel === "starter" ? "STARTER" : `LEVEL ${currentLevel}`}
                </p>
              </div>
            </div>

            {/* Direct Home trigger */}
            <button
              onClick={() => {
                setActivePortal("landing");
                playSound.playTing();
              }}
              className="p-3 bg-white hover:bg-yellow-50 text-indigo-950 rounded-2xl border-b-4 border-yellow-300 shadow-md cursor-pointer flex items-center gap-1 text-xs font-black transition-transform active:scale-95"
            >
              <Home className="h-5 w-5" />
              <span>{t("Home", "Trang Chủ")} 🏠</span>
            </button>

            {activePortal === "landing" && (
              <button
                onClick={() => {
                  if (!studentCustomName.trim()) {
                    setStudentCustomName("Học Sinh Bé Ngoan");
                    setLoggedInStudent({
                      name: "Học Sinh Bé Ngoan",
                      classId: "free",
                      className: "Lớp Học Cô Phượng Uyên",
                      teacherName: "Cô Phượng Uyên"
                    });
                  }
                  setActivePortal("student");
                  setActiveTab("learn");
                  playSound.playTing();
                }}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl border-b-4 border-indigo-800 shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-black transition-transform active:scale-95"
              >
                <span>Góc Học Tập 🎒</span>
              </button>
            )}

            {activePortal === "student" && (
              <button
                onClick={() => {
                  setActivePortal("landing");
                  playSound.playTing();
                }}
                className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl border-b-4 border-emerald-800 shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-black transition-transform active:scale-95"
              >
                <span>Sáng Tạo Bài Học 🪄</span>
              </button>
            )}

            {/* Bilingual Translation Toggle Switcher has been removed */}
            
          </div>

        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-6xl mx-auto px-4 mt-8">

        {/* Cửa sổ alert thành công */}
        {apiSuccessMsg && (
          <div className="max-w-4xl mx-auto bg-green-100 border-2 border-green-300 text-green-800 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-md animate-bounce text-xs font-bold leading-normal">
            <span>{apiSuccessMsg}</span>
            <button onClick={() => setApiSuccessMsg(null)} className="text-green-900 font-black shrink-0 hover:scale-110 ml-4">Xóa</button>
          </div>
        )}
        
        {/* VIEW 1: LANDING DASHBOARD (Màn hình trang chủ ban đầu) */}
        {activePortal === "landing" && (
          <div className="max-w-4xl mx-auto flex flex-col gap-8">
            
            {/* Visual Welcome Ribbon Banner for Cô Phượng Uyên Center */}
            <div className="bg-white rounded-3xl p-6 md:p-8 text-center shadow-xl border-t-8 border-blue-600 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-50 rounded-full opacity-65"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-50 rounded-full opacity-45"></div>
              
              <div className="mx-auto mb-4 w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-md">
                <LogoSVG className="h-14 w-14" />
              </div>
              
              <h2 className="font-sans font-black text-2xl md:text-3xl text-blue-950 tracking-tight leading-none uppercase">
                Trung Tâm Ngoại Ngữ Cô Phượng Uyên
              </h2>
              <p className="font-sans font-black text-sm text-sky-600 uppercase tracking-widest mt-2">
                Learn today, better tomorrow 🌟
              </p>

              <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-600 border-t border-dashed border-blue-100 pt-5 font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👑</span>
                  <p>Giám Đốc: <span className="text-blue-950 font-black">Võ Thùy Phượng Uyên</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <p>Hotline/Zalo: <a href="tel:0985846325" className="text-blue-700 font-black hover:underline">0985.846.325</a></p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌐</span>
                  <a href="https://www.facebook.com/profile.php?id=100045429101693" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-extrabold hover:underline">Facebook Fanpage</a>
                </div>
              </div>
            </div>

            {/* Main AI Creator Card - Always Visible on Landing Page */}
            <div className="w-full max-w-2xl mx-auto mt-2 animate-fade-in">
              <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-dashed border-emerald-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                  AI Magic Powered 🔮
                </div>

                {/* Animated headings */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="font-sans font-black text-lg md:text-2xl text-emerald-600 uppercase tracking-tight">
                    🎈 {t("Create a fun lesson here!", "Bé hãy sáng tạo bài học vui nhộn ở đây nhé!")} 🎈
                  </h3>
                  <p className="text-[10px] md:text-xs text-slate-400 font-extrabold italic mt-1 uppercase tracking-wider">
                    "Learn today, better tomorrow 🌟"
                  </p>
                </div>

                <form onSubmit={handleStudentGenerateLessonSubmit} className="space-y-6 text-xs font-bold text-slate-650">
                  
                  {/* Tên học sinh input */}
                  <div className="bg-[#eef5fc] p-5 rounded-2xl border border-blue-100 flex flex-col gap-2.5 max-w-lg mx-auto">
                    <label className="block text-[11px] uppercase font-black text-blue-900 tracking-wider">
                      Nhập Tên Của Bé (Để hiện trên Giấy khen) ⭐
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Bé Na, Minh Anh, Gia Huy..."
                      value={studentCustomName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStudentCustomName(val);
                        // Sync with loggedInStudent immediately so other components stay updated
                        setLoggedInStudent({
                          name: val,
                          classId: "free",
                          className: "Lớp Học Cô Phượng Uyên",
                          teacherName: "Cô Phượng Uyên"
                        });
                      }}
                      className="w-full p-3.5 rounded-xl bg-white border-2 border-blue-200 text-xs font-black text-slate-800 focus:border-blue-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                    
                    {/* 1. Generation Method Switcher Tabs (Perfect Match with requested visual layout) */}
                    <div className="flex justify-center flex-wrap">
                      <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl w-full border border-slate-200">
                        <button
                          type="button"
                          onClick={() => { setCreateMethod("topic"); playSound.playTing(); }}
                          className={`flex-1 py-3 px-2 rounded-xl font-sans font-black text-xs transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
                            createMethod === "topic"
                              ? "bg-[#10c469] text-white shadow-md scale-[1.02]"
                              : "text-slate-600 hover:text-slate-800 bg-transparent"
                          }`}
                        >
                          <span className="text-sm">💡</span>
                          <span>{t("Topic", "Chủ đề")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCreateMethod("text"); playSound.playTing(); }}
                          className={`flex-1 py-3 px-2 rounded-xl font-sans font-black text-xs transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
                            createMethod === "text"
                              ? "bg-[#10c469] text-white shadow-md scale-[1.02]"
                              : "text-slate-600 hover:text-slate-800 bg-transparent"
                          }`}
                        >
                          <span className="text-sm">📝</span>
                          <span>{t("Text", "Văn bản")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setCreateMethod("image"); playSound.playTing(); }}
                          className={`flex-1 py-3 px-2 rounded-xl font-sans font-black text-xs transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
                            createMethod === "image"
                              ? "bg-[#10c469] text-white shadow-md scale-[1.02]"
                              : "text-slate-600 hover:text-slate-800 bg-transparent"
                          }`}
                        >
                          <span className="text-sm">📸</span>
                          <span>{t("Image/File", "Hình ảnh")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Input Box with soft pastel background */}
                    <div className="bg-[#f0f9f4] p-6 rounded-3xl border border-emerald-100/50 text-center max-w-2xl mx-auto w-full">
                      {createMethod === "topic" && (
                        <div className="w-full">
                          <input
                            type="text"
                            placeholder={t("Enter topic (e.g. Animals, My Family...)", "Nhập chủ đề (VD: Animals, My Family...)")}
                            value={studentTopic}
                            onChange={(e) => setStudentTopic(e.target.value)}
                            className="w-full bg-transparent text-emerald-950 placeholder-emerald-700/40 border-0 focus:outline-none focus:ring-0 text-center font-sans font-black text-sm md:text-base tracking-wide"
                          />
                        </div>
                      )}

                      {createMethod === "text" && (
                        <div className="w-full">
                          <textarea
                            rows={3}
                            placeholder={t("Paste vocabulary list or paste content paragraph here...", "Dán danh sách từ vựng hoặc đoạn văn ở đây nhe...")}
                            value={studentRawContent}
                            onChange={(e) => setStudentRawContent(e.target.value)}
                            className="w-full bg-transparent text-emerald-950 placeholder-emerald-700/40 border-0 focus:outline-none focus:ring-0 text-center font-sans font-black text-sm md:text-base tracking-wide"
                          />
                        </div>
                      )}

                      {createMethod === "image" && (
                        <div className="w-full">
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsStudentDraggingFile(true);
                            }}
                            onDragLeave={() => setIsStudentDraggingFile(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsStudentDraggingFile(false);
                              const file = e.dataTransfer.files[0];
                              if (file) {
                                compressImage(file).then((base64Result) => {
                                  setStudentUploadedFile({
                                    name: file.name,
                                    base64: base64Result,
                                    type: file.type,
                                  });
                                  playSound.playSuccess();
                                });
                              }
                            }}
                            className="w-full bg-transparent border-0 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*, application/pdf";
                              input.onchange = (e: any) => {
                                const file = e.target.files[0];
                                if (file) {
                                  compressImage(file).then((base64Result) => {
                                    setStudentUploadedFile({
                                      name: file.name,
                                      base64: base64Result,
                                      type: file.type,
                                    });
                                    playSound.playSuccess();
                                  });
                                }
                              };
                              input.click();
                            }}
                          >
                            {studentUploadedFile ? (
                              <div className="text-emerald-950 font-bold text-xs p-1">
                                <p className="font-sans font-black text-sm text-emerald-900">✅ {t("File Selected:", "Đã Chọn Tập Tin:")}</p>
                                <p className="text-[11px] underline truncate mt-1 text-emerald-800 bg-white/60 px-3 py-1.5 rounded-lg max-w-xs mx-auto">{studentUploadedFile.name}</p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setStudentUploadedFile(null);
                                    playSound.playClick();
                                  }}
                                  className="text-[10px] text-red-600 hover:underline mt-2.5 font-sans font-black transition-all hover:scale-105 inline-block cursor-pointer bg-transparent border-0"
                                >
                                  🗑️ {t("Delete & Reupload", "Xoá và tải lại")}
                                </button>
                              </div>
                            ) : (
                              <div className="text-center text-emerald-800/80 hover:text-emerald-900 transition-colors">
                                <p className="font-sans font-black text-sm text-emerald-800">📸 {t("Drag & Drop or Click to Upload Material", "Kéo thả hoặc Nhấp để chọn ảnh chụp tài liệu")}</p>
                                <p className="text-[10px] opacity-75 mt-1 font-semibold">{t("Supports homework photos, workbook pages, worksheets...", "Chấp nhận ảnh bài tập về nhà, sách giáo khoa...")}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. English Level Selector incorporating the 4 Cambridge Stages */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-500 uppercase tracking-wider font-extrabold text-[10px] text-center mb-1">
                        {t("Select English Level", "Chọn trình độ phù hợp")}:
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                        <button
                          type="button"
                          onClick={() => { setStudentLevel("pre-starter"); playSound.playTing(); }}
                          className={`py-3 px-1 rounded-2xl border-2 cursor-pointer text-center duration-155 transition-all font-black flex flex-col items-center justify-center gap-1 ${
                            studentLevel === "pre-starter"
                              ? "bg-[#034CBD] border-[#034CBD] text-white shadow-md scale-[1.03]"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650"
                          }`}
                        >
                          <span className="text-lg">🧸</span>
                          <span className="text-[11px] uppercase tracking-wide">Pre-Starters</span>
                          <span className="text-[8px] font-bold opacity-80">{t("Ages 4-6", "Bé 4 - 6 tuổi")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setStudentLevel("starter"); playSound.playTing(); }}
                          className={`py-3 px-1 rounded-2xl border-2 cursor-pointer text-center duration-155 transition-all font-black flex flex-col items-center justify-center gap-1 ${
                            studentLevel === "starter"
                              ? "bg-[#034CBD] border-[#034CBD] text-white shadow-md scale-[1.03]"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650"
                          }`}
                        >
                          <span className="text-lg">🎈</span>
                          <span className="text-[11px] uppercase tracking-wide">Starters</span>
                          <span className="text-[8px] font-bold opacity-80">{t("Ages 6-8", "Bé 6 - 8 tuổi")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setStudentLevel("mover"); playSound.playTing(); }}
                          className={`py-3 px-1 rounded-2xl border-2 cursor-pointer text-center duration-155 transition-all font-black flex flex-col items-center justify-center gap-1 ${
                            studentLevel === "mover"
                              ? "bg-[#034CBD] border-[#034CBD] text-white shadow-md scale-[1.03]"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650"
                          }`}
                        >
                          <span className="text-lg">🚀</span>
                          <span className="text-[11px] uppercase tracking-wide">Movers</span>
                          <span className="text-[8px] font-bold opacity-80">{t("Ages 8-10", "Bé 8 - 10 tuổi")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setStudentLevel("flyer"); playSound.playTing(); }}
                          className={`py-3 px-1 rounded-2xl border-2 cursor-pointer text-center duration-155 transition-all font-black flex flex-col items-center justify-center gap-1 ${
                            studentLevel === "flyer"
                              ? "bg-[#034CBD] border-[#034CBD] text-white shadow-md scale-[1.03]"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650"
                          }`}
                        >
                          <span className="text-lg">🦅</span>
                          <span className="text-[11px] uppercase tracking-wide">Flyers</span>
                          <span className="text-[8px] font-bold opacity-80">{t("Ages 10-12", "Bé 10 - 12 tuổi")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Solid Green 3D Push Button per image 2 instructions */}
                    <div className="pt-2 flex justify-center">
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full max-w-lg py-4 px-6 rounded-2xl bg-[#10c469] hover:bg-[#0fbd64] text-white font-sans font-black text-sm tracking-wider shadow-md border-b-4 border-[#099951] active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 duration-150 transform hover:-translate-y-0.5"
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-2 animate-pulse font-sans font-black">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                            {t("Co Phuong Uyen is preparing your magical lesson... 🔮", "Cô Phượng Uyên đang soạn bài giảng của bé... 🔮")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 uppercase font-[#034CBD] font-sans font-black">
                            <span>🚀</span>
                            <span>{t("START NOW!", "BẮT ĐẦU NGAY!")}</span>
                          </span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

          </div>
        )}

        {/* VIEW 2: TEACHER CONTROLS PANEL */}
        {activePortal === "teacher" && null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-dashed border-amber-300"
          >
            
            {/* Header teacher section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-dashed border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-xl text-xl">👩‍🏫</div>
                <div>
                  <h2 className="font-sans font-black text-xl text-amber-800">Cổng Quản Trị Của Giáo Viên</h2>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Hệ thống Soạn thảo chuẩn hóa & Quản lý lớp học</p>
                </div>
              </div>

              {/* Tab Selector between creator and class list */}
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  onClick={() => {
                    setTeacherSubtab("lessons");
                    playSound.playClick();
                  }}
                  className={`px-4 py-2 text-xs font-sans font-black rounded-lg transition-colors cursor-pointer ${
                    teacherSubtab === "lessons"
                      ? "bg-white text-amber-700 shadow"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Thiết Kế Bài Giảng 📝
                </button>
                <button
                  onClick={() => {
                    setTeacherSubtab("classes");
                    playSound.playClick();
                  }}
                  className={`px-4 py-2 text-xs font-sans font-black rounded-lg transition-colors cursor-pointer relative ${
                    teacherSubtab === "classes"
                      ? "bg-white text-amber-700 shadow"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Quản Lý Lớp Học ({classroomsList.length}) 🏫
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: LESSONS CREATOR */}
            {teacherSubtab === "lessons" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Form Input options */}
                <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-6 border-2 border-slate-150">
                  <div className="mb-4">
                    <h3 className="font-sans font-black text-slate-800 text-sm uppercase">Soạn Bài Học Tự Động Với Trí Tuệ Nhân Tạo</h3>
                    <p className="text-xs text-slate-400 mt-1">AI tự động phiên dịch, bổ sung phiên âm, viết mẫu câu và tạo tranh Emojis ngộ nghĩnh nhất</p>
                  </div>

                  <form onSubmit={handleGenerateLessonSubmit} className="flex flex-col gap-5">
                    
                    {/* New Classroom Selector field */}
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-2">Lớp học nhận bài mới *</label>
                      <select
                        required
                        value={teacherClassroomId}
                        onChange={(e) => {
                          setTeacherClassroomId(e.target.value);
                          const selectedClass = classroomsList.find((c) => c.id === e.target.value);
                          if (selectedClass) {
                            const isMamNon =
                              selectedClass.name.toLowerCase().includes("mầm") ||
                              selectedClass.name.toLowerCase().includes("lá");
                            setTeacherLevel(isMamNon ? "preschool" : "elementary");
                          }
                          playSound.playClick();
                        }}
                        className="w-full p-3.5 rounded-xl bg-white border-2 border-slate-300 focus:border-amber-400 outline-none font-sans font-black text-xs text-slate-800 shadow-sm cursor-pointer"
                      >
                        <option value="">-- Bấm để chọn Lớp học --</option>
                        {classroomsList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.students?.length || 0} học viên)
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-slate-400 font-extrabold leading-normal mt-1.5 uppercase tracking-wide">
                        💡 Mỗi lớp học một nội dung học riêng. Chọn đúng lớp để các bé đăng nhập bằng sđt có thể học bài của lớp mình.
                      </p>
                    </div>

                    {/* Hạn làm bài (Deadline) picker */}
                    <div className="border-t border-dashed border-slate-250 pt-3">
                      <label className="block text-xs font-black uppercase text-slate-700 mb-2">Hạn làm bài (Hạn chót) ⏰</label>
                      <input
                        type="datetime-local"
                        value={teacherDeadline}
                        onChange={(e) => setTeacherDeadline(e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-white border-2 border-slate-300 focus:border-amber-400 outline-none font-sans font-black text-xs text-slate-800 shadow-sm"
                      />
                      <p className="text-[9px] text-slate-400 font-extrabold mt-1 uppercase tracking-wide">
                        💡 Để trống nếu không giới hạn thời gian nộp bài của học sinh. Học sinh muộn vẫn nộp được nhưng sẽ báo muộn.
                      </p>
                    </div>

                    {/* Option 2: Choose Topic Generator */}
                    <div className="border-t border-dashed border-slate-250 pt-3">
                      <label className="block text-xs font-black uppercase text-slate-600 mb-1.5">Cách 1: Gửi chủ đề giáo án Thầy Cô muốn soạn</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Đồ ăn ngọt ngon vị, Trong nhà tắm bé, Phương tiện giao thông đường sắt..."
                        value={teacherTopic}
                        onChange={(e) => setTeacherTopic(e.target.value)}
                        className="w-full p-4 rounded-lg bg-white border border-slate-400 focus:border-amber-400 outline-none font-sans font-semibold text-sm"
                      />
                    </div>

                    {/* Option 3: Upload Text list */}
                    <div className="border-t border-dashed border-slate-250 pt-3">
                      <label className="block text-xs font-black uppercase text-slate-600 mb-1.5">Cách 2: Nhập dán danh sách từ của Thầy Cô</label>
                      <textarea
                        rows={3}
                        placeholder="Ví dụ: Dog, Cat, Panda, Lion, Giraffe... (Cách nhau bằng dấu phẩy nhé!)"
                        value={teacherUploadText}
                        onChange={(e) => setTeacherUploadText(e.target.value)}
                        className="w-full p-4 rounded-lg bg-white border border-slate-400 focus:border-amber-400 outline-none font-sans font-semibold text-sm animate-pulse"
                      />
                    </div>

                    {/* Option 4: Upload File / Image */}
                    <div className="border-t border-dashed border-slate-250 pt-3">
                      <label className="block text-xs font-black uppercase text-slate-600 mb-1.5 font-sans font-black">Cách 3: Tải hình ảnh bài tập / Tài liệu PDF 📸</label>
                      <div
                        className="border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/50 rounded-2xl p-4 text-center cursor-pointer transition-colors"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*, application/pdf";
                          input.onchange = (e: any) => {
                            const file = e.target.files[0];
                            if (file) {
                              compressImage(file).then((base64Result) => {
                                setTeacherUploadedFile({
                                  name: file.name,
                                  base64: base64Result,
                                  type: file.type,
                                });
                                playSound.playSuccess();
                              });
                            }
                          };
                          input.click();
                        }}
                      >
                        {teacherUploadedFile ? (
                          <div className="text-amber-950 font-bold text-xs">
                            <p className="font-sans font-black text-xs text-slate-700">✅ Đã chọn tài liệu:</p>
                            <p className="text-[11px] underline truncate mt-1 text-emerald-800 bg-white/75 px-3 py-1.5 rounded-lg max-w-xs mx-auto">{teacherUploadedFile.name}</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTeacherUploadedFile(null);
                                playSound.playClick();
                              }}
                              className="text-[10px] text-red-600 hover:underline mt-2 font-sans font-black bg-transparent border-0 cursor-pointer"
                            >
                              🗑️ Xoá và tải lại
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-slate-500 hover:text-slate-700 transition-colors">
                            <p className="font-sans font-black text-xs text-amber-900">📸 Nhấp để chọn ảnh bài tập hoặc tệp học liệu</p>
                            <p className="text-[9px] opacity-75 mt-0.5 font-bold uppercase tracking-wider">Hệ thống sẽ giữ nguyên nội dung gốc để tạo bài học gồm vựng và câu tương ứng</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trigger Generator Button */}
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-sans font-black text-md shadow-lg border-b-4 border-amber-700 flex items-center justify-center gap-2 duration-200 cursor-pointer disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin text-xl">⏳</span> Đang soạn giáo khoa Anh ngữ cùng AI...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 fill-white" /> Khởi Tạo Bài Giáo Án Mới Ngay! 🚀
                        </span>
                      )}
                    </button>

                  </form>
                </div>

                {/* Lessons Sidebar with Share Link built-in */}
                <div className="bg-white rounded-2xl p-5 border-2 border-slate-150 flex flex-col gap-4">
                  <div>
                    <h4 className="font-sans font-black text-slate-700 text-xs uppercase tracking-wider">Thư viện bài giảng hiện hữu</h4>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5 font-bold">Bấm chia sẻ để lấy link gửi cho học viên học</p>
                  </div>

                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {Object.entries(groupLessonsByDate(lessonsList)).map(([dateStr, lessons]) => (
                      <div key={dateStr} className="flex flex-col gap-2 border-b border-sky-100/40 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-sans font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50 w-fit">
                          <Calendar className="h-3.5 w-3.5" />
                          📅 {dateStr}
                        </div>
                        <div className="flex flex-col gap-2 pl-1">
                          {lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={`p-3.5 rounded-xl border-2 transition-all flex flex-col gap-3 ${
                                selectedLessonId === lesson.id
                                  ? "bg-amber-50/70 border-amber-400 shadow-sm font-black"
                                  : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div
                                onClick={() => {
                                  setSelectedLessonId(lesson.id);
                                  setActiveWordIdx(0);
                                  playSound.playClick();
                                }}
                                className="cursor-pointer text-left"
                              >
                                <h5 className="font-sans font-black text-xs text-slate-800 leading-tight">
                                  {lesson.title}
                                </h5>
                                <span className="inline-block mt-1 text-[9px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {lesson.level === "preschool" ? "Mẫu giáo 🧸" : "Tiểu học ⚡"} • {lesson.words.length} Từ vựng
                                </span>
                                {lesson.classId && (
                                  <span className="inline-block mt-1 ml-1 text-[9px] uppercase font-black text-rose-700 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded">
                                    🏫 Lớp: {classroomsList.find((c) => c.id === lesson.classId)?.name || "Chưa rõ"}
                                  </span>
                                )}
                              </div>

                              {/* Practical Action Tools: Copy Lesson shared URL link */}
                              <div className="flex items-center gap-2 border-t border-dashed border-slate-200 pt-2 shrink-0">
                                <button
                                  onClick={() => handleCopyShareLink(lesson.id)}
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-1 text-[10px] font-sans font-black cursor-pointer"
                                  title="Sao chép liên kết chia sẻ cho học sinh làm học"
                                >
                                  <Share2 className="h-3 w-3" />
                                  Copy Link Học 🎉
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 2: CLASSROOMS MANAGEMENT (Độc quyền bổ sung theo yêu cầu) */}
            {teacherSubtab === "classes" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* 1. Left Sidebar: Classlists selector */}
                <div className="lg:col-span-1 bg-slate-50/70 rounded-2xl p-4 border-2 border-slate-150 flex flex-col gap-4">
                  <div className="border-b border-dashed border-slate-200 pb-2">
                    <h4 className="font-sans font-black text-slate-700 text-xs uppercase tracking-wide">Danh sách các Lớp</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">Click chọn lớp để quản lý học sinh và xem kết quả</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {classroomsList.map((c) => (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 duration-150 ${
                          selectedClassroomId === c.id
                            ? "bg-amber-100 border-amber-400 text-amber-950 font-bold"
                            : "bg-white border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setSelectedClassroomId(c.id);
                            playSound.playTing();
                          }}
                          className="flex-1 text-left text-xs font-black cursor-pointer leading-tight truncate pr-1"
                        >
                          {c.name}
                          <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                            {c.students.length} Học viên
                          </span>
                        </button>

                        <button
                          onClick={() => handleDeleteClass(c.id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors"
                          title="Xóa lớp học"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Class Creation Form inside Sidebar */}
                  <form onSubmit={handleCreateClassSubmit} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-3.5 mt-4">
                    <h5 className="font-sans font-black text-xs text-sky-800 leading-none">➕ Tạo Lớp Học Mới</h5>
                    
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-500">Tên Lớp học</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Lớp Lá 2, Lớp 1B..."
                        value={newClassNameInput}
                        onChange={(e) => setNewClassNameInput(e.target.value)}
                        className="w-full mt-1.5 p-2.5 border-2 border-slate-200 focus:border-sky-400 rounded-lg text-xs outline-none font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-black uppercase text-slate-500">
                          Danh Sách Học Sinh ({newClassStudents.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setNewClassStudents(prev => [...prev, { name: "", phone: "" }]);
                            playSound.playTing();
                          }}
                          className="text-[10px] bg-sky-50 text-sky-600 border border-sky-200 px-2.5 py-1 rounded-md font-extrabold hover:bg-sky-100 transition-colors cursor-pointer"
                        >
                          + Thêm Bé
                        </button>
                      </div>

                      <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1 mt-1.5">
                        {newClassStudents.map((student, idx) => (
                          <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex flex-col gap-2 relative">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-slate-400">👦 Bé thứ {idx + 1}</span>
                              {newClassStudents.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewClassStudents(prev => prev.filter((_, i) => i !== idx));
                                    playSound.playClick();
                                  }}
                                  className="text-red-500 hover:text-red-700 font-extrabold text-[10px] bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded cursor-pointer transition-all"
                                  title="Xóa bé này"
                                >
                                  ✕ Xóa
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">Tên bé</label>
                                <input
                                  type="text"
                                  placeholder="Họ & tên bé"
                                  value={student.name}
                                  onChange={(e) => {
                                    const updated = [...newClassStudents];
                                    updated[idx].name = e.target.value;
                                    setNewClassStudents(updated);
                                  }}
                                  className="w-full p-2 bg-white border border-slate-250 focus:border-sky-400 rounded-lg text-xs font-bold text-slate-800 outline-none"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5">SĐT phụ huynh</label>
                                <input
                                  type="tel"
                                  placeholder="Ví dụ: 09..."
                                  value={student.phone}
                                  onChange={(e) => {
                                    const updated = [...newClassStudents];
                                    updated[idx].phone = e.target.value;
                                    setNewClassStudents(updated);
                                  }}
                                  className="w-full p-2 bg-white border border-slate-250 focus:border-sky-400 rounded-lg text-xs font-bold text-slate-800 outline-none font-sans"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-sans font-black text-xs shadow-sm cursor-pointer mt-1"
                    >
                      Tạo Lớp Học Mới 🚀
                    </button>
                  </form>
                </div>

                {/* 2. Middle / Right core table view: Selected classroom list */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  
                  {activeClassroom ? (
                    <div className="bg-slate-50/50 rounded-2xl p-6 border-2 border-slate-150">
                      
                      {/* Active Class Header */}
                      <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between gap-2 border-b border-dashed border-slate-200 pb-3 mb-4">
                        <div>
                          <h4 className="font-sans font-black text-indigo-950 text-md">
                            Hồ Sơ Quản Lý: {activeClassroom.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">Hiển thị danh sảnh học sinh đăng ký, rà soát kết quả kiểm tra sát hạch học phần</p>
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-400">
                          Khởi tạo: {new Date(activeClassroom.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Thêm bé nhanh vào lớp hiện tại */}
                      <form onSubmit={handleAddStudentToClass} className="bg-sky-55/40 p-4 rounded-xl border-2 border-dashed border-sky-200/80 flex flex-col md:flex-row gap-3.5 items-end mb-5">
                        <div className="flex-1 w-full text-left">
                          <label className="block text-[10px] font-black uppercase text-sky-850 mb-1 leading-none">
                            ➕ Thêm học sinh mới vào lớp hiện tại:
                          </label>
                          <input
                            type="text"
                            placeholder="Nhập họ & tên học sinh..."
                            value={addStudentName}
                            onChange={(e) => setAddStudentName(e.target.value)}
                            className="w-full mt-1.5 p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none"
                            required
                          />
                        </div>
                        <div className="w-full md:w-52 text-left">
                          <label className="block text-[10px] font-black uppercase text-sky-850 mb-1 leading-none">
                            Số điện thoại phụ huynh *
                          </label>
                          <input
                            type="tel"
                            placeholder="Ví dụ: 0912345678"
                            value={addStudentPhone}
                            onChange={(e) => setAddStudentPhone(e.target.value)}
                            className="w-full mt-1.5 p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none font-sans"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full md:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-sans font-black text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        >
                          + Thêm Vào Lớp 🎒
                        </button>
                      </form>

                      {/* Bulk lists of Students with detailed completed status checks */}
                      <div className="bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-sans font-black uppercase tracking-wider">
                            <tr>
                              <th className="p-3">Tên Học Sinh 🎒</th>
                              <th className="p-3">Trạng Thái Làm Bài 📝</th>
                              <th className="p-3">Điểm Số Sát Hạch 🎓</th>
                              <th className="p-3">Hành Động Đặc Biệt 🏆</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-sans font-semibold">
                            {activeClassroom.students.map((student, idx) => {
                              // Cross-match student.name and classId inside shared attempts list to get their scores
                              const studentAttempts = testAttempts.filter(
                                (att) =>
                                  att.studentName.trim().toLowerCase() === student.name.trim().toLowerCase() &&
                                  att.classId === activeClassroom.id
                              );
                              
                              const hasDone = studentAttempts.length > 0;
                              const bestAttempt = hasDone
                                ? studentAttempts.sort((a, b) => b.score - a.score)[0]
                                : null;

                              const isEditingThis = editingStudentIdx === idx;

                              return (
                                <tr key={`${student.name}-${idx}`} className="hover:bg-slate-50/50">
                                  <td className="p-3">
                                    {isEditingThis ? (
                                      <div className="flex flex-col gap-2 max-w-xs text-left">
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-401 mb-0.5">Tên học sinh</label>
                                          <input
                                            type="text"
                                            value={editStudentName}
                                            onChange={(e) => setEditStudentName(e.target.value)}
                                            className="w-full p-2 border-2 border-sky-400 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[8px] font-black uppercase text-slate-401 mb-0.5">SĐT phụ huynh</label>
                                          <input
                                            type="tel"
                                            value={editStudentPhone}
                                            onChange={(e) => setEditStudentPhone(e.target.value)}
                                            className="w-full p-2 border-2 border-sky-400 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                                            required
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-sm">👦</span>
                                        <div className="flex flex-col">
                                          <span className="font-sans font-extrabold text-slate-800">{student.name}</span>
                                          {student.phone && (
                                            <span className="font-mono text-[9px] text-slate-400 font-bold">📱 {student.phone}</span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </td>
                                  
                                  <td className="p-3">
                                    {isEditingThis ? (
                                      <span className="text-slate-400 italic text-[10px]">Đang chỉnh sửa...</span>
                                    ) : hasDone ? (
                                      <div className="flex flex-col gap-1 items-start">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[10px] font-black">
                                          <CheckCircle2 className="h-3 w-3" /> Đã Hoàn Thành ({studentAttempts.length} Lượt)
                                        </span>
                                        {studentAttempts.some(att => att.isLate) && (
                                          <span className="text-[8px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-sans font-black border border-rose-200 uppercase tracking-wider animate-pulse whitespace-nowrap">
                                            ⚠️ Nộp muộn ⏰
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-650 text-[10px] font-black">
                                        <X className="h-3 w-3" /> Chưa Làm Bài Thi ❌
                                      </span>
                                    )}
                                  </td>

                                  <td className="p-3">
                                    {isEditingThis ? (
                                      <span className="text-slate-400 italic font-mono">-</span>
                                    ) : bestAttempt ? (
                                      <div className="space-y-1">
                                        <div className="font-mono text-sm font-black text-indigo-700 flex items-center gap-1">
                                          {bestAttempt.score} / 100 Điểm
                                          {bestAttempt.isLate && (
                                            <span className="text-[7.5px] bg-red-100 text-red-600 px-1 py-0.2 rounded font-bold border border-red-200 uppercase">
                                              Muộn
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[9px] text-slate-410 leading-tight max-w-[150px] truncate" title={bestAttempt.lessonTitle}>
                                          Chủ đề: {bestAttempt.lessonTitle}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400 italic font-mono">-</span>
                                    )}
                                  </td>

                                  <td className="p-3">
                                    {isEditingThis ? (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleSaveEditedStudent(idx)}
                                          className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-sans font-black text-[10px] cursor-pointer shadow-sm active:scale-95 transition-all"
                                        >
                                          💾 Lưu Lại
                                        </button>
                                        <button
                                          onClick={() => setEditingStudentIdx(null)}
                                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-sans font-bold text-[10px] cursor-pointer shadow-sm active:scale-95 transition-all"
                                        >
                                          Hủy
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex flex-wrap items-center gap-2">
                                        {bestAttempt ? (
                                          <button
                                            onClick={() => openCertificate(bestAttempt)}
                                            className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-sans font-black text-[10px] flex items-center gap-1 border border-amber-200 cursor-pointer shadow-sm transition-all active:scale-95 duration-100"
                                          >
                                            <Award className="h-3.5 w-3.5" />
                                            Gi giấy khen 📜
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              playSound.playClick();
                                              // Fast simulation/mock helper to seed student score
                                              const fakeScore = Math.floor(Math.random() * 3 + 8) * 10;
                                              const seededAttempt: TestAttempt = {
                                                id: `att-${Date.now()}-${idx}`,
                                                studentName: student.name,
                                                classId: activeClassroom.id,
                                                className: activeClassroom.name,
                                                lessonId: "lesson-1",
                                                lessonTitle: "🤖 Từ Vựng Động Vật Đáng Yêu",
                                                score: fakeScore,
                                                level: "preschool",
                                                timestamp: Date.now(),
                                                teacherName: "Cô Thảo"
                                              };
                                              setTestAttempts(prev => [seededAttempt, ...prev]);
                                              playSound.playSuccess();
                                              setApiSuccessMsg(`✍️ Đã giả lập kết quả thi (${fakeScore}Đ) cho Học sinh "${student.name}" để Thầy Cô xem trước Giấy chứng nhận!`);
                                            }}
                                            className="px-2.5 py-1 text-[9px] text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer"
                                            title="Lên điểm thi mẫu nhanh phục vụ minh họa"
                                          >
                                            Giả lập thi mẫu ⏳
                                          </button>
                                        )}

                                        <button
                                          onClick={() => {
                                            setEditingStudentIdx(idx);
                                            setEditStudentName(student.name);
                                            setEditStudentPhone(student.phone || "");
                                            playSound.playClick();
                                          }}
                                          className="px-2.5 py-1 text-[9px] text-sky-600 hover:bg-sky-50 rounded border border-sky-200 font-extrabold cursor-pointer inline-flex items-center gap-0.5 whitespace-nowrap"
                                          title="Chỉnh sửa thông tin học sinh"
                                        >
                                          ✏️ Sửa
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Classroom clear database action */}
                      <div className="flex items-center justify-end gap-3 mt-4">
                        <button
                          onClick={() => {
                            if (confirm("Thầy Cô có chắc chắn muốn làm trống toàn bộ bảng xếp hạng điểm thi của lớp học này?")) {
                              setTestAttempts(prev => prev.filter(att => att.classId !== activeClassroom.id));
                              playSound.playTing();
                              setApiSuccessMsg("🧹 Đã xóa sạch lịch sử sát hạch của lớp này!");
                            }
                          }}
                          className="text-[10px] text-slate-400 hover:text-red-600 transition-colors cursor-pointer font-bold uppercase tracking-wider bg-transparent border-0"
                        >
                          Xóa lịch sử điểm thi của lớp 🗑️
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
                      <Users className="h-12 w-12 text-slate-350 mx-auto mb-3" />
                      <h4 className="font-sans font-black text-slate-500">Thầy Cô chưa chọn lớp nào để quản lý</h4>
                      <p className="text-xs text-slate-400 mt-1">Hãy click chọn một lớp ở danh sách bên trái hoặc tạo một lớp học mới</p>
                    </div>
                  )}

                </div>

              </div>
            )}

          </motion.div>
        )}

        {/* VIEW 3: STUDENT LEARNING STATIONS */}
        {activePortal === "student" && (
          <div className="flex flex-col gap-8">
            
            {/* Subject selector and active lesson headline card with direct share options */}
            <div className="bg-gradient-to-r from-sky-400 via-indigo-400 to-indigo-500 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-8 border-indigo-600">
              <div className="flex items-center gap-3">
                <span className="text-5xl">🎒</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-sans font-black text-lg md:text-2xl drop-shadow-sm leading-tight">
                      {activeLesson?.title || "Từ vựng tiếng Anh đầu đời"}
                    </h3>
                    
                    {/* Share Button directly for students */}
                    <button
                      onClick={() => handleCopyShareLink(activeLesson.id)}
                      className="px-2.5 py-1 bg-white/15 hover:bg-white/20 border border-white/30 rounded-xl text-[10px] font-sans font-black flex items-center gap-1 cursor-pointer"
                      title="Nhanh chóng lấy link chia sẻ bài học này"
                    >
                      <Share2 className="h-3 w-3" />
                      Chia Sẻ 🔗
                    </button>

                  </div>

                  <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider mt-1 block">
                    {t("Target Level", "Trình độ mục tiêu")}: <span className="text-yellow-300 font-extrabold">{String(activeLesson?.level || "STARTER").toUpperCase()}</span>
                  </p>
                  
                  {loggedInStudent && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-900/35 px-3 py-1 rounded-full border border-indigo-200/20 text-xs font-sans font-black">
                      <span className="animate-pulse">👤</span>
                      Bé Đang Học: <span className="text-yellow-300 font-black">{loggedInStudent.name}</span> ({loggedInStudent.className})
                    </div>
                  )}
                </div>
              </div>

              {/* Set up custom test settings */}
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
                <div className="text-right">
                  <p className="text-[10px] text-indigo-100 font-bold uppercase">Sát hạch thử</p>
                  <select
                    value={quizSettingsCount}
                    onChange={(e) => {
                      setQuizSettingsCount(Number(e.target.value) as any);
                      playSound.playClick();
                    }}
                    className="bg-transparent text-white font-sans font-black outline-none border-b border-white cursor-pointer"
                  >
                    <option value="10" className="text-slate-800">Kiểm tra 10 câu</option>
                    <option value="20" className="text-slate-800">Kiểm tra 20 câu</option>
                    <option value="30" className="text-slate-800">Kiểm tra 30 câu</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Test Launcher OR Arcade Launcher trigger */}
            {activeTestActive ? (
              // EXAM ZONE ENABLED
              <TestEngine
                words={activeLesson.words}
                questionCount={quizSettingsCount}
                level={activeLesson.level}
                onExit={() => {
                  setActiveTestActive(false);
                  playSound.playClick();
                }}
                onFinish={(res) => {
                  setTestReport(res);
                  setActiveTestActive(false);

                  // Every time they do well, they earn stars. Sát hạch done: gift gold!
                  const earnedStars = res.score === 100 ? 50 : res.score >= 80 ? 35 : 15;
                  triggerStarAward(earnedStars);

                  // LOG SUBMISSION RECORD IN GLOBAL LOCAL DATABASE
                  const isLateSubmitted = activeLesson.deadline ? Date.now() > activeLesson.deadline : false;
                  const logAttempt: TestAttempt = {
                    id: `att-${Date.now()}`,
                    studentName: loggedInStudent?.name || "Học sinh tự điền",
                    classId: loggedInStudent?.classId || "free",
                    className: loggedInStudent?.className || "Tự Do QL",
                    lessonId: activeLesson.id,
                    lessonTitle: activeLesson.title,
                    score: res.score,
                    level: activeLesson.level,
                    timestamp: Date.now(),
                    teacherName: loggedInStudent?.teacherName || "Cô Thảo",
                    isLate: isLateSubmitted
                  };

                  setTestAttempts((prev) => [logAttempt, ...prev]);

                  // Sync to backend api for persistence of student scores
                  fetch("/api/attempts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(logAttempt)
                  })
                  .then((response) => {
                    if (response.ok && isLateSubmitted) {
                      setApiSuccessMsg("⏰ Bé đã nộp sát hạch thành công! Do quá hạn chót nên bài của con sẽ được đánh dấu 'Nộp muộn' nhé. Vẫn rất giỏi nè! 🥳");
                      setTimeout(() => setApiSuccessMsg(null), 4500);
                    }
                  })
                  .catch((err) => console.error("Error syncing attempts:", err));
                }}
              />
            ) : activeGamesActive ? (
              // REVIEW GAMES ENABLED
              <ReviewGames
                words={activeLesson.words}
                onExit={() => {
                  setActiveGamesActive(false);
                  playSound.playClick();
                }}
                onEarnStars={(earned) => {
                  triggerStarAward(earned);
                }}
                onFinishAll={(earnedStars) => {
                  setActiveGamesActive(false);
                  playSound.playSuccess();
                  setApiSuccessMsg("🎉 Tuyệt vời! Bé đã hoàn thành tất cả vòng chơi xuất sắc và tích lũy thật nhiều Sao Vàng! ⭐");
                  setTimeout(() => setApiSuccessMsg(null), 5000);
                }}
              />
            ) : (
              // DEFAULT PORTAL MODULES
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Visual Roadmap Nav Sidebar */}
                <div className="lg:col-span-1 bg-white rounded-3xl p-6 border-4 border-indigo-100 flex flex-col gap-3 h-fit">
                  <h4 className="font-sans font-black text-slate-700 text-xs mb-2 uppercase tracking-wider border-b border-indigo-50 pb-2">Learning Station</h4>
                  
                  {/* Unique Creator Action - Removed from index list per user feedback */}
                  <button
                    onClick={() => {
                      setActiveTab("create");
                      playSound.playClick();
                    }}
                    className={`p-4 rounded-2xl text-left flex items-center justify-between gap-3 transition-all cursor-pointer border-2 ${
                      activeTab === "create"
                        ? "bg-emerald-100 border-emerald-400 text-emerald-950 font-black shadow-md scale-[1.02]"
                        : "bg-emerald-50/40 border-emerald-100/60 hover:bg-emerald-50 text-emerald-800 font-extrabold"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl animate-pulse">🪄</span>
                      <span className="text-xs uppercase tracking-wide">Create AI Lesson</span>
                    </div>
                    {activeTab !== "create" && (
                      <span className="text-[9px] bg-emerald-500 text-white font-sans font-black px-1.5 py-0.5 rounded-full animate-pulse uppercase">NEW</span>
                    )}
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setActiveTab("learn");
                      playSound.playClick();
                    }}
                    className={`p-4 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                      activeTab === "learn"
                        ? "bg-amber-100 text-amber-900 font-black border-l-4 border-amber-500"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                    }`}
                  >
                    <span className="text-xl">🎨</span> 1. Learn Vocabulary
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("listen");
                      playSound.playClick();
                    }}
                    className={`p-4 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                      activeTab === "listen"
                        ? "bg-sky-100 text-sky-900 font-black border-l-4 border-sky-500"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                    }`}
                  >
                    <span className="text-xl">🎧</span> 2. Listening Practice
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("read");
                      playSound.playClick();
                    }}
                    className={`p-4 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer ${
                      activeTab === "read"
                        ? "bg-purple-100 text-purple-900 font-black border-l-4 border-purple-500"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold"
                    }`}
                  >
                    <span className="text-xl">🗣️</span> 3. Speaking Practice
                  </button>

                  {/* Trigger review games */}
                  <button
                    onClick={() => {
                      setActiveGamesActive(true);
                      playSound.playClick();
                    }}
                    className="p-4 rounded-xl text-left flex items-center gap-3 bg-gradient-to-r from-emerald-400 to-green-500 hover:brightness-105 text-white font-black cursor-pointer shadow-md duration-200"
                  >
                    <span className="text-xl animate-bounce">🎮</span> Play Games
                  </button>

                  {/* Trigger test */}
                  <button
                    onClick={() => {
                      setActiveTestActive(true);
                      playSound.playClick();
                    }}
                    className="p-4 rounded-xl text-left flex items-center gap-3 bg-gradient-to-r from-pink-400 to-rose-500 hover:brightness-105 text-white font-black cursor-pointer shadow-md"
                  >
                    <span className="text-xl">🏆</span> Take Quiz
                  </button>

                  {/* Class Lessons Assigned */}
                  <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/60 flex flex-col gap-2.5 mt-4">
                    <div className="border-b border-dashed border-amber-300 pb-1.5 flex justify-between items-center">
                      <h5 className="font-sans font-black text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1">
                        Class Lessons 📅
                      </h5>
                    </div>
                    
                    <div className="flex flex-col gap-3.5 max-h-[220px] overflow-y-auto pr-1">
                      {studentLessons.length === 0 ? (
                        <p className="text-[10px] text-amber-800 bg-amber-50/50 border border-dashed border-amber-200/80 rounded-xl p-3 text-center font-bold font-sans">
                          No lessons are assigned to your classroom yet! Please check back later. ✨
                        </p>
                      ) : (
                        Object.entries(groupLessonsByDate(studentLessons)).map(([dateStr, lessons]) => (
                          <div key={dateStr} className="flex flex-col gap-1.5 pt-0.5">
                            <div className="text-[9px] font-sans font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200/50 w-fit uppercase tracking-wider">
                              {dateStr}
                            </div>
                            <div className="flex flex-col gap-1.5 pl-1">
                              {lessons.map((lesson) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => enterLessonToStudy(lesson.id)}
                                  className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold transition-all relative cursor-pointer truncate ${
                                    selectedLessonId === lesson.id
                                      ? "bg-amber-100 border-amber-400 text-amber-950 font-black shadow-sm scale-[1.01]"
                                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                                  }`}
                                >
                                  <div className="flex items-center gap-1 truncate">
                                    <span className="text-sm shrink-0">{lesson.level === "preschool" ? "🧸" : "⚡"}</span>
                                    <span className="truncate">{lesson.title}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Study History section (Weekly) */}
                  <div className="bg-sky-50/50 rounded-2xl p-4 border border-sky-200/60 flex flex-col gap-2.5 mt-3">
                    <div className="border-b border-dashed border-sky-300 pb-1.5">
                      <h5 className="font-sans font-black text-sky-900 text-xs uppercase tracking-wider flex items-center gap-1">
                        Weekly Study History 🕒
                      </h5>
                      <span className="text-[9.5px] text-sky-700 font-bold">Lessons studied in the past 7 days</span>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {studySessions.filter(s => {
                        if (!loggedInStudent) return false;
                        return s.studentName.toLowerCase() === loggedInStudent.name.toLowerCase() && s.classId === loggedInStudent.classId;
                      }).length === 0 ? (
                        <p className="text-[10px] text-sky-800 bg-sky-50/50 border border-dashed border-sky-100 rounded-xl p-3 text-center font-semibold font-sans">
                          You haven't studied any lessons yet this week. ⭐
                        </p>
                      ) : (
                        studySessions
                          .filter(s => {
                            if (!loggedInStudent) return false;
                            return s.studentName.toLowerCase() === loggedInStudent.name.toLowerCase() && s.classId === loggedInStudent.classId;
                          })
                          .map((session) => {
                            const lesson = lessonsList.find(l => l.id === session.lessonId);
                            if (!lesson) return null;
                            const dateForm = new Date(session.timestamp).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                            return (
                              <button
                                key={`history-${session.lessonId}-${session.timestamp}`}
                                onClick={() => enterLessonToStudy(lesson.id)}
                                className={`w-full text-left p-2 rounded-xl border text-[11px] font-bold transition-all relative cursor-pointer truncate ${
                                  selectedLessonId === lesson.id
                                    ? "bg-sky-100 border-sky-300 text-sky-950 font-black shadow-sm"
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 truncate">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span>📖</span>
                                    <span className="truncate">{lesson.title}</span>
                                  </div>
                                  <span className="text-[9px] font-mono opacity-70 shrink-0 bg-slate-100 px-1 py-0.5 rounded">{dateForm}</span>
                                </div>
                              </button>
                            );
                          })
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-tab view contents */}
                <div className="lg:col-span-3">
                  
                  {/* TAB 1: CREATE (Bé Tự Tạo Bài AI) */}
                  {activeTab === "create" && (
                    <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-dashed border-blue-200 shadow-lg">
                      {/* Playful, friendly welcome heading */}
                      <div className="text-center mb-6 pt-2 pb-2">
                        <h3 className="font-sans font-black text-lg md:text-2xl text-emerald-600 uppercase tracking-tight animate-bounce">
                          🎈 {t("Create a fun lesson here!", "Bé hãy sáng tạo bài học vui nhộn ở đây nhé!")} 🎈
                        </h3>
                        <p className="text-[10px] md:text-xs text-slate-400 font-extrabold italic mt-1.5 uppercase">
                          "Learn today, better tomorrow 🌟"
                        </p>
                      </div>

                      <form onSubmit={handleStudentGenerateLessonSubmit} className="space-y-6 text-xs font-bold text-slate-650">
                        
                        {/* 1. Generation Method Switcher Tabs (Perfect Match with requested visual layout) */}
                        <div className="flex justify-center">
                          <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl w-full border border-slate-200">
                            <button
                              type="button"
                              onClick={() => { setCreateMethod("topic"); playSound.playTing(); }}
                              className={`flex-1 py-3 px-2 rounded-xl font-sans font-black text-xs transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
                                createMethod === "topic"
                                  ? "bg-[#10c469] text-white shadow-md scale-[1.02]"
                                  : "text-slate-600 hover:text-slate-800 bg-transparent"
                              }`}
                            >
                              <span className="text-sm">💡</span>
                              <span>{t("Topic", "Chủ đề")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setCreateMethod("text"); playSound.playTing(); }}
                              className={`flex-1 py-3 px-2 rounded-xl font-sans font-black text-xs transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
                                createMethod === "text"
                                  ? "bg-[#10c469] text-white shadow-md scale-[1.02]"
                                  : "text-slate-600 hover:text-slate-800 bg-transparent"
                              }`}
                            >
                              <span className="text-sm">📝</span>
                              <span>{t("Text", "Văn bản")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setCreateMethod("image"); playSound.playTing(); }}
                              className={`flex-1 py-3 px-2 rounded-xl font-sans font-black text-xs transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer ${
                                createMethod === "image"
                                  ? "bg-[#10c469] text-white shadow-md scale-[1.02]"
                                  : "text-slate-600 hover:text-slate-800 bg-transparent"
                              }`}
                            >
                              <span className="text-sm">📸</span>
                              <span>{t("Image/File", "Hình ảnh")}</span>
                            </button>
                          </div>
                        </div>

                        {/* Interactive Input Box with soft pastel background */}
                        <div className="bg-[#f0f9f4] p-6 rounded-3xl border border-emerald-100/50 text-center max-w-2xl mx-auto w-full">
                          {createMethod === "topic" && (
                            <div className="w-full">
                              <input
                                type="text"
                                placeholder={t("Enter topic (e.g. Animals, My Family...)", "Nhập chủ đề (VD: Animals, My Family...)")}
                                value={studentTopic}
                                onChange={(e) => setStudentTopic(e.target.value)}
                                className="w-full bg-transparent text-emerald-950 placeholder-emerald-700/40 border-0 focus:outline-none focus:ring-0 text-center font-sans font-black text-sm md:text-base tracking-wide"
                              />
                            </div>
                          )}

                          {createMethod === "text" && (
                            <div className="w-full">
                              <textarea
                                rows={3}
                                placeholder={t("Paste vocabulary list or paste content paragraph here...", "Dán danh sách từ vựng hoặc đoạn văn ở đây nhe...")}
                                value={studentRawContent}
                                onChange={(e) => setStudentRawContent(e.target.value)}
                                className="w-full bg-transparent text-emerald-950 placeholder-emerald-700/40 border-0 focus:outline-none focus:ring-0 text-center font-sans font-black text-sm md:text-base tracking-wide"
                              />
                            </div>
                          )}

                          {createMethod === "image" && (
                            <div className="w-full">
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsStudentDraggingFile(true);
                                }}
                                onDragLeave={() => setIsStudentDraggingFile(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsStudentDraggingFile(false);
                                  const file = e.dataTransfer.files[0];
                                  if (file) {
                                    compressImage(file).then((base64Result) => {
                                      setStudentUploadedFile({
                                        name: file.name,
                                        base64: base64Result,
                                        type: file.type,
                                      });
                                      playSound.playSuccess();
                                    });
                                  }
                                }}
                                className="w-full bg-transparent border-0 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                                onClick={() => {
                                  const input = document.createElement("input");
                                  input.type = "file";
                                  input.accept = "image/*, application/pdf";
                                  input.onchange = (e: any) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      compressImage(file).then((base64Result) => {
                                        setStudentUploadedFile({
                                          name: file.name,
                                          base64: base64Result,
                                          type: file.type,
                                        });
                                        playSound.playSuccess();
                                      });
                                    }
                                  };
                                  input.click();
                                }}
                              >
                                {studentUploadedFile ? (
                                  <div className="text-emerald-950 font-bold text-xs p-1">
                                    <p className="font-sans font-black text-sm text-emerald-900">✅ {t("File Selected:", "Đã Chọn Tập Tin:")}</p>
                                    <p className="text-[11px] underline truncate mt-1 text-emerald-800 bg-white/60 px-3 py-1.5 rounded-lg max-w-xs mx-auto">{studentUploadedFile.name}</p>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setStudentUploadedFile(null);
                                        playSound.playClick();
                                      }}
                                      className="text-[10px] text-red-600 hover:underline mt-2.5 font-sans font-black transition-all hover:scale-105 inline-block cursor-pointer bg-transparent border-0"
                                    >
                                      🗑️ {t("Delete & Reupload", "Xoá và tải lại")}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center text-emerald-800/80 hover:text-emerald-900 transition-colors">
                                    <p className="font-sans font-black text-sm text-emerald-800">📸 {t("Drag & Drop or Click to Upload Material", "Kéo thả hoặc Nhấp để chọn ảnh chụp tài liệu")}</p>
                                    <p className="text-[10px] opacity-75 mt-1 font-semibold">{t("Supports homework photos, workbook pages, worksheets...", "Chấp nhận ảnh bài tập về nhà, sách giáo khoa...")}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. English Level Selector incorporating the 4 Cambridge Stages */}
                        <div className="space-y-1.5">
                          <label className="block text-slate-500 uppercase tracking-wider font-extrabold text-[10px] text-center mb-1">
                            {t("Select English Level", "Chọn trình độ phù hợp")}:
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
                            <button
                              type="button"
                              onClick={() => { setStudentLevel("pre-starter"); playSound.playTing(); }}
                              className={`py-3 px-1 rounded-2xl border-2 cursor-pointer text-center duration-155 transition-all font-black flex flex-col items-center justify-center gap-1 ${
                                studentLevel === "pre-starter"
                                  ? "bg-[#034CBD] border-[#034CBD] text-white shadow-md scale-[1.03]"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650"
                              }`}
                            >
                              <span className="text-lg">🧸</span>
                              <span className="text-[11px] uppercase tracking-wide">Pre-Starters</span>
                              <span className="text-[8px] font-bold opacity-80">{t("Ages 4-6", "Bé 4 - 6 tuổi")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setStudentLevel("starter"); playSound.playTing(); }}
                              className={`py-3 px-1 rounded-2xl border-2 cursor-pointer text-center duration-155 transition-all font-black flex flex-col items-center justify-center gap-1 ${
                                studentLevel === "starter"
                                  ? "bg-[#034CBD] border-[#034CBD] text-white shadow-md scale-[1.03]"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650"
                              }`}
                            >
                              <span className="text-lg">🎈</span>
                              <span className="text-[11px] uppercase tracking-wide">Starters</span>
                              <span className="text-[8px] font-bold opacity-80">{t("Ages 6-8", "Bé 6 - 8 tuổi")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setStudentLevel("mover"); playSound.playTing(); }}
                              className={`py-3 px-1 rounded-2xl border-2 cursor-pointer text-center duration-155 transition-all font-black flex flex-col items-center justify-center gap-1 ${
                                studentLevel === "mover"
                                  ? "bg-[#034CBD] border-[#034CBD] text-white shadow-md scale-[1.03]"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650"
                              }`}
                            >
                              <span className="text-lg">🚀</span>
                              <span className="text-[11px] uppercase tracking-wide">Movers</span>
                              <span className="text-[8px] font-bold opacity-80">{t("Ages 8-10", "Bé 8 - 10 tuổi")}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => { setStudentLevel("flyer"); playSound.playTing(); }}
                              className={`py-3 px-1 rounded-2xl border-2 cursor-pointer text-center duration-155 transition-all font-black flex flex-col items-center justify-center gap-1 ${
                                studentLevel === "flyer"
                                  ? "bg-[#034CBD] border-[#034CBD] text-white shadow-md scale-[1.03]"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650"
                              }`}
                            >
                              <span className="text-lg">🦅</span>
                              <span className="text-[11px] uppercase tracking-wide">Flyers</span>
                              <span className="text-[8px] font-bold opacity-80">{t("Ages 10-12", "Bé 10 - 12 tuổi")}</span>
                            </button>
                          </div>
                        </div>

                        {/* Solid Green 3D Push Button per image 2 instructions */}
                        <div className="pt-2 flex justify-center">
                          <button
                            type="submit"
                            disabled={isGenerating}
                            className="w-full max-w-lg py-4 px-6 rounded-2xl bg-[#10c469] hover:bg-[#0fbd64] text-white font-sans font-black text-sm tracking-wider shadow-md border-b-4 border-[#099951] active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2 duration-150 transform hover:-translate-y-0.5"
                          >
                            {isGenerating ? (
                              <span className="flex items-center gap-2 animate-pulse font-sans font-black">
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                {t("Co Phuong Uyen is preparing your magical lesson... 🔮", "Cô Phượng Uyên đang soạn bài giảng của bé... 🔮")}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 uppercase font-sans font-black">
                                <span>🚀</span>
                                <span>{t("START NOW!", "BẮT ĐẦU NGAY!")}</span>
                              </span>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TAB 1: LEARN (Học từ vựng) */}
                  {activeTab === "learn" && activeLesson && activeLesson.words.length > 0 && (
                    <div className="flex flex-col items-center">
                      <p className="text-center text-xs font-black text-slate-500 mb-6 uppercase tracking-wider">
                        {t("Tap on the card to see its English meaning ✨", "Bé chạm vào thẻ để xem nghĩa tiếng Việt nhé ✨")}
                      </p>

                      {/* Interactive Flip Card */}
                      <div className="relative w-80 h-96 cursor-pointer group mb-6" onClick={() => {
                        setIsFlipped(!isFlipped);
                        // Trigger stars on flip
                        triggerStarAward(1);
                      }}>
                        <div
                          className={`w-full h-full rounded-3xl p-6 transition-all duration-500 border-8 border-yellow-200 bg-white shadow-xl flex flex-col justify-between items-center ${
                            isFlipped ? "bg-amber-50" : ""
                          }`}
                        >
                          {!isFlipped ? (
                            // Front of card
                            <>
                              <div className="w-full flex justify-between items-center border-b border-dashed border-slate-100 pb-2">
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-sans font-black">
                                  {activeWordIdx + 1} / {activeLesson.words.length}
                                </span>
                                <span className="text-xs font-semibold text-slate-400">{t("Tap to Flip ➡", "Chạm thẻ lật nghĩa ➡")}</span>
                              </div>

                              <div className="flex-1 flex flex-col items-center justify-center">
                                <motion.span
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ repeat: Infinity, duration: 4 }}
                                  className="text-8xl mb-4"
                                >
                                  {activeLesson.words[activeWordIdx].illustration}
                                </motion.span>
                                <h3 className="font-sans font-black text-4xl text-indigo-900 tracking-tight">
                                  {activeLesson.words[activeWordIdx].word}
                                </h3>
                                <p className="font-mono text-purple-600 text-md mt-1 italic font-semibold">
                                  {activeLesson.words[activeWordIdx].phonetic}
                                </p>
                              </div>

                              <div className="w-full flex items-center justify-center pt-2">
                                <SoundButton text={activeLesson.words[activeWordIdx].word} size="lg" slow />
                              </div>
                            </>
                          ) : (
                            // Back of card
                            <>
                              <div className="w-full flex justify-between items-center border-b border-dashed border-amber-200 pb-2">
                                <span className="text-xs font-black text-amber-700">{t("✓ Card Details", "✓ Chi tiết thẻ")}</span>
                                <span className="text-xs font-semibold text-amber-600">{t("Flip Back ⬅", "Lật lại ⬅")}</span>
                              </div>

                              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full">
                                {/* English Word & Sound */}
                                <div className="flex items-center justify-center gap-2 mb-1">
                                  <h4 className="font-sans font-black text-2xl text-indigo-900">
                                    {activeLesson.words[activeWordIdx].word}
                                  </h4>
                                  <SoundButton text={activeLesson.words[activeWordIdx].word} size="sm" slow />
                                </div>

                                {/* Phonetic (IPA) */}
                                <p className="font-mono text-purple-600 text-sm italic font-semibold mb-3">
                                  {activeLesson.words[activeWordIdx].phonetic}
                                </p>

                                {/* Vietnamese Translation */}
                                <h5 className="font-sans font-black text-xl text-amber-600 bg-amber-100/50 px-4 py-1.5 rounded-full mb-4">
                                  {activeLesson.words[activeWordIdx].translation}
                                </h5>
                                
                                {/* Example Sentence - only show if the word is not identical to the example sentence */}
                                {activeLesson.words[activeWordIdx].word.toLowerCase().replace(/[^a-z]/gi, "") !== activeLesson.words[activeWordIdx].sentence.toLowerCase().replace(/[^a-z]/gi, "") && (
                                  <div className="bg-indigo-50/50 rounded-2xl p-3 border border-indigo-100/50 w-full">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1.5">{t("Example Sentence", "Mẫu câu")}</p>
                                    <div className="flex items-center justify-center gap-2">
                                      <p className="font-sans font-bold text-sm text-indigo-950 leading-snug">
                                        {activeLesson.words[activeWordIdx].sentence}
                                      </p>
                                      <SoundButton text={activeLesson.words[activeWordIdx].sentence} size="sm" slow />
                                    </div>
                                    <p className="font-sans font-medium text-xs text-slate-500 mt-1 italic leading-snug">
                                      ({activeLesson.words[activeWordIdx].sentenceTranslation})
                                    </p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Controls Switch vocab */}
                      <div className="flex items-center gap-6">
                        <button
                          onClick={prevWord}
                          className="px-6 py-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-sans font-black text-sm cursor-pointer"
                        >
                          {t("Previous", "Từ Trước")}
                        </button>
                        <button
                          onClick={nextWord}
                          className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-500 text-white font-sans font-black text-sm cursor-pointer shadow-md"
                        >
                          {t("Next", "Từ Kế Tiếp")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LISTEN PRACTICE (Bé luyện nghe) */}
                  {activeTab === "listen" && activeLesson && (
                    <div className="bg-white rounded-3xl p-6 border-4 border-sky-100">
                      <h4 className="font-sans font-black text-sky-800 text-lg mb-4 text-center">{t("Listen & Practice 🎧", "Bé Luyện Nghe Tiếng Anh 🎧")}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeLesson.words.map((w) => (
                          <div
                            key={w.id}
                            className="p-4 bg-sky-50/50 rounded-2xl border-2 border-sky-100 flex flex-col gap-3"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-4xl">{w.illustration}</span>
                                <div>
                                  <h5 className="font-sans font-black text-indigo-900 text-sm leading-none">{w.word}</h5>
                                  <p className="text-xs text-slate-500 mt-1">{w.translation}</p>
                                </div>
                              </div>

                              <div
                                onClick={() => triggerStarAward(1)}
                                className="focus:outline-none"
                              >
                                <SoundButton text={w.word} size="md" />
                              </div>
                            </div>

                            {/* Sentence section */}
                            <div className="bg-sky-100/50 rounded-xl px-3 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1">
                                  <p className="font-sans font-semibold text-xs text-indigo-800 leading-snug">
                                    {w.sentence}
                                  </p>
                                  <p className="font-sans text-xs text-slate-500 mt-0.5 italic leading-snug">
                                    {w.sentenceTranslation}
                                  </p>
                                </div>
                                <div
                                  onClick={() => triggerStarAward(1)}
                                  className="focus:outline-none flex-shrink-0"
                                >
                                  <SoundButton text={w.sentence} size="sm" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: READ RECORDING PRACTICE (Luyện đọc & Ghi âm) */}
                  {activeTab === "read" && activeLesson && (
                    <div className="bg-white rounded-3xl p-6 border-4 border-purple-100">
                      <h4 className="font-sans font-black text-purple-800 text-lg mb-2 text-center">Phòng Thu Âm Của Bé 🎙️</h4>

                      <div className="flex flex-col gap-6">
                        <div className="flex gap-2 overflow-x-auto pb-3 border-b border-purple-150">
                          {activeLesson.words.map((w, index) => (
                            <button
                              key={w.id}
                              onClick={() => {
                                setActiveWordIdx(index);
                                playSound.playClick();
                              }}
                              className={`px-4 py-2 rounded-full text-xs font-sans font-black cursor-pointer whitespace-nowrap transition-all border-2 ${
                                activeWordIdx === index
                                  ? "bg-purple-100 border-purple-400 text-purple-700"
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {w.illustration} {w.word}
                            </button>
                          ))}
                        </div>

                        {/* Speech card info */}
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-center p-4 bg-purple-50/50 rounded-2xl">
                          <span className="text-7xl">{activeLesson.words[activeWordIdx].illustration}</span>
                          <div className="text-center md:text-left">
                            <h4 className="font-sans font-black text-2xl text-purple-900 leading-none mb-1">
                              {activeLesson.words[activeWordIdx].word}
                            </h4>
                            <p className="font-mono text-xs text-purple-500 font-semibold mb-2">
                              {activeLesson.words[activeWordIdx].phonetic}
                            </p>
                            {/* Sentence in read/speaking tab */}
                            <div className="bg-purple-100/50 rounded-xl px-3 py-2 mb-3">
                              <p className="font-sans font-semibold text-sm text-purple-900 leading-snug">
                                {activeLesson.words[activeWordIdx].sentence}
                              </p>
                              <p className="font-sans text-xs text-slate-500 mt-1 italic leading-snug">
                                {activeLesson.words[activeWordIdx].sentenceTranslation}
                              </p>
                            </div>
                            <div className="flex gap-2 items-center justify-center md:justify-start">
                              <SoundButton text={activeLesson.words[activeWordIdx].word} size="md" />
                              <SoundButton text={activeLesson.words[activeWordIdx].sentence} size="sm" />
                            </div>
                          </div>
                        </div>

                        {/* Mounted Rec module */}
                        <AudioRecorder
                          expectedText={activeLesson.words[activeWordIdx].word}
                          onRecordComplete={handleVocalComplete}
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* SẮP XẾP BÁO CÁO KẾT QUẢ KIỂM TRA (Test result reports) */}
            {testReport && (
              <div className="bg-white/90 rounded-3xl p-8 border-8 border-indigo-200 max-w-2xl mx-auto shadow-2xl relative text-center mt-6">
                
                {/* Visual success indicators */}
                <div className="text-8xl mb-4 text-center">
                  {testReport.score === 100 ? "👑" : "🌟"}
                </div>
                <h4 className="font-sans font-black text-indigo-900 text-2xl mb-2">Báo Cáo Thành Tích Bài Học!</h4>
                <p className="text-xs text-slate-400 uppercase font-black mb-4">Hoàn thành kì kiểm tra sát hạch học sinh</p>

                {/* Score circle layout */}
                <div className="inline-flex items-center justify-center h-28 w-28 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 text-white font-mono font-black text-2xl mb-6 shadow border-4 border-white animate-pulse">
                  {testReport.score}/100 đ
                </div>

                <p className="text-slate-600 max-w-md mx-auto mb-6">
                  Chúc mừng bé {loggedInStudent ? <span className="font-sans font-black text-indigo-750">"{loggedInStudent.name}"</span> : "đã hoàn thành"} đã trả lời đúng <span className="font-sans font-black text-indigo-750">{testReport.correctCount}</span> trên tổng số <span className="font-extrabold">{testReport.totalQuestions}</span> câu thử thách của cô giáo!
                </p>

                {/* Dynamic Certificate button showing up straight away */}
                <div className="mb-6 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 p-4 rounded-2xl max-w-md mx-auto flex flex-col items-center gap-3 shadow-inner">
                  <span className="text-3xl">📜</span>
                  <div className="text-center">
                    <h5 className="font-sans font-black text-xs text-amber-900 leading-none">NHẬN CHỨNG CHỈ TỐT NGHIỆP</h5>
                    <p className="text-[10px] text-amber-700 font-bold mt-1">Hệ thống đã cấp Giấy khen danh dự có tên của Bé!</p>
                  </div>
                  <button
                    onClick={() => {
                      const mockAttempt: TestAttempt = {
                        id: `att-now-${Date.now()}`,
                        studentName: loggedInStudent?.name || "Học Sinh Tự Điền",
                        classId: loggedInStudent?.classId || "free",
                        className: loggedInStudent?.className || "Tự do",
                        lessonId: activeLesson.id,
                        lessonTitle: activeLesson.title,
                        score: testReport.score,
                        level: activeLesson.level,
                        timestamp: Date.now(),
                        teacherName: loggedInStudent?.teacherName || "Cô Thảo"
                      };
                      openCertificate(mockAttempt);
                    }}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-sans font-black text-xs flex items-center gap-1 cursor-pointer shadow border-b-2 border-amber-700 transition"
                  >
                    <Award className="h-4 w-4" /> Xem & Sửa Giấy Chứng Nhận 🏆
                  </button>
                </div>

                {/* Badges Area Award */}
                {testReport.badgesEarned.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-sans font-black text-slate-600 text-xs mb-3 uppercase tracking-wider">Huy Hiệu Nhận Được</h5>
                    <div className="flex flex-wrap gap-4 justify-center">
                      {testReport.badgesEarned.map((badge) => (
                        <div
                          key={badge.id}
                          className={`p-4 rounded-2xl bg-gradient-to-b ${badge.color} text-white shadow max-w-xs flex items-center gap-3`}
                        >
                          <span className="text-4xl">{badge.icon}</span>
                          <div className="text-left">
                            <h6 className="font-sans font-black text-xs leading-none">{badge.title}</h6>
                            <p className="text-[10px] leading-tight text-white/80 mt-1">{badge.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Words list */}
                {testReport.wrongWords.length > 0 && (
                  <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 text-left max-w-md mx-auto mb-6">
                    <p className="text-xs font-black uppercase text-amber-700 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="h-4 w-4 shrink-0" /> Từ bé cần ôn tập lại:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {testReport.wrongWords.map((ww) => (
                        <span key={ww.id} className="bg-white text-slate-800 text-xs font-bold px-3 py-1 rounded shadow-sm flex items-center gap-1">
                          <span>{ww.illustration}</span> {ww.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close controllers */}
                <div className="flex items-center justify-center gap-4 border-t border-dashed border-slate-100 pt-6">
                  <button
                    onClick={() => {
                        setTestReport(null);
                        setActiveTestActive(true);
                        playSound.playClick();
                    }}
                    className="px-6 py-2.5 rounded-full bg-slate-100 text-slate-600 font-sans font-black text-sm hover:bg-slate-200 cursor-pointer"
                  >
                    Làm Lại Bài Thi
                  </button>

                  <button
                    onClick={() => {
                        setTestReport(null);
                        playSound.playTing();
                    }}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-sans font-black text-sm shadow hover:brightness-105 cursor-pointer"
                  >
                    Quay Lại Học Tiếp
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer Section */}
      <footer className="mt-16 bg-gradient-to-b from-blue-700 to-indigo-950 text-white border-t-8 border-indigo-950 pt-12 pb-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-white/10 pb-8">
            
            {/* Logo and Slogan Column (5 cols) */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-2xl border-2 border-blue-100 flex items-center justify-center shrink-0 w-16 h-16">
                  <LogoSVG className="h-full w-auto" />
                </div>
                <div>
                  <h3 className="font-sans font-black text-lg tracking-tight uppercase leading-none">
                    Trung Tâm Cô Phượng Uyên
                  </h3>
                  <p className="text-[11px] font-bold text-sky-100 uppercase tracking-wide mt-1.5">
                    Learn today, better tomorrow 🌟
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-100/90 leading-relaxed font-semibold italic mt-1 font-sans">
                "Đồng hành cùng học viên xây dựng nền móng vững chắc, mở khóa tương lai tươi sáng và chắp cánh ước mơ tiếng Anh bay xa."
              </p>
            </div>

            {/* Address Details Column (4 cols) */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <h4 className="font-sans font-extrabold text-sm uppercase tracking-wider text-sky-200 border-l-4 border-white pl-2 leading-none">
                📍 Thông Tin Đào Tạo
              </h4>
              <div className="flex flex-col gap-2.5 text-xs text-sky-50 leading-relaxed font-bold">
                <div className="flex gap-2">
                  <span className="text-sm shrink-0">🏛️</span>
                  <p>
                    <span className="text-white block uppercase text-[10px] tracking-wider mb-0.5">Giám Đốc Trung Tâm:</span>
                    Võ Thùy Phượng Uyên
                  </p>
                </div>
                <div className="flex gap-2 border-t border-white/5 pt-2">
                  <span className="text-sm shrink-0">✨</span>
                  <p>
                    <span className="text-white block uppercase text-[10px] tracking-wider mb-0.5">Phương Châm:</span>
                    Learn today, better tomorrow • Dễ tiếp thu, nâng chuẩn rèn luyện toàn diện
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Social Links (3 cols) */}
            <div className="md:col-span-3 flex flex-col gap-4">
              <h4 className="font-sans font-extrabold text-sm uppercase tracking-wider text-sky-200 border-l-4 border-white pl-2 leading-none">
                ✨ LIÊN HỆ ĐĂNG KÝ
              </h4>
              <div className="flex flex-col gap-3">
                <a
                  href="tel:0985846325"
                  className="bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-2xl flex items-center gap-3 border border-white/10 group cursor-pointer"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">📱</span>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-sky-200 font-extrabold leading-none">Hotline / Zalo Cô Phượng Uyên</span>
                    <span className="text-sm font-black text-white">0985.846.325</span>
                  </div>
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=100045429101693"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 transition-colors p-3 rounded-2xl flex items-center gap-3 border border-white/10 group cursor-pointer"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">🌐</span>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-sky-200 font-extrabold leading-none">Facebook Giám Đốc</span>
                    <span className="text-xs font-black text-white hover:underline truncate max-w-[150px] block">Ghé thăm Facebook Cô Phượng Uyên 🎉</span>
                  </div>
                </a>
              </div>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-sky-200/80 font-bold gap-2">
            <p>© {new Date().getFullYear()} Trung Tâm Ngoại Ngữ Cô Phượng Uyên. Learn today, better tomorrow.</p>
            <p className="flex items-center gap-1.5 bg-white/5 py-1 px-3 rounded-full border border-white/5">
              <span>👑 Tự Hào Chinh Phục Kiến Thức Anh Ngữ</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
