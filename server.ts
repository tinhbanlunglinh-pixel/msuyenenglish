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
        wordCount: "4 to 5",
        wordRange: "4-5",
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
        wordCount: "8 to 10",
        wordRange: "8-10",
        ageRange: "Movers (Cambridge English YLE) - Children aged 8-10. Use practical vocabulary, complete sentences describing actions or features, for example: 'The cat is running happily.', 'I eat healthy fruits.'",
        sentenceRule: "Sentences should be medium length (6-10 words), using present continuous, simple past, comparatives, and descriptive language. Example: 'The little cat is running happily in the garden.' or 'She eats healthy fruits every morning.'"
      },
      "flyer": {
        wordCount: "10 to 12",
        wordRange: "10-12",
        ageRange: "Flyers (Cambridge English YLE) - Children aged 10-12. Use rich vocabulary, various sentence structures, and fluid simple storytelling, for example: 'We played fun games in the school garden yesterday.', 'She loves learning English so she can talk to everyone.'",
        sentenceRule: "Sentences should be longer (8-15 words), using varied tenses (past, present, future), compound sentences, adverbs, and richer expressions. Example: 'We played exciting games together in the school garden yesterday afternoon.' or 'She loves learning English because she wants to travel around the world.'"
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
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. Do NOT include English words, explanations, or definitions. For example, if the word is 'Apple', translation must be 'Quả táo'.
- The 'sentenceTranslation' field MUST contain the direct, natural-sounding, child-friendly Vietnamese translation of the 'sentence'. Do NOT mix English words in it (e.g., never write "Tớ thích my teacher is very kind").
8. Each vocabulary item in the list must feature:
- word: The English vocabulary word (strictly English, with first letters capitalized).
- translation: The exact Vietnamese translation/meaning.
- phonetic: Accurate IPA phonetics (for example, '/kæt/').
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
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. Do NOT include English definitions, explanations, or separators.
- The 'sentenceTranslation' field MUST contain the direct, natural-sounding, child-friendly Vietnamese translation of the 'sentence'. Do NOT mix English words in it (e.g., never write "Tớ thích my teacher is very kind").
6. Provide fully detailed fields for each word as requested:
- word: The clean English word (with no Vietnamese meaning/translation text inside it).
- translation: The direct Vietnamese translation.
- phonetic: Correct IPA phonetic representation.
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
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. Do NOT include English definitions, explanations or synonyms.
- The 'sentenceTranslation' field MUST contain the accurate, natural-sounding, child-friendly Vietnamese translation of the English example 'sentence'. Do NOT mix English words in it (e.g., never write "Tớ thích my teacher is very kind").

For each word, fill:
- word: The English word with first letter capitalized. Word complexity must match the level.
- translation: The direct Vietnamese translation of the English word.
- phonetic: Accurate IPA pronunciation (for example: '/dɒɡ/').
- sentence: An English sentence containing the word.
- sentenceTranslation: The matching Vietnamese translation of the English example sentence.
- illustration: Exactly one glowing, colorful, delightful emoji representing the word.

REMINDER: Output MUST contain ${currentLevelConfig.wordCount} vocabulary items. Sentences MUST match the complexity level described above.`;
    } else {
      return res.status(400).json({ error: "Please enter a topic, paste text list, or upload a material file." });
    }

    console.log(`[Gemini Request] Generating lesson for level: ${level} with topic: ${topic || '(none)'} (Has File: ${!!filePart}) (Has RawContent: ${!!rawContent}${rawContent ? `, inputWords: ${rawContent.split(/[,;\n]+/).filter((s: string) => s.trim()).length}` : ''})`);

    let response = null;
    let attempts = 3;
    let lastError = null;

    for (let i = 0; i < attempts; i++) {
       try {
        // Try different model variants in case of high demand / 503 error on gemini-3.5-flash
        const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
        const modelName = modelsToTry[i] || "gemini-3.5-flash";
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
1. PURE VIETNAMESE TRANSLATION (KHÔNG DỊCH TRỘN TIẾNG ANH): The 'translation' field must be the DIRECT VIETNAMESE translation of the word (e.g., 'con mèo', 'quả táo'), and the 'sentenceTranslation' field must be the DIRECT VIETNAMESE translation of the example sentence (e.g., 'Chú mèo nhỏ kêu meow meow.'). Do NOT mix English words, explanations, or definitions into these translation fields (e.g., never write "Tớ thích my teacher is very kind" as a translation).
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
                        description: "Standard IPA phonetics, e.g., '/dɒɡ/'",
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
      // Assign IDs to words automatically
      if (parsedData.words && Array.isArray(parsedData.words)) {
        parsedData.words = parsedData.words.map((w: any, idx: number) => ({
          ...w,
          id: `w-${Date.now()}-${idx}`,
          category: topic || "Uploaded List",
        }));
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
              parsedData.words.push({
                id: `w-${Date.now()}-fill-${parsedData.words.length}`,
                word: capitalizedWord,
                translation: item.vietnamese || capitalizedWord,
                phonetic: `/${capitalizedWord.toLowerCase()}/`,
                sentence: `I like ${capitalizedWord.toLowerCase()}.`,
                sentenceTranslation: `Tớ thích ${item.vietnamese ? item.vietnamese.toLowerCase() : capitalizedWord.toLowerCase()}.`,
                illustration: "📝",
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
        return {
          id: `w-fallback-${Date.now()}-${idx}`,
          word: capitalizedWord,
          translation: item.vietnamese || capitalizedWord,
          phonetic: `/${item.english.toLowerCase()}/`,
          sentence: `I like ${item.english.toLowerCase()}.`,
          sentenceTranslation: `Tớ thích ${item.vietnamese ? item.vietnamese.toLowerCase() : item.english.toLowerCase()}.`,
          illustration: "📝",
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
    {
      id: "fa1",
      word: "Cat",
      translation: "Con mèo",
      phonetic: "/kæt/",
      sentence: "The little cat says meow meow.",
      sentenceTranslation: "Chú mèo nhỏ kêu meow meow.",
      illustration: "🐱",
      category: "Animals",
    },
    {
      id: "fa2",
      word: "Dog",
      translation: "Con chó",
      phonetic: "/dɒɡ/",
      sentence: "The happy dog wags its tail.",
      sentenceTranslation: "Chú chó vui vẻ vẫy đuôi.",
      illustration: "🐶",
      category: "Animals",
    },
    {
      id: "fa3",
      word: "Monkey",
      translation: "Con khỉ",
      phonetic: "/ˈmʌŋ.ki/",
      sentence: "The monkey loves eating sweet bananas.",
      sentenceTranslation: "Chú khỉ thích ăn những quả chuối ngọt lịm.",
      illustration: "🐵",
      category: "Animals",
    },
    {
      id: "fa4",
      word: "Rabbit",
      translation: "Con thỏ",
      phonetic: "/ˈræb.ɪt/",
      sentence: "The rabbit hops fast to get a carrot.",
      sentenceTranslation: "Chú thỏ nhảy nhanh để lấy củ cà rốt.",
      illustration: "🐰",
      category: "Animals",
    },
    {
      id: "fa5",
      word: "Lion",
      translation: "Sư tử",
      phonetic: "/ˈlaɪ.ən/",
      sentence: "The lion is the majestic king of the forest.",
      sentenceTranslation: "Sư tử là vị vua oai nghiêm của khu rừng.",
      illustration: "🦁",
      category: "Animals",
    },
    {
      id: "fa6",
      word: "Bird",
      translation: "Con chim",
      phonetic: "/bɜːd/",
      sentence: "The blue bird sings a sweet song.",
      sentenceTranslation: "Chú chim xanh hót một bài hát ngọt ngào.",
      illustration: "🐦",
      category: "Animals",
    },
    {
      id: "fa7",
      word: "Elephant",
      translation: "Con voi",
      phonetic: "/ˈel.ɪ.fənt/",
      sentence: "The big elephant has a very long nose.",
      sentenceTranslation: "Chú voi to lớn có một chiếc mũi rất dài.",
      illustration: "🐘",
      category: "Animals",
    },
    {
      id: "fa8",
      word: "Frog",
      translation: "Con ếch",
      phonetic: "/frɒɡ/",
      sentence: "The green frog jumps into the cool pond.",
      sentenceTranslation: "Chú ếch xanh nhảy vào ao nước mát lạnh.",
      illustration: "🐸",
      category: "Animals",
    }
  ];

  const sampleFruits = [
    {
      id: "ff1",
      word: "Apple",
      translation: "Quả táo",
      phonetic: "/ˈæp.əl/",
      sentence: "I love eating crunchy red apples.",
      sentenceTranslation: "Tớ thích ăn những quả táo đỏ giòn rụm.",
      illustration: "🍎",
      category: "Fruits",
    },
    {
      id: "ff2",
      word: "Banana",
      translation: "Quả chuối",
      phonetic: "/bəˈnɑː.nə/",
      sentence: "Bananas are sweet and yellow.",
      sentenceTranslation: "Những quả chuối vừa ngọt vừa có màu vàng.",
      illustration: "🍌",
      category: "Fruits",
    },
    {
      id: "ff3",
      word: "Watermelon",
      translation: "Dưa hấu",
      phonetic: "/ˈwɔː.təˌmel.ən/",
      sentence: "Watermelon keeps us cool on hot days.",
      sentenceTranslation: "Dưa hấu giúp chúng ta mát mẻ trong những ngày nóng nực.",
      illustration: "🍉",
      category: "Fruits",
    },
    {
      id: "ff4",
      word: "Orange",
      translation: "Quả cam",
      phonetic: "/ˈɒr.ɪndʒ/",
      sentence: "Fresh orange juice is full of vitamins.",
      sentenceTranslation: "Nước cam tươi chứa đầy các loại vitamin.",
      illustration: "🍊",
      category: "Fruits",
    },
    {
      id: "ff5",
      word: "Strawberry",
      translation: "Quả dâu tây",
      phonetic: "/ˈstrɔː.bər.i/",
      sentence: "The cute strawberries are red and sweet.",
      sentenceTranslation: "Những quả dâu tây xinh xắn vừa đỏ vừa ngọt.",
      illustration: "🍓",
      category: "Fruits",
    },
    {
      id: "ff6",
      word: "Grapes",
      translation: "Quả nho",
      phonetic: "/ɡreɪps/",
      sentence: "Lulu has a bunch of delicious purple grapes.",
      sentenceTranslation: "Lulu có một chùm nho tím rất ngon.",
      illustration: "🍇",
      category: "Fruits",
    }
  ];

  const sampleSchool = [
    {
      id: "fs1",
      word: "Book",
      translation: "Quyển sách",
      phonetic: "/bʊk/",
      sentence: "This book has funny animal stories.",
      sentenceTranslation: "Quyển sách này có những câu chuyện động vật vui nhộn.",
      illustration: "📕",
      category: "School Objects",
    },
    {
      id: "fs2",
      word: "Pencil",
      translation: "Bút chì",
      phonetic: "/ˈpen.səl/",
      sentence: "I draw a smiling flower with my pencil.",
      sentenceTranslation: "Tớ vẽ một bông hoa mỉm cười bằng bút chì của tớ.",
      illustration: "✏️",
      category: "School Objects",
    },
    {
      id: "fs3",
      word: "Ruler",
      translation: "Thước kẻ",
      phonetic: "/ˈruː.lər/",
      sentence: "Use your ruler to make straight lines.",
      sentenceTranslation: "Hãy dùng thước kẻ của cậu để vẽ những đường thẳng nhé.",
      illustration: "📏",
      category: "School Objects",
    },
    {
      id: "fs4",
      word: "Backpack",
      translation: "Balo",
      phonetic: "/ˈbæk.pæk/",
      sentence: "My school backpack is heavy but colorful.",
      sentenceTranslation: "Balo đi học của tớ tuy nặng nhưng đầy màu sắc.",
      illustration: "🎒",
      category: "School Objects",
    },
    {
      id: "fs5",
      word: "Eraser",
      translation: "Cục tẩy",
      phonetic: "/ɪˈreɪ.sər/",
      sentence: "I erase the tiny mistake quickly.",
      sentenceTranslation: "Tớ tẩy vết sai nhỏ một cách nhanh chóng.",
      illustration: "🧼",
      category: "School Objects",
    },
    {
      id: "fs6",
      word: "School",
      translation: "Trường học",
      phonetic: "/skuːl/",
      sentence: "School is a happy place to meet friends.",
      sentenceTranslation: "Trường học là một nơi vui vẻ để gặp gỡ bạn bè.",
      illustration: "🏫",
      category: "School Objects",
    }
  ];

  if (normalized.includes("trái") || normalized.includes("quả") || normalized.includes("fruit") || normalized.includes("ăn")) {
    return sampleFruits;
  } else if (normalized.includes("học") || normalized.includes("trường") || normalized.includes("school") || normalized.includes("đồ dùng")) {
    return sampleSchool;
  } else {
    // Default to lovable animals
    return sampleAnimals;
  }
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
