/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

interface StudentParticipant {
  name: string;
  phone: string;
}

interface Classroom {
  id: string;
  name: string;
  students: StudentParticipant[];
  createdAt: number;
}

interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  phonetic: string;
  sentence: string;
  sentenceTranslation: string;
  illustration: string;
  category: string;
}

interface Lesson {
  id: string;
  title: string;
  level: string;
  words: VocabularyItem[];
  createdAt: number;
  classId?: string;
  deadline?: number;
}

interface TestAttempt {
  id: string;
  studentName: string;
  classId: string;
  className: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  level: string;
  timestamp: number;
  teacherName: string;
  isLate?: boolean;
}

// In-Memory Database variables
let classroomsList: Classroom[] = [
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

let testAttempts: TestAttempt[] = [
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

let lessonsList: Lesson[] = [
  {
    id: "lesson-1",
    title: "🤖 Từ Vựng Động Vật Đáng Yêu",
    level: "preschool",
    createdAt: Date.now() - 86400000,
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
  },
  {
    id: "lesson-2",
    title: "🍎 Trái Cây Ngọt Lịm Cho Bé Thơ",
    level: "preschool",
    createdAt: Date.now() - 172800000,
    words: [
      {
        id: "ff1",
        word: "Apple",
        translation: "Quả táo",
        phonetic: "/ˈæp.əl/",
        sentence: "I love eating crunchy red apples.",
        sentenceTranslation: "Tớ cực kỳ thích ăn những quả táo đỏ giòn rụm.",
        illustration: "🍎",
        category: "Fruits",
      },
      {
        id: "ff2",
        word: "Banana",
        translation: "Quả chuối",
        phonetic: "/bəˈnɑː.nə/",
        sentence: "Bananas are sweet and yellow.",
        sentenceTranslation: "Những quả chuối vừa ngọt vừa có màu vàng óng.",
        illustration: "🍌",
        category: "Fruits",
      },
      {
        id: "ff3",
        word: "Orange",
        translation: "Quả cam",
        phonetic: "/ˈɒr.ɪndʒ/",
        sentence: "Fresh orange juice is full of vitamins.",
        sentenceTranslation: "Nước cam tươi có chứa rất nhiều vitamin bổ dưỡng.",
        illustration: "🍊",
        category: "Fruits",
      }
    ]
  }
];

const DB_FILE = path.join(process.cwd(), "db.json");

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.classroomsList && Array.isArray(parsed.classroomsList)) {
        classroomsList = parsed.classroomsList;
      }
      if (parsed.lessonsList && Array.isArray(parsed.lessonsList)) {
        lessonsList = parsed.lessonsList;
      }
      if (parsed.testAttempts && Array.isArray(parsed.testAttempts)) {
        testAttempts = parsed.testAttempts;
      }
      console.log("[DB] Successfully loaded data from file-system database.");
    } else {
      console.log("[DB] No database file found. Initializing db.json with default values.");
      saveDb();
    }
  } catch (err) {
    console.warn("[DB] Had trouble loading DB file:", err);
  }
}

function saveDb() {
  try {
    const data = {
      classroomsList,
      lessonsList,
      testAttempts
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[DB] Had trouble writing to DB file:", err);
  }
}

// Immediately load DB on boot
loadDb();

// Initialize Gemini API Client
// Set User-Agent as 'aistudio-build' for telemetry as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Helper to translate common words or sentences in fallback mode
function getFallbackTranslation(english: string): string {
  const dict: Record<string, string> = {
    "this is my classroom": "Đây là lớp học của tớ.",
    "this is my classroom.": "Đây là lớp học của tớ.",
    "classroom": "Lớp học",
    "teacher": "Giáo viên",
    "student": "Học sinh",
    "school": "Trường học",
    "book": "Quyển sách",
    "pencil": "Bút chì",
    "desk": "Bàn học",
    "chair": "Ghế",
    "blackboard": "Bảng đen",
    "hello": "Xin chào",
    "good morning": "Chào buổi sáng",
    "thank you": "Cảm ơn bạn",
    "how are you": "Bạn có khỏe không?",
    "i like english": "Tớ thích học tiếng Anh."
  };
  
  const key = english.toLowerCase().trim();
  const cleanKey = key.endsWith(".") ? key.slice(0, -1).trim() : key;
  return dict[key] || dict[cleanKey] || english;
}

// ----------------------------------------------------------------
// HIGH-QUALITY OFFLINE COMMON WORDS DICTIONARY & POST-PROCESSING
// Prevents lazy AI translation (e.g. Teacher -> Teacher) or phonetic
// placeholder generations (e.g. /teacher/).
// ----------------------------------------------------------------
const commonWordsDict: Record<string, DictionaryEntry> = {
  "teacher": { translation: "Giáo viên", phonetic: "/ˈtiːtʃə(r)/", sentence: "I love my teacher.", sentenceTranslation: "Tôi yêu cô giáo của tôi." },
  "student": { translation: "Học sinh", phonetic: "/ˈstjuːdnt/", sentence: "I am a good student.", sentenceTranslation: "Tôi là một học sinh ngoan." },
  "classroom": { translation: "Lớp học", phonetic: "/ˈklɑːsruːm/", sentence: "I like my classroom.", sentenceTranslation: "Tôi yêu lớp học của tôi." },
  "schoolbag": { translation: "Cặp sách", phonetic: "/ˈskuːlbæɡ/", sentence: "I put books in my schoolbag.", sentenceTranslation: "Tôi cất sách vào cặp." },
  "homework": { translation: "Bài tập về nhà", phonetic: "/ˈhəʊmwɜːk/", sentence: "I do my homework every day.", sentenceTranslation: "Tôi làm bài tập về nhà mỗi ngày." },
  "playground": { translation: "Sân chơi", phonetic: "/ˈpleɪɡraʊnd/", sentence: "I run in the playground.", sentenceTranslation: "Tôi chạy nhảy ở sân chơi." },
  "home": { translation: "Nhà", phonetic: "/həʊm/", sentence: "I go home after school.", sentenceTranslation: "Tôi về nhà sau giờ học." },
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
  "crayons": { translation: "Bút sáp màu", phonetic: "/ˈkreɪɒnz/", sentence: "I color with my crayons.", sentenceTranslation: "Tôi tô màu bằng bút sáp màu của tôi." },
  "paper": { translation: "Tờ giấy", phonetic: "/ˈpeɪpə(r)/", sentence: "I draw on a piece of paper.", sentenceTranslation: "Tôi vẽ trên một tờ giấy." },
  "table": { translation: "Cái bàn", phonetic: "/ˈteɪbl/", sentence: "We sit around the big table.", sentenceTranslation: "Chúng tôi ngồi quanh cái bàn lớn." },
  "clock": { translation: "Đồng hồ", phonetic: "/klɒk/", sentence: "The clock shows the time.", sentenceTranslation: "Đồng hồ chỉ giờ." },
  "fish": { translation: "Con cá", phonetic: "/fɪʃ/", sentence: "The little fish swims in the water.", sentenceTranslation: "Chú cá nhỏ bơi lội trong nước." },
  "bear": { translation: "Con gấu", phonetic: "/beə(r)/", sentence: "The brown bear is very big.", sentenceTranslation: "Chú gấu nâu trông rất to lớn." },
  "duck": { translation: "Con vịt", phonetic: "/dʌk/", sentence: "The yellow duck swims in the pond.", sentenceTranslation: "Chú vịt vàng bơi trong ao." },
  "pig": { translation: "Con heo", phonetic: "/pɪɡ/", sentence: "The pink pig likes to play.", sentenceTranslation: "Chú heo hồng thích vui đùa." },
  "chicken": { translation: "Con gà", phonetic: "/ˈtʃɪkɪn/", sentence: "The chicken lays an egg.", sentenceTranslation: "Con gà đẻ một quả trứng." },
  "cow": { translation: "Con bò", phonetic: "/kaʊ/", sentence: "The cow gives us fresh milk.", sentenceTranslation: "Con bò cho chúng ta sữa tươi." },
  "horse": { translation: "Con ngựa", phonetic: "/hɔːs/", sentence: "The horse runs very fast.", sentenceTranslation: "Con ngựa chạy rất nhanh." },
  "sheep": { translation: "Con cừu", phonetic: "/ʃiːp/", sentence: "The sheep has soft white wool.", sentenceTranslation: "Con cừu có bộ lông trắng mềm mại." },
  "mouse": { translation: "Con chuột", phonetic: "/mʊs/", sentence: "The little mouse likes cheese.", sentenceTranslation: "Chú chuột nhỏ rất thích phô mai." },
  "tiger": { translation: "Con hổ", phonetic: "/ˈtaɪɡə(r)/", sentence: "The strong tiger roars loudly.", sentenceTranslation: "Chú hổ dũng mãnh gầm thật to." },
  "zebra": { translation: "Ngựa vằn", phonetic: "/ˈzebrə/", sentence: "The zebra has black and white stripes.", sentenceTranslation: "Ngựa vằn có những sọc đen và trắng." },
  "giraffe": { translation: "Hươu cao cổ", phonetic: "/dʒəˈrɑːf/", sentence: "The giraffe has a very long neck.", sentenceTranslation: "Hươu cao cổ có cái cổ rất dài." },
  "hippo": { translation: "Hà mã", phonetic: "/ˈhɪpəʊ/", sentence: "The hippo opens its big mouth.", sentenceTranslation: "Hà mã há chiếc miệng thật to." },
  "turtle": { translation: "Con rùa", phonetic: "/ˈtɜːtl/", sentence: "The slow turtle carries its shell.", sentenceTranslation: "Chú rùa chậm chạp mang chiếc mai của mình." },
  "spider": { translation: "Con nhện", phonetic: "/ˈspaɪdə(r)/", sentence: "The spider spins a big web.", sentenceTranslation: "Con nhện chăng một cái mạng lớn." },
  "ant": { translation: "Con kiến", phonetic: "/ænt/", sentence: "The tiny ant works very hard.", sentenceTranslation: "Chú kiến nhỏ bé làm việc rất chăm chỉ." },
  "bee": { translation: "Con ong", phonetic: "/biː/", sentence: "The busy bee makes sweet honey.", sentenceTranslation: "Chú ong chăm chỉ làm ra mật ngọt." },
  "flower": { translation: "Bông hoa", phonetic: "/ˈflaʊə(r)/", sentence: "This red flower smells so sweet.", sentenceTranslation: "Bông hoa đỏ này có mùi thật thơm." },
  "tree": { translation: "Cái cây", phonetic: "/triː/", sentence: "The tall tree has many green leaves.", sentenceTranslation: "Cái cây cao có rất nhiều lá xanh." },
  "leaf": { translation: "Chiếc lá", phonetic: "/liːf/", sentence: "The green leaf falls from the tree.", sentenceTranslation: "Chiếc lá xanh rơi xuống từ trên cây." },
  "sun": { translation: "Mặt trời", phonetic: "/sʌn/", sentence: "The yellow sun shines in the sky.", sentenceTranslation: "Mặt trời vàng óng tỏa sáng trên bầu trời." },
  "moon": { translation: "Mặt trăng", phonetic: "/muːn/", sentence: "The bright moon is in the sky.", sentenceTranslation: "Mặt trăng sáng tỏ đang ở trên bầu trời." },
  "star": { translation: "Ngôi sao", phonetic: "/stɑː(r)/", sentence: "The little star twinkles at night.", sentenceTranslation: "Ngôi sao nhỏ lấp lánh vào ban đêm." },
  "cloud": { translation: "Đám mây", phonetic: "/klaʊd/", sentence: "The white cloud looks like cotton.", sentenceTranslation: "Đám mây trắng trông giống như kẹo bông." },
  "rain": { translation: "Cơn mưa", phonetic: "/reɪn/", sentence: "The rain helps the plants grow.", sentenceTranslation: "Cơn mưa giúp cây cối xanh tốt." },
  "sky": { translation: "Bầu trời", phonetic: "/skaɪ/", sentence: "The clear sky is very blue today.", sentenceTranslation: "Bầu trời quang đãng hôm nay rất xanh." },
  "water": { translation: "Nước", phonetic: "/ˈwɔːtə(r)/", sentence: "I drink water every day.", sentenceTranslation: "Tôi uống nước mỗi ngày." },
  "milk": { translation: "Sữa", phonetic: "/mɪlk/", sentence: "I like to drink sweet milk.", sentenceTranslation: "Tôi rất thích uống sữa ngọt." },
  "bread": { translation: "Bánh mì", phonetic: "/bred/", sentence: "I eat soft bread for breakfast.", sentenceTranslation: "Tôi ăn bánh mì mềm vào bữa sáng." },
  "rice": { translation: "Cơm", phonetic: "/raɪs/", sentence: "I eat rice with fish.", sentenceTranslation: "Tôi ăn cơm với cá." },
  "cake": { translation: "Bánh ngọt", phonetic: "/keɪk/", sentence: "The chocolate cake is yummy.", sentenceTranslation: "Chiếc bánh ngọt sô-cô-la thật ngon tuyệt." },
  "sweet": { translation: "Kẹo ngọt", phonetic: "/swiːt/", sentence: "The colorful sweet is very tasty.", sentenceTranslation: "Viên kẹo nhiều màu sắc ăn rất ngon." },
  "ice cream": { translation: "Kem", phonetic: "/ˌaɪs ˈkriːm/", sentence: "I love eating cold ice cream.", sentenceTranslation: "Tôi thích ăn kem lạnh." },
  "toy": { translation: "Đồ chơi", phonetic: "/tɔɪ/", sentence: "I share my toy with my friend.", sentenceTranslation: "Tôi chia sẻ đồ chơi của mình với bạn." },
  "ball": { translation: "Quả bóng", phonetic: "/bɔːl/", sentence: "I kick the round ball.", sentenceTranslation: "Tôi đá quả bóng tròn." },
  "doll": { translation: "Búp bê", phonetic: "/dɒl/", sentence: "My cute doll has a beautiful dress.", sentenceTranslation: "Búp bê dễ thương của tôi có một chiếc váy đẹp." },
  "car": { translation: "Ô tô", phonetic: "/kɑː(r)/", sentence: "The toy car goes fast.", sentenceTranslation: "Chiếc ô tô đồ chơi chạy rất nhanh." },
  "train": { translation: "Tàu hỏa", phonetic: "/treɪn/", sentence: "The long train goes choo choo.", sentenceTranslation: "Đoàn tàu hỏa dài kêu tu tu." },
  "plane": { translation: "Máy bay", phonetic: "/pleɪn/", sentence: "The plane flies high in the sky.", sentenceTranslation: "Máy bay bay cao trên bầu trời." },
  "boat": { translation: "Thuyền", phonetic: "/bəʊt/", sentence: "The boat sails on the river.", sentenceTranslation: "Chiếc thuyền căng buồm trên dòng sông." },
  "bike": { translation: "Xe đạp", phonetic: "/baɪk/", sentence: "I ride my bike in the park.", sentenceTranslation: "Tôi đạp xe đạp trong công viên." },
  "red": { translation: "Màu đỏ", phonetic: "/red/", sentence: "The juicy apple is red.", sentenceTranslation: "Quả táo mọng nước có màu đỏ." },
  "blue": { translation: "Màu xanh dương", phonetic: "/bluː/", sentence: "The wide sky is blue.", sentenceTranslation: "Bầu trời rộng lớn có màu xanh dương." },
  "green": { translation: "Màu xanh lá", phonetic: "/ɡriːn/", sentence: "The fresh grass is green.", sentenceTranslation: "Bãi cỏ tươi tắn có màu xanh lá." },
  "yellow": { translation: "Màu vàng", phonetic: "/ˈjeləʊ/", sentence: "The bright sun is yellow.", sentenceTranslation: "Ông mặt trời rực rỡ có màu vàng." },
  "pink": { translation: "Màu hồng", phonetic: "/pɪŋk/", sentence: "The pretty flower is pink.", sentenceTranslation: "Bông hoa xinh xắn có màu hồng." },
  "purple": { translation: "Màu tím", phonetic: "/ˈpɜːpl/", sentence: "I have a purple grape.", sentenceTranslation: "Tôi có một quả nho màu tím." },
  "black": { translation: "Màu đen", phonetic: "/blæk/", sentence: "The cat in the dark is black.", sentenceTranslation: "Chú mèo trong bóng tối có màu đen." },
  "white": { translation: "Màu trắng", phonetic: "/waɪt/", sentence: "The fluffy cloud is white.", sentenceTranslation: "Đám mây bồng bềnh có màu trắng." },
  "brown": { translation: "Màu nâu", phonetic: "/braʊn/", sentence: "The big bear is brown.", sentenceTranslation: "Chú gấu to lớn có màu nâu." },
  "grey": { translation: "Màu xám", phonetic: "/ɡreɪ/", sentence: "The little mouse is grey.", sentenceTranslation: "Chú chuột nhỏ có màu xám." },
  "gray": { translation: "Màu xám", phonetic: "/ɡreɪ/", sentence: "The little mouse is gray.", sentenceTranslation: "Chú chuột nhỏ có màu xám." },
  "one": { translation: "Số một", phonetic: "/wʌn/", sentence: "I have one little nose.", sentenceTranslation: "Tôi có một chiếc mũi nhỏ." },
  "two": { translation: "Số hai", phonetic: "/tuː/", sentence: "I have two big eyes.", sentenceTranslation: "Tôi có hai đôi mắt to." },
  "three": { translation: "Số ba", phonetic: "/θriː/", sentence: "There are three birds in the tree.", sentenceTranslation: "Có ba chú chim ở trên cây." },
  "four": { translation: "Số bốn", phonetic: "/fɔː(r)/", sentence: "The dog has four legs.", sentenceTranslation: "Con chó có bốn cái chân." },
  "five": { translation: "Số năm", phonetic: "/faɪv/", sentence: "I have five fingers on my hand.", sentenceTranslation: "Tôi có năm ngón tay trên bàn tay." },
  "six": { translation: "Số sáu", phonetic: "/sɪks/", sentence: "I see six colorful flowers.", sentenceTranslation: "Tôi nhìn thấy sáu bông hoa nhiều màu sắc." },
  "seven": { translation: "Số bảy", phonetic: "/ˈsevn/", sentence: "The rainbow has seven colors.", sentenceTranslation: "Cầu vồng có bảy sắc màu." },
  "eight": { translation: "Số tám", phonetic: "/eɪt/", sentence: "The spider has eight legs.", sentenceTranslation: "Con nhện có tám cái chân." },
  "nine": { translation: "Số chín", phonetic: "/naɪn/", sentence: "I count nine little stars.", sentenceTranslation: "Tôi đếm được chín ngôi sao nhỏ." },
  "ten": { translation: "Số mười", phonetic: "/ten/", sentence: "I have ten toes on my feet.", sentenceTranslation: "Tôi có mười ngón chân ở bàn chân." }
};

interface DictionaryEntry {
  translation: string;
  phonetic: string;
  sentence?: string;
  sentenceTranslation?: string;
}

function getOrGenerateEntry(word: string): DictionaryEntry | undefined {
  const key = word.toLowerCase().trim();
  const cleanKey = key.endsWith(".") ? key.slice(0, -1).trim() : key;
  const entry = commonWordsDict[key] || commonWordsDict[cleanKey];
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
    // Standard singular countable noun heuristic
    sentence = `I like my ${cleanKey}.`;
    sentenceTranslation = `Tôi yêu ${translation.toLowerCase()} của tôi.`;
  }
  
  return {
    ...entry,
    sentence,
    sentenceTranslation
  };
}

function cleanAndFixVocabularyItem(w: any): any {
  if (!w || typeof w !== "object") return w;
  
  const rawWord = String(w.word || "").trim();
  const wordKey = rawWord.toLowerCase();
  const cleanWordKey = wordKey.endsWith(".") ? wordKey.slice(0, -1).trim() : wordKey;
  
  // 1. Correct phonetic if it is just a lazy placeholder (e.g. equal to the word or simple slash /word/)
  const rawPhonetic = String(w.phonetic || "").trim();
  const cleanPhonetic = rawPhonetic.toLowerCase().replace(/[\s/]/g, "");
  const cleanWord = wordKey.replace(/[^a-z]/g, "");
  const isLazyPhonetic = cleanPhonetic === cleanWord || cleanPhonetic === "" || !rawPhonetic.startsWith("/") || !rawPhonetic.endsWith("/");
  
  // 2. Correct translation if it is identical to the English word
  const isLazyTranslation = String(w.translation || "").toLowerCase().trim() === wordKey;
  
  const dictEntry = getOrGenerateEntry(rawWord);
  
  if (dictEntry) {
    if (isLazyTranslation) {
      w.translation = dictEntry.translation;
    }
    if (isLazyPhonetic) {
      w.phonetic = dictEntry.phonetic;
    }
    
    // Correct lazy sentences (e.g., "I like classroom." or containing English inside translation)
    const currentSentenceLower = String(w.sentence || "").toLowerCase().trim();
    const isLazySentence = !w.sentence || currentSentenceLower === "" || 
                           currentSentenceLower === `i like ${wordKey}.` ||
                           currentSentenceLower === `i like ${cleanWordKey}.` ||
                           currentSentenceLower === `i like ${wordKey}` ||
                           currentSentenceLower === `i like ${cleanWordKey}`;
    
    if (isLazySentence && dictEntry.sentence) {
      w.sentence = dictEntry.sentence;
      if (dictEntry.sentenceTranslation) {
        w.sentenceTranslation = dictEntry.sentenceTranslation;
      }
    }
  }
  
  // 3. Fallback translate if translation is still lazy and not in our common dictionary
  if (String(w.translation || "").toLowerCase().trim() === wordKey) {
    w.translation = getFallbackTranslation(rawWord);
  }
  
  // 4. Clean sentence translation from mixed English words (e.g., "Tớ thích teacher" -> "Tớ thích giáo viên")
  if (w.sentenceTranslation && rawWord) {
    const rx = new RegExp(`\\b${rawWord}\\b`, "gi");
    if (rx.test(w.sentenceTranslation)) {
      w.sentenceTranslation = w.sentenceTranslation.replace(rx, w.translation.toLowerCase());
    }
  }
  
  // Remove wrapping brackets or parens from sentence translation if any (e.g. "(Tớ thích cô giáo.)" -> "Tớ thích cô giáo.")
  if (w.sentenceTranslation) {
    let sTrans = String(w.sentenceTranslation).trim();
    if (sTrans.startsWith("(") && sTrans.endsWith(")")) {
      sTrans = sTrans.slice(1, -1).trim();
    }
    w.sentenceTranslation = sTrans;
  }
  
  return w;
}

// Helper to choose a unique, appropriate emoji for fallback illustration
function getFallbackIllustration(word: string): string {
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
  
  // Hash the word to pick a unique emoji from a broad list of colorful kid-friendly emojis
  const list = ["🎨", "🎭", "🎪", "🎢", "🚂", "🚀", "🛸", "🚁", "🚲", "🛹", "⚽", "🏀", "🎈", "🎁", "🧸", "🎉", "👑", "🌈", "☀️", "🍀", "🍎", "🥝", "🍉", "🍇", "🥕", "🍕", "🧁", "🍿", "🍩", "🥤", "🐾", "🦁", "🐼", "🐻", "🦊", "🐱", "🐶", "🐰", "🐨", "🐸"];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % list.length;
  return list[index];
}

// Helper to parse and clean raw content inputs
interface CleanedInput {
  original: string;
  english: string;
  vietnamese: string;
}

function parseRawContent(rawContent: string): CleanedInput[] {
  let lines = rawContent.split(/[\n;]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  if (lines.length === 1 && lines[0].includes(",")) {
    lines = lines[0].split(",").map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }
  
  return lines.map(line => {
    let english = line;
    let vietnamese = "";
    
    // Split by common separators: " - ", " – ", " : ", " / ", " (", "=>"
    const separators = [" - ", " – ", " : ", " / ", " (", "=>"];
    for (const sep of separators) {
      const idx = line.indexOf(sep);
      if (idx !== -1) {
        english = line.substring(0, idx).trim();
        vietnamese = line.substring(idx + sep.length).replace(/\)$/, "").trim();
        break;
      }
    }
    
    // Clean leading numbers
    english = english.replace(/^\d+[\s.\-_)]+/, "").trim();
    return { original: line, english, vietnamese };
  }).filter(item => item.english.length > 0);
}

// API Route: Generate lesson from topic or uploaded content
app.post("/api/generate-lesson", async (req: Request, res: Response) => {
  try {
    const { topic, rawContent, level, fileData, fileMime } = req.body;

    if (!ai) {
      // Fallback response with beautiful default mock data if API key is not yet set up
      console.warn("GEMINI_API_KEY is not configured. Serving high-quality illustrative sample lessons.");
      return res.json({
        title: `Bài Học Tiếng Anh Trình Độ ${String(level).toUpperCase()}`,
        words: getFallbackWords(topic || "Animals", level || "starter"),
      });
    }

    // Level-specific configuration for word count and sentence complexity
    const levelConfig: Record<string, { wordCount: string; wordRange: string; ageRange: string; sentenceRule: string }> = {
      "pre-starter": {
        wordCount: "4",
        wordRange: "4",
        ageRange: "Pre-Starters (Cambridge English YLE) - Children aged 4-6 who are starting to learn English. Use simple isolated words, and very short, cute sentences of 2-4 words, for example: 'It is a cat.', 'I like red.'",
        sentenceRule: "Sentences MUST be extremely short (2-4 words only), using only 'I like...', 'It is a...', 'This is...' patterns. Use only the most basic, concrete, familiar words a 4-6 year old child would know. Example: 'I like cats.' or 'It is red.'"
      },
      "starter": {
        wordCount: "6 to 8",
        wordRange: "6-8",
        ageRange: "Starters (Cambridge English YLE) - Children aged 6-8. Use basic everyday vocabulary, and short playful sentences describing animals, things, or fruits, for example: 'The dog is big.', 'This is a red apple.'",
        sentenceRule: "Sentences should be short (4-6 words), using simple present tense, basic adjectives, and everyday vocabulary. Example: 'The dog is very big.' or 'I eat a red apple.'"
      },
      "mover": {
        wordCount: "10 to 12",
        wordRange: "10-12",
        ageRange: "Movers (Cambridge English YLE) - Children aged 8-10. Use practical vocabulary, complete sentences describing actions or features, for example: 'The cat is running happily.', 'I eat healthy fruits.'",
        sentenceRule: "Sentences should be medium length (6-10 words), using present continuous, simple past, comparatives, and descriptive language. Example: 'The little cat is running happily in the garden.' or 'She eats healthy fruits every morning.'"
      },
      "flyer": {
        wordCount: "15 to 20",
        wordRange: "15-20",
        ageRange: "Flyers (Cambridge English YLE) - Children aged 10-12. Use rich vocabulary, various sentence structures, and fluid simple storytelling, for example: 'We played fun games in the school garden yesterday.', 'She loves learning English so she can talk to everyone.'",
        sentenceRule: "Sentences should be longer (8-15 words), using varied tenses (past, present, future), compound sentences, adverbs, and richer expressions. Example: 'We played exciting games together in the school garden yesterday afternoon.' or 'She loves learning English because she wants to travel around the world.'"
      },
      // Alias levels sent by teacher frontend ("preschool" / "elementary")
      "preschool": {
        wordCount: "6 to 8",
        wordRange: "6-8",
        ageRange: "Mầm non (Preschool) - Trẻ 4-6 tuổi. Use basic everyday vocabulary, and short playful sentences describing animals, things, or fruits, for example: 'The dog is big.', 'This is a red apple.'",
        sentenceRule: "Sentences should be short (4-6 words), using simple present tense, basic adjectives, and everyday vocabulary. Example: 'The dog is very big.' or 'I eat a red apple.'"
      },
      "elementary": {
        wordCount: "10 to 12",
        wordRange: "10-12",
        ageRange: "Tiểu học (Elementary) - Trẻ 7-11 tuổi. Use practical vocabulary, complete sentences describing actions or features, for example: 'The cat is running happily.', 'I eat healthy fruits.'",
        sentenceRule: "Sentences should be medium length (6-10 words), using present continuous, simple past, comparatives, and descriptive language. Example: 'The little cat is running happily in the garden.' or 'She eats healthy fruits every morning.'"
      }
    };

    const currentLevelConfig = levelConfig[level] || levelConfig["starter"];
    const ageRange = currentLevelConfig.ageRange;

    let prompt = "";
    let filePart: any = null;

    if (fileData && fileMime) {
      // Strip potential base64 prefix
      let cleanedBase64 = fileData;
      if (fileData.includes(";base64,")) {
        cleanedBase64 = fileData.split(";base64,")[1];
      }

      filePart = {
        inlineData: {
          mimeType: fileMime,
          data: cleanedBase64,
        },
      };

      prompt = `Please analyze the uploaded document or image to extract English vocabulary words and complete sentences appropriate for this level: ${ageRange}.

CRITICAL SYSTEM REQUIREMENTS (GIỮ NGUYÊN ĐẦU VÀO - KHÔNG SÁNG TẠO):
1. PRESERVE ORIGINAL CONTENT: You MUST extract and output the EXACT English words and matching sentences appearing in the uploaded file/image. Do NOT create, alter, or replace them with custom sentences or vocabulary. Keep them exactly as they are in the file. Do not be creative.
2. DO NOT MIX LANGUAGES IN FIELDS: The 'word' field must contain ONLY the English word/phrase (e.g. "Classroom"). Do NOT add Vietnamese translation text or separators (like " - lớp học") into the 'word' or 'sentence' fields.
3. GRAMMATICAL ACCURACY: Double check all English grammar. Every sentence must be grammatically correct and natural for children.
4. Every card must have a word and a matching sentence.
5. If the file contains only full sentences but no isolated words, extract keywords from those sentences to use as "word", and use the exact visual sentence as "sentence".
6. If the file contains only isolated words but no sentences, write short, grammatically perfect, and simple sentences containing that word.
7. TRANSLATION RULE (DỊCH TIẾNG VIỆT CHUẨN, KHÔNG DỊCH TRỘN TIẾNG ANH):
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. NEVER output the English word itself or any English text in the 'translation' field. (E.g. If the word is 'Teacher', translation MUST be 'Giáo viên' or 'Cô giáo/Thầy giáo', NEVER 'Teacher').
- The 'sentenceTranslation' field MUST contain the direct, natural-sounding, child-friendly Vietnamese translation of the 'sentence'. Do NOT mix English words or write parenthesized English phrases. (E.g. If the sentence is 'I like my teacher.', sentenceTranslation MUST be 'Tôi yêu cô giáo của tôi.', NEVER 'Tớ thích teacher.' or '(Tớ thích teacher.)').
8. Each vocabulary item in the list must feature:
- word: The English vocabulary word (strictly English, with first letters capitalized).
- translation: The exact Vietnamese translation/meaning.
- phonetic: Accurate IPA phonetics (for example, '/kæt/', '/ˈtiːtʃə(r)/'). Do not lazy-render '/teacher/'.
- sentence: The English example sentence (preserved from the file exactly, strictly English).
- sentenceTranslation: The exact Vietnamese translation of the sentence.
- illustration: Exactly one colorful, vivid Emoji representing the word.`;
      
      if (topic) {
        prompt += `\nAdditional Focus: Prioritize and guide the selection of these vocabulary words around this topic: "${topic}".`;
      }
    } else if (rawContent) {
      const inputItems = parseRawContent(rawContent);
      const inputCount = inputItems.length;
      prompt = `Please optimize or create an English learning curriculum based entirely on the following raw text list.
You MUST generate EXACTLY ${inputCount} vocabulary cards in your response — one for each input item. The number of objects in the "words" array MUST equal ${inputCount}.

Here is the parsed input list of ${inputCount} items:
${inputItems.map((item, i) => `${i + 1}. English Word/Phrase: "${item.english}"${item.vietnamese ? `, Vietnamese Translation: "${item.vietnamese}"` : ""}`).join('\n')}

CRITICAL SYSTEM REQUIREMENTS (GIỮ NGUYÊN ĐẦU VÀO - KHÔNG SÁNG TẠO):
1. PRESERVE ORIGINAL ENGLISH WORDS: You MUST use the exact English words/phrases listed above (e.g., "${inputItems[0]?.english}"). Do NOT add Vietnamese translation text or separators (like " - lớp học") into the "word" field. The "word" field must contain ONLY the English word/phrase.
2. GRAMMATICAL ACCURACY: Double check all English grammar. Every sentence must be grammatically correct and natural for children.
3. If the input list includes a Vietnamese translation, use that translation for the 'translation' field (or optimize it to be child-friendly). If no translation is provided, translate it accurately to Vietnamese.
4. If the input item already contains a full sentence, use that sentence in the "sentence" field. Otherwise, write a simple, grammatically perfect English sentence containing the word.
5. TRANSLATION RULE (DỊCH TIẾNG VIỆT CHUẨN, KHÔNG DỊCH TRỘN TIẾNG ANH):
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. NEVER output the English word itself or any English text in the 'translation' field. (E.g. If the word is 'Teacher', translation MUST be 'Giáo viên' or 'Cô giáo/Thầy giáo', NEVER 'Teacher').
- The 'sentenceTranslation' field MUST contain the direct, natural-sounding, child-friendly Vietnamese translation of the 'sentence'. Do NOT mix English words or write parenthesized English phrases. (E.g. If the sentence is 'I like my teacher.', sentenceTranslation MUST be 'Tôi yêu cô giáo của tôi.', NEVER 'Tớ thích teacher.' or '(Tớ thích teacher.)').
6. Provide fully detailed fields for each word as requested:
- word: The clean English word (with no Vietnamese meaning/translation text inside it).
- translation: The direct Vietnamese translation.
- phonetic: Correct IPA phonetic representation (using actual IPA symbols like '/ˈtiːtʃə(r)/').
- sentence: The English example sentence.
- sentenceTranslation: The matching Vietnamese translation of the English example sentence.
- illustration: Exactly one cute emoji representing the word.

FINAL REMINDER: Your output MUST contain exactly ${inputCount} items in the "words" array. Count them before responding.`;
    } else if (topic) {
      prompt = `Please create an engaging English vocabulary course suitable for: ${ageRange}.
The topic is: "${topic}".
You MUST select exactly ${currentLevelConfig.wordCount} highly useful, fun, and level-appropriate English vocabulary words for this topic. The number of words in the output array MUST be ${currentLevelConfig.wordRange} items.

LEVEL-APPROPRIATE VOCABULARY & GRAMMAR RULES:
- Word difficulty MUST match the level: ${ageRange}
- ${currentLevelConfig.sentenceRule}
- GRAMMATICAL ACCURACY: Every sentence you generate MUST be 100% grammatically correct and natural. Avoid run-on sentences (like "I like my teacher is very kind" which is wrong). Write them correctly, e.g., "I like my kind teacher." or "My teacher is very kind. I like her."

TRANSLATION RULE (DỊCH TIẾNG VIỆT CHUẨN, KHÔNG DỊCH TRỘN TIẾNG ANH):
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. NEVER output the English word itself or any English text in the 'translation' field. (E.g. If the word is 'Teacher', translation MUST be 'Giáo viên' or 'Cô giáo/Thầy giáo', NEVER 'Teacher').
- The 'sentenceTranslation' field MUST contain the direct, natural-sounding, child-friendly Vietnamese translation of the 'sentence'. Do NOT mix English words or write parenthesized English phrases. (E.g. If the sentence is 'I like my teacher.', sentenceTranslation MUST be 'Tôi yêu cô giáo của tôi.', NEVER 'Tớ thích teacher.' or '(Tớ thích teacher.)').

For each word, fill:
- word: The English word with first letter capitalized. Word complexity must match the level.
- translation: The direct Vietnamese translation of the English word.
- phonetic: Accurate IPA pronunciation (for example: '/dɒɡ/', '/ˈtiːtʃə(r)/').
- sentence: An English sentence containing the word.
- sentenceTranslation: The matching Vietnamese translation of the English example sentence.
- illustration: Exactly one glowing, colorful, delightful emoji representing the word.

REMINDER: Output MUST contain ${currentLevelConfig.wordCount} vocabulary items. Sentences MUST match the complexity level described above.`;
    } else {
      return res.status(400).json({ error: "Please enter a topic, paste text list, or upload a material file." });
    }

    console.log(`[Gemini Request] Generating lesson for level: ${level} with topic: ${topic || '(none)'} (Has File: ${!!filePart}) (Has RawContent: ${!!rawContent}${rawContent ? `, inputWords: ${rawContent.split(/[,;\n]+/).filter((s: string) => s.trim()).length}` : ''})`);

    let response = null;
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"];
    let attempts = modelsToTry.length;
    let lastError = null;

    for (let i = 0; i < attempts; i++) {
       try {
        const modelName = modelsToTry[i] || "gemini-2.5-pro";
        console.log(`[Gemini Attempt ${i + 1}] Requesting with model: ${modelName}`);

        const contentsPayload = filePart
          ? { parts: [filePart, { text: prompt }] }
          : prompt;

        response = await ai.models.generateContent({
          model: modelName,
          contents: contentsPayload,
          config: {
            systemInstruction: `You are an expert children's English teacher with many years of experience (giáo viên tiếng Anh tiểu học và mầm non nhiều năm kinh nghiệm).
Your English sentences MUST be 100% grammatically correct, natural, simple, and age-appropriate for kids. Never write grammatically incorrect sentences or run-on sentences.
Respond ONLY in valid JSON conforming to the structured schema specified. Avoid complex words. Keep example sentences strictly positive and action-oriented for children. Use clear, vivid, child-pleasing Emojis for the illustration fields.

CRITICAL RULES:
1. PURE VIETNAMESE TRANSLATION (KHÔNG DỊCH TRỘN TIẾNG ANH): The 'translation' field must be the DIRECT VIETNAMESE translation of the word (e.g., 'con mèo', 'quả táo'), and the 'sentenceTranslation' field must be the DIRECT VIETNAMESE translation of the example sentence (e.g., 'Chú mèo nhỏ kêu meow meow.'). Do NOT mix English words, explanations, or definitions into these translation fields. NEVER write the English word inside the Vietnamese translation fields (e.g. never write 'Teacher' as translation for 'Teacher', it must be 'Giáo viên'; and never write 'Tớ thích teacher.' as translation for 'I like teacher.', it must be 'Tôi yêu cô giáo của tôi.').
2. PRESERVE ORIGINAL CONTENT (GIỮ NGUYÊN ĐẦU VÀO - KHÔNG SÁNG TẠO): If the user provides explicit English words, text, or uploads a document/image, you must preserve and retain those exact English words and their matching sentences, correcting only spelling mistakes. Do not replace them with unrelated words, do not create new custom sentences if the input already contains sentences. Do not be creative.
3. ABSOLUTE RULE ON QUANTITY: When the user provides a list of N words, you MUST output EXACTLY N vocabulary items. Never output fewer items than the user provided. Count the input items and ensure your output array has the same count. Truncating or reducing the user's word list is STRICTLY FORBIDDEN.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["title", "words"],
              properties: {
                title: {
                  type: Type.STRING,
                  description: "An engaging, fun lesson title written in Vietnamese, for example: 'Bạn Bè Động Vật Đáng Yêu' or 'Thế Giới Trái Cây Ngọt Lịm'",
                },
                words: {
                  type: Type.ARRAY,
                  description: `List of English vocabulary words. CRITICAL: If the user provided a raw text list or uploaded file, you MUST output ALL words from the input without any truncation — the output count MUST match the input count exactly. Never reduce, skip, or limit the list. For topic-based generations, provide exactly ${currentLevelConfig.wordCount} items matching the student's level.`,
                  items: {
                    type: Type.OBJECT,
                    required: ["word", "translation", "phonetic", "sentence", "sentenceTranslation", "illustration"],
                    properties: {
                      word: {
                        type: Type.STRING,
                        description: "The English word, capitalized properly, e.g., 'Dog'",
                      },
                      translation: {
                        type: Type.STRING,
                        description: "The direct, accurate Vietnamese translation of the English word, for example: 'Con chó' or 'Chiếc bút chì'. No English definitions or explanations.",
                      },
                      phonetic: {
                        type: Type.STRING,
                        description: "Standard IPA phonetics (International Phonetic Alphabet) using actual phonetic symbols, for example '/dɒɡ/', '/ˈtiːtʃə(r)/', '/ˈklɑːsruːm/'. Never output the plain English word itself enclosed in slashes (e.g., never write '/teacher/' or '/classroom/').",
                      },
                      sentence: {
                        type: Type.STRING,
                        description: "A short, engaging English sentence containing the word. E.g., 'The friendly dog wags its tail.'",
                      },
                      sentenceTranslation: {
                        type: Type.STRING,
                        description: "The direct, natural, child-friendly Vietnamese translation of the English example sentence, for example: 'Chú chó vui vẻ vẫy đuôi.'",
                      },
                      illustration: {
                        type: Type.STRING,
                        description: "Exactly ONE colourful symbol emoji representing the word, e.g., '🐶'",
                      },
                    },
                  },
                },
              },
            },
          },
        });
        break; // Sucessfully generated content! Break out of retry loop
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Retry] Attempt ${i + 1} failed.`, err.message || err);
        if (i < attempts - 1) {
          const backoffDelay = i === 0 ? 1000 : 3000;
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        }
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to generate content after retries");
    }

    const textOutput = response.text;
    console.log("[Gemini Response] Generation successful.");
    if (textOutput) {
      const parsedData = JSON.parse(textOutput.trim());
      // Assign IDs to words automatically & sanitize translation/phonetic fields
      if (parsedData.words && Array.isArray(parsedData.words)) {
        parsedData.words = parsedData.words.map((w: any, idx: number) => {
          const cleaned = cleanAndFixVocabularyItem(w);
          return {
            ...cleaned,
            id: `w-${Date.now()}-${idx}`,
            category: topic || "Uploaded List",
          };
        });
      }

      // POST-GENERATION VALIDATION: Ensure output count matches input count for rawContent
      if (rawContent && parsedData.words && Array.isArray(parsedData.words)) {
        const inputItems = parseRawContent(rawContent);
        const inputCount = inputItems.length;
        const outputCount = parsedData.words.length;
        
        if (outputCount < inputCount) {
          console.warn(`[Gemini Validation] Output has ${outputCount} words but input had ${inputCount}. Filling missing ${inputCount - outputCount} words.`);
          
          const existingWordsLower = new Set(parsedData.words.map((w: any) => w.word?.toLowerCase()));
          
          for (const item of inputItems) {
            if (!existingWordsLower.has(item.english.toLowerCase())) {
              const capitalizedWord = item.english.charAt(0).toUpperCase() + item.english.slice(1).toLowerCase();
              const isSentence = item.english.trim().split(/\s+/).length > 1;
              const translation = item.vietnamese || getFallbackTranslation(item.english);
              
              const dictEntry = getOrGenerateEntry(capitalizedWord);
              const fallbackPhonetic = `/${capitalizedWord.toLowerCase().replace(/[^a-z\s]/g, "")}/`;
              const newWordItem = {
                word: capitalizedWord,
                translation: translation,
                phonetic: dictEntry ? dictEntry.phonetic : fallbackPhonetic,
                sentence: isSentence ? capitalizedWord : (dictEntry && dictEntry.sentence ? dictEntry.sentence : `I like my ${capitalizedWord.toLowerCase()}.`),
                sentenceTranslation: isSentence ? translation : (dictEntry && dictEntry.sentenceTranslation ? dictEntry.sentenceTranslation : `Tôi yêu ${translation.toLowerCase()} của tôi.`),
                illustration: getFallbackIllustration(item.english),
              };
              
              const cleanedWordItem = cleanAndFixVocabularyItem(newWordItem);
              
              parsedData.words.push({
                ...cleanedWordItem,
                id: `w-${Date.now()}-fill-${parsedData.words.length}`,
                category: topic || "Uploaded List",
              });
            }
          }
          
          console.log(`[Gemini Validation] After fill, total words: ${parsedData.words.length}`);
        }
      }

      return res.json(parsedData);
    } else {
      throw new Error("No response text from Gemini");
    }
  } catch (err: any) {
    console.error("Gemini lesson generation error (switching to fallback):", err);
    // Return HTTP 200 with high-quality fallback words so the application is completely bulletproof
    const fallbackTitle = req.body.topic
      ? `🎈 Từ Vựng: ${req.body.topic}`
      : `🎈 Bài Học ${req.body.level ? String(req.body.level).toUpperCase() : "STARTER"}`;
    
    let mappedWords: any[];
    
    // If user provided rawContent, build fallback from their actual input words
    if (req.body.rawContent) {
      const inputItems = parseRawContent(req.body.rawContent);
      console.log(`[Fallback] Building from ${inputItems.length} user-provided words`);
      mappedWords = inputItems.map((item, idx) => {
        const capitalizedWord = item.english.charAt(0).toUpperCase() + item.english.slice(1);
        const isSentence = item.english.trim().split(/\s+/).length > 1;
        const translation = item.vietnamese || getFallbackTranslation(item.english);
        
        const dictEntry = getOrGenerateEntry(capitalizedWord);
        const fallbackPhonetic = `/${item.english.toLowerCase().replace(/[^a-z\s]/g, "")}/`;
        const rawItem = {
          word: capitalizedWord,
          translation: translation,
          phonetic: dictEntry ? dictEntry.phonetic : fallbackPhonetic,
          sentence: isSentence ? capitalizedWord : (dictEntry && dictEntry.sentence ? dictEntry.sentence : `I like my ${item.english.toLowerCase()}.`),
          sentenceTranslation: isSentence ? translation : (dictEntry && dictEntry.sentenceTranslation ? dictEntry.sentenceTranslation : `Tôi yêu ${translation.toLowerCase()} của tôi.`),
          illustration: getFallbackIllustration(item.english),
        };
        
        const cleanedItem = cleanAndFixVocabularyItem(rawItem);
        
        return {
          ...cleanedItem,
          id: `w-fallback-${Date.now()}-${idx}`,
          category: req.body.topic || "Uploaded List",
        };
      });
    } else {
      const fallbackWords = getFallbackWords(req.body.topic || "default", req.body.level || "starter");
      mappedWords = fallbackWords.map((w, idx) => ({
        ...w,
        id: `w-fallback-${Date.now()}-${idx}`,
        category: req.body.topic || "Default Category"
      }));
    }

    res.json({
      title: fallbackTitle,
      words: mappedWords,
      fallback: true,
      errorMsg: req.body.rawContent 
        ? `✨ Đã khởi tạo ${mappedWords.length} thẻ từ vựng dự phòng từ danh sách của bạn! Bản dịch sẽ được cập nhật khi hệ thống AI hoạt động trở lại. 💕`
        : "Hệ thống AI đang quá tải. Đã chuẩn bị sẵn giáo án minh họa hoạt hình tương ứng siêu đáng yêu cho Thầy Cô! 💕"
    });
  }
});

// 1. GET /api/lessons
app.get("/api/lessons", (req: Request, res: Response) => {
  res.json(lessonsList);
});

// 2. POST /api/lessons
app.post("/api/lessons", (req: Request, res: Response) => {
  const { id, title, level, words, classId, deadline } = req.body;
  if (!title || !words || !Array.isArray(words)) {
    return res.status(400).json({ error: "Dữ liệu bài học không đầy đủ!" });
  }
  const newLesson: Lesson = {
    id: id || `lesson-${Date.now()}`,
    title,
    level,
    words,
    createdAt: req.body.createdAt || Date.now(),
    classId,
    deadline: deadline ? Number(deadline) : undefined
  };
  lessonsList.unshift(newLesson);
  saveDb();
  res.json({ success: true, lesson: newLesson });
});

// 3. GET /api/classrooms
app.get("/api/classrooms", (req: Request, res: Response) => {
  res.json(classroomsList);
});

// 4. POST /api/classrooms
app.post("/api/classrooms", (req: Request, res: Response) => {
  const { id, name, students } = req.body;
  if (!name || !Array.isArray(students)) {
    return res.status(400).json({ error: "Dữ liệu lớp học không đầy đủ!" });
  }

  if (id) {
    const idx = classroomsList.findIndex(c => c.id === id);
    if (idx !== -1) {
      classroomsList[idx].name = name;
      classroomsList[idx].students = students;
      saveDb();
      return res.json({ success: true, classroom: classroomsList[idx] });
    }
  }

  const newClass: Classroom = {
    id: `class-${Date.now()}`,
    name,
    students,
    createdAt: Date.now()
  };
  classroomsList.unshift(newClass);
  saveDb();
  res.json({ success: true, classroom: newClass });
});

// 5. POST /api/classrooms/delete
app.post("/api/classrooms/delete", (req: Request, res: Response) => {
  const { id } = req.body;
  classroomsList = classroomsList.filter(c => c.id !== id);
  saveDb();
  res.json({ success: true });
});

// 6. GET /api/attempts
app.get("/api/attempts", (req: Request, res: Response) => {
  res.json(testAttempts);
});

// 7. POST /api/attempts
app.post("/api/attempts", (req: Request, res: Response) => {
  const { studentName, classId, className, lessonId, lessonTitle, score, level, teacherName } = req.body;
  if (!studentName || !classId || !lessonId || score === undefined) {
    return res.status(400).json({ error: "Dữ liệu nộp bài không đầy đủ!" });
  }

  // Calculate if the submission is late
  let isLate = req.body.isLate || false;
  const targetLesson = lessonsList.find(l => l.id === lessonId);
  if (targetLesson && targetLesson.deadline && Date.now() > targetLesson.deadline) {
    isLate = true;
  }

  const newAttempt: TestAttempt = {
    id: `att-${Date.now()}`,
    studentName,
    classId,
    className,
    lessonId,
    lessonTitle,
    score,
    level,
    timestamp: Date.now(),
    teacherName: teacherName || "Cô Thảo",
    isLate
  };
  testAttempts.unshift(newAttempt);
  saveDb();
  res.json({ success: true, attempt: newAttempt });
});

// 8. GET /api/student/resolve
app.get("/api/student/resolve", (req: Request, res: Response) => {
  const phone = (req.query.phone as string || "").trim().replace(/[\s-]/g, "");
  if (!phone) {
    return res.status(400).json({ error: "Vui lòng nhập số điện thoại!" });
  }

  for (const classroom of classroomsList) {
    const student = classroom.students.find(s => s.phone.trim().replace(/[\s-]/g, "") === phone);
    if (student) {
      const isMamNon = classroom.name.toLowerCase().includes("mầm") || classroom.name.toLowerCase().includes("lá");
      const targetLevel = isMamNon ? "preschool" : "elementary";
      
      // Sort in-memory lessons by createdAt descending to retrieve the newest lesson mapped to this classId first
      const classLessons = lessonsList.filter(l => l.classId === classroom.id)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      let linkedLesson = classLessons[0];
      
      if (!linkedLesson) {
        const filteredLessons = lessonsList.filter(l => l.level === targetLevel)
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        linkedLesson = filteredLessons[0] || lessonsList[0];
      }

      return res.json({
        success: true,
        name: student.name,
        phone: student.phone,
        classId: classroom.id,
        className: classroom.name,
        teacherName: isMamNon ? "Cô Thảo" : "Thầy Hùng",
        linkedLesson: linkedLesson ? { id: linkedLesson.id, title: linkedLesson.title } : null
      });
    }
  }

  res.status(404).json({ error: "Không tìm thấy số điện thoại trong hệ thống của Thầy Cô!" });
});

// Helper function to return beautiful animated fallback kids' vocabulary if Gemini key is loading or limits hit
function getFallbackWords(topic: string, level: string) {
  const normalized = topic.toLowerCase();
  
  const sampleAnimals = [
    { id: "fa1", word: "Cat", translation: "Con mèo", phonetic: "/kæt/", sentence: "The little cat is sleeping.", sentenceTranslation: "Chú mèo nhỏ đang ngủ.", illustration: "🐱", category: "Animals" },
    { id: "fa2", word: "Dog", translation: "Con chó", phonetic: "/dɒɡ/", sentence: "The happy dog wags its tail.", sentenceTranslation: "Chú chó vui vẻ vẫy đuôi.", illustration: "🐶", category: "Animals" },
    { id: "fa3", word: "Monkey", translation: "Con khỉ", phonetic: "/ˈmʌŋ.ki/", sentence: "The monkey eats sweet bananas.", sentenceTranslation: "Chú khỉ thích ăn những quả chuối ngọt lịm.", illustration: "🐵", category: "Animals" },
    { id: "fa4", word: "Rabbit", translation: "Con thỏ", phonetic: "/ˈræb.ɪt/", sentence: "The white rabbit hops fast.", sentenceTranslation: "Chú thỏ trắng nhảy thật nhanh.", illustration: "🐰", category: "Animals" },
    { id: "fa5", word: "Lion", translation: "Sư tử", phonetic: "/ˈlaɪ.ən/", sentence: "The lion rules the savanna jungle.", sentenceTranslation: "Chú sư tử thống trị vùng thảo nguyên cỏ.", illustration: "🦁", category: "Animals" },
    { id: "fa6", word: "Bird", translation: "Con chim", phonetic: "/bɜːd/", sentence: "The colorful bird sings softly.", sentenceTranslation: "Chú chim nhiều màu sắc hót líu lo ngọt ngào.", illustration: "🐦", category: "Animals" },
    { id: "fa7", word: "Elephant", translation: "Con voi", phonetic: "/ˈel.ɪ.fənt/", sentence: "The big elephant has a very long nose.", sentenceTranslation: "Chú voi to lớn có một chiếc mũi rất dài.", illustration: "🐘", category: "Animals" },
    { id: "fa8", word: "Frog", translation: "Con ếch", phonetic: "/frɒɡ/", sentence: "The green frog jumps high.", sentenceTranslation: "Chú ếch xanh nhảy thật cao.", illustration: "🐸", category: "Animals" },
    { id: "fa9", word: "Giraffe", translation: "Hươu cao cổ", phonetic: "/dʒəˈrɑːf/", sentence: "The tall giraffe eats green leaves.", sentenceTranslation: "Chú hươu cao cổ cao lớn ăn những chiếc lá xanh.", illustration: "🦒", category: "Animals" },
    { id: "fa10", word: "Tiger", translation: "Con hổ", phonetic: "/ˈtaɪɡə(r)/", sentence: "The strong tiger runs very fast.", sentenceTranslation: "Chú hổ mạnh mẽ chạy rất nhanh.", illustration: "🐯", category: "Animals" },
    { id: "fa11", word: "Pig", translation: "Con heo", phonetic: "/pɪɡ/", sentence: "The cute pink pig plays in the mud.", sentenceTranslation: "Chú heo hồng đáng yêu chơi trong bùn.", illustration: "🐷", category: "Animals" },
    { id: "fa12", word: "Sheep", translation: "Con cừu", phonetic: "/ʃiːp/", sentence: "The white sheep eats grass in the field.", sentenceTranslation: "Chú cừu trắng ăn cỏ trên cánh đồng.", illustration: "🐑", category: "Animals" },
    { id: "fa13", word: "Duck", translation: "Con vịt", phonetic: "/dʌk/", sentence: "The little duck swims in the pond.", sentenceTranslation: "Chú vịt nhỏ bơi trong ao.", illustration: "🦆", category: "Animals" },
    { id: "fa14", word: "Chicken", translation: "Con gà", phonetic: "/ˈtʃɪkɪn/", sentence: "The chicken walks around the farm.", sentenceTranslation: "Con gà đi quanh trang trại.", illustration: "🐔", category: "Animals" },
    { id: "fa15", word: "Cow", translation: "Con bò", phonetic: "/kaʊ/", sentence: "The friendly cow gives fresh milk.", sentenceTranslation: "Chú bò thân thiện cho sữa tươi.", illustration: "🐮", category: "Animals" },
    { id: "fa16", word: "Bear", translation: "Con gấu", phonetic: "/beə(r)/", sentence: "The big brown bear loves sweet honey.", sentenceTranslation: "Chú gấu nâu lớn thích mật ong ngọt ngào.", illustration: "🐻", category: "Animals" },
    { id: "fa17", word: "Mouse", translation: "Con chuột", phonetic: "/maʊs/", sentence: "The tiny mouse eats cheese.", sentenceTranslation: "Chú chuột nhỏ bé ăn phô mai.", illustration: "🐭", category: "Animals" },
    { id: "fa18", word: "Horse", translation: "Con ngựa", phonetic: "/hɔːs/", sentence: "The fast horse runs on the grass.", sentenceTranslation: "Chú ngựa chạy nhanh trên cỏ.", illustration: "🐴", category: "Animals" },
    { id: "fa19", word: "Fish", translation: "Con cá", phonetic: "/fɪʃ/", sentence: "The little fish swims in the water.", sentenceTranslation: "Chú cá nhỏ bơi dưới nước.", illustration: "🐟", category: "Animals" },
    { id: "fa20", word: "Turtle", translation: "Con rùa", phonetic: "/ˈtɜːtl/", sentence: "The slow turtle walks slowly.", sentenceTranslation: "Chú rùa chậm chạp bước đi thong thả.", illustration: "🐢", category: "Animals" }
  ];

  const sampleFruits = [
    { id: "ff1", word: "Apple", translation: "Quả táo", phonetic: "/ˈæp.əl/", sentence: "I love eating crunchy red apples.", sentenceTranslation: "Tớ cực kỳ thích ăn những quả táo đỏ giòn rụm.", illustration: "🍎", category: "Fruits" },
    { id: "ff2", word: "Banana", translation: "Quả chuối", phonetic: "/bəˈnɑː.nə/", sentence: "Bananas are sweet and yellow.", sentenceTranslation: "Những quả chuối vừa ngọt vừa có màu vàng óng.", illustration: "🍌", category: "Fruits" },
    { id: "ff3", word: "Watermelon", translation: "Dưa hấu", phonetic: "/ˈwɔː.təˌmel.ən/", sentence: "Watermelon keeps us cool on hot days.", sentenceTranslation: "Dưa hấu giúp chúng ta mát mẻ trong những ngày nóng nực.", illustration: "🍉", category: "Fruits" },
    { id: "ff4", word: "Orange", translation: "Quả cam", phonetic: "/ˈɒr.ɪndʒ/", sentence: "Fresh orange juice is full of vitamins.", sentenceTranslation: "Nước cam tươi có chứa rất nhiều vitamin bổ dưỡng.", illustration: "🍊", category: "Fruits" },
    { id: "ff5", word: "Strawberry", translation: "Quả dâu tây", phonetic: "/ˈstrɔː.bər.i/", sentence: "The cute strawberries are red and sweet.", sentenceTranslation: "Những quả dâu tây xinh xắn vừa đỏ vừa ngọt.", illustration: "🍓", category: "Fruits" },
    { id: "ff6", word: "Grapes", translation: "Quả nho", phonetic: "/greɪps/", sentence: "Lulu has a bunch of delicious grapes.", sentenceTranslation: "Lulu có một chùm nho rất ngon ngọt.", illustration: "🍇", category: "Fruits" },
    { id: "ff7", word: "Pineapple", translation: "Quả dứa", phonetic: "/ˈpaɪn.æp.l/", sentence: "The yellow pineapple is sweet and sour.", sentenceTranslation: "Quả dứa màu vàng có vị chua chua ngọt ngọt.", illustration: "🍍", category: "Fruits" },
    { id: "ff8", word: "Mango", translation: "Quả xoài", phonetic: "/ˈmæŋ.ɡəʊ/", sentence: "I love eating sweet ripe mangoes.", sentenceTranslation: "Tớ thích ăn những quả xoài chín ngọt lịm.", illustration: "🥭", category: "Fruits" },
    { id: "ff9", word: "Peach", translation: "Quả đào", phonetic: "/piːtʃ/", sentence: "The pink peach is soft and juicy.", sentenceTranslation: "Quả đào hồng hào mềm mại và mọng nước.", illustration: "🍑", category: "Fruits" },
    { id: "ff10", word: "Cherry", translation: "Quả anh đào", phonetic: "/ˈtʃer.i/", sentence: "The small red cherries are sweet.", sentenceTranslation: "Những quả anh đào nhỏ màu đỏ thật ngọt ngào.", illustration: "🍒", category: "Fruits" },
    { id: "ff11", word: "Pear", translation: "Quả lê", phonetic: "/peə(r)/", sentence: "The green pear is sweet and crunchy.", sentenceTranslation: "Quả lê xanh ngọt và giòn rụm.", illustration: "🍐", category: "Fruits" },
    { id: "ff12", word: "Lemon", translation: "Quả chanh", phonetic: "/ˈlem.ən/", sentence: "The yellow lemon is very sour.", sentenceTranslation: "Quả chanh màu vàng thì rất chua.", illustration: "🍋", category: "Fruits" },
    { id: "ff13", word: "Coconut", translation: "Quả dừa", phonetic: "/ˈkəʊ.kə.nʌt/", sentence: "Coconut water is very sweet and fresh.", sentenceTranslation: "Nước dừa rất ngọt và tươi mát.", illustration: "🥥", category: "Fruits" },
    { id: "ff14", word: "Melon", translation: "Quả dưa lưới", phonetic: "/ˈmel.ən/", sentence: "The melon is sweet and cool.", sentenceTranslation: "Quả dưa lưới ngọt ngào và mát lành.", illustration: "🍈", category: "Fruits" },
    { id: "ff15", word: "Kiwi", translation: "Quả kiwi", phonetic: "/ˈkiː.wiː/", sentence: "The green kiwi is delicious.", sentenceTranslation: "Quả kiwi màu xanh ăn rất ngon.", illustration: "🥝", category: "Fruits" },
    { id: "ff16", word: "Avocado", translation: "Quả bơ", phonetic: "/ˌæv.əˈkɑː.dəʊ/", sentence: "Avocado is soft and very healthy.", sentenceTranslation: "Quả bơ mềm mại và rất tốt cho sức khỏe.", illustration: "🥑", category: "Fruits" },
    { id: "ff17", word: "Tomato", translation: "Quả cà chua", phonetic: "/təˈmɑː.təʊ/", sentence: "The tomato is red and round.", sentenceTranslation: "Quả cà chua màu đỏ và tròn xòe.", illustration: "🍅", category: "Fruits" },
    { id: "ff18", word: "Plum", translation: "Quả mận", phonetic: "/plʌm/", sentence: "The sweet plum has a dark color.", sentenceTranslation: "Quả mận ngọt có màu đậm đà.", illustration: "🍑", category: "Fruits" },
    { id: "ff19", word: "Blueberry", translation: "Quả việt quất", phonetic: "/ˈbluː.bər.i/", sentence: "Blueberries are small and blue.", sentenceTranslation: "Những quả việt quất nhỏ nhắn và có màu xanh dương.", illustration: "🫐", category: "Fruits" },
    { id: "ff20", word: "Papaya", translation: "Quả đu đủ", phonetic: "/pəˈpaɪ.ə/", sentence: "The orange papaya is soft and sweet.", sentenceTranslation: "Quả đu đủ màu cam mềm mại và ngọt ngào.", illustration: "🍈", category: "Fruits" }
  ];

  const sampleSchool = [
    { id: "fs1", word: "Book", translation: "Quyển sách", phonetic: "/bʊk/", sentence: "This book has funny animal stories.", sentenceTranslation: "Quyển sách này có những câu chuyện động vật vui nhộn.", illustration: "📕", category: "School Objects" },
    { id: "fs2", word: "Pencil", translation: "Bút chì", phonetic: "/ˈpen.səl/", sentence: "I draw a smiling flower with my pencil.", sentenceTranslation: "Tớ vẽ một bông hoa mỉm cười bằng bút chì của tớ.", illustration: "✏️", category: "School Objects" },
    { id: "fs3", word: "Ruler", translation: "Thước kẻ", phonetic: "/ˈruː.lər/", sentence: "Use your ruler to make straight lines.", sentenceTranslation: "Hãy dùng thước kẻ của cậu để vẽ những đường thẳng nhé.", illustration: "📏", category: "School Objects" },
    { id: "fs4", word: "Backpack", translation: "Balo", phonetic: "/ˈbæk.pæk/", sentence: "My school backpack is heavy but colorful.", sentenceTranslation: "Balo đi học của tớ tuy nặng nhưng đầy màu sắc.", illustration: "🎒", category: "School Objects" },
    { id: "fs5", word: "Eraser", translation: "Cục tẩy", phonetic: "/let's use Eraser/", sentence: "I erase the tiny mistake quickly.", sentenceTranslation: "Tớ tẩy vết sai nhỏ một cách nhanh chóng.", illustration: "🧼", category: "School Objects" },
    { id: "fs6", word: "School", translation: "Trường học", phonetic: "/skuːl/", sentence: "School is a happy place to meet friends.", sentenceTranslation: "Trường học là một nơi vui vẻ để gặp gỡ bạn bè.", illustration: "🏫", category: "School Objects" },
    { id: "fs7", word: "Pen", translation: "Bút mực", phonetic: "/pen/", sentence: "I write my homework with a blue pen.", sentenceTranslation: "Tôi viết bài tập về nhà bằng bút mực xanh.", illustration: "🖊️", category: "School Objects" },
    { id: "fs8", word: "Desk", translation: "Bàn học", phonetic: "/desk/", sentence: "I sit at my clean desk to read.", sentenceTranslation: "Tôi ngồi đọc sách tại chiếc bàn học sạch sẽ.", illustration: "📥", category: "School Objects" },
    { id: "fs9", word: "Chair", translation: "Ghế", phonetic: "/tʃeə(r)/", sentence: "I sit on a comfortable wooden chair.", sentenceTranslation: "Tôi ngồi trên chiếc ghế gỗ thoải mái.", illustration: "🪑", category: "School Objects" },
    { id: "fs10", word: "Notebook", translation: "Vở ghi", phonetic: "/ˈnəʊt.bʊk/", sentence: "I write new English words in my notebook.", sentenceTranslation: "Tôi viết từ mới tiếng Anh vào vở ghi của mình.", illustration: "📓", category: "School Objects" },
    { id: "fs11", word: "Marker", translation: "Bút viết bảng", phonetic: "/ˈmɑː.kər/", sentence: "The teacher writes with a red marker.", sentenceTranslation: "Cô giáo viết bài bằng bút lông màu đỏ.", illustration: "🖍️", category: "School Objects" },
    { id: "fs12", word: "Sharpener", translation: "Gọt bút chì", phonetic: "/ˈʃɑːp.nər/", sentence: "I sharpen my pencil with a sharpener.", sentenceTranslation: "Tôi chuốt nhọn bút chì bằng chiếc gọt bút chì.", illustration: "✏️", category: "School Objects" },
    { id: "fs13", word: "Scissors", translation: "Cây kéo", phonetic: "/ˈsɪz.əz/", sentence: "I cut colorful paper with my scissors.", sentenceTranslation: "Tôi cắt giấy màu bằng cây kéo của tôi.", illustration: "✂️", category: "School Objects" },
    { id: "fs14", word: "Glue", translation: "Keo dán", phonetic: "/ɡluː/", sentence: "I stick the pictures using craft glue.", sentenceTranslation: "Tôi dán tranh bằng keo dán thủ công.", illustration: "🧴", category: "School Objects" },
    { id: "fs15", word: "Board", translation: "Bảng học", phonetic: "/bɔːd/", sentence: "Look at the blackboard for our lesson.", sentenceTranslation: "Hãy nhìn lên bảng đen để theo dõi bài học.", illustration: "📋", category: "School Objects" },
    { id: "fs16", word: "Crayon", translation: "Bút sáp màu", phonetic: "/ˈcreɪ.ɒn/", sentence: "I draw a yellow sun with my crayon.", sentenceTranslation: "Tôi vẽ một mặt trời màu vàng bằng bút sáp màu của tôi.", illustration: "🖍️", category: "School Objects" },
    { id: "fs17", word: "Computer", translation: "Máy tính", phonetic: "/kəmˈpjuː.tər/", sentence: "We play educational games on the computer.", sentenceTranslation: "Chúng tôi chơi trò chơi học tập trên máy tính.", illustration: "💻", category: "School Objects" },
    { id: "fs18", word: "Paper", translation: "Tờ giấy", phonetic: "/ˈpeɪ.pər/", sentence: "I write my name on the white paper.", sentenceTranslation: "Tôi viết tên mình lên tờ giấy trắng.", illustration: "📄", category: "School Objects" },
    { id: "fs19", word: "Clock", translation: "Đồng hồ", phonetic: "/klɒk/", sentence: "The school clock tells us it is lunchtime.", sentenceTranslation: "Đồng hồ trường học báo hiệu đã đến giờ ăn trưa.", illustration: "⏰", category: "School Objects" },
    { id: "fs20", word: "Map", translation: "Bản đồ", phonetic: "/mæp/", sentence: "We look at the world map on the wall.", sentenceTranslation: "Chúng tôi xem bản đồ thế giới treo trên tường.", illustration: "🗺️", category: "School Objects" }
  ];

  const countMap: Record<string, number> = {
    "pre-starter": 4,
    "starter": 8,
    "mover": 12,
    "flyer": 20,
    "preschool": 8,
    "elementary": 12
  };
  const count = countMap[level.toLowerCase()] || 8;

  let selectedList = sampleAnimals;
  if (normalized.includes("trái") || normalized.includes("quả") || normalized.includes("fruit") || normalized.includes("ăn")) {
    selectedList = sampleFruits;
  } else if (normalized.includes("học") || normalized.includes("trường") || normalized.includes("school") || normalized.includes("đồ dùng")) {
    selectedList = sampleSchool;
  }
  
  return selectedList.slice(0, count);
}

// Development and production asset serving configurations
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Run inside developmental Vite mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production asset routing
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VibeExpress] Server actively listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Critical: Express-Vite backend assembly failed:", err);
});
