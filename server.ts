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

CRITICAL PRESERVATION & VIETNAMESE-TRANSLATION RULES:
1. Carefully read and extract ALL of the English words and example sentences appearing visually in the uploaded file/image. Do NOT limit or truncate the list – extract every single word found in the source material.
2. PRESERVE ORIGINAL CONTENT: Retain the exact English words and their matching visual sentences. Only correct minor typos. Do not replace them with unrelated vocabulary.
3. Every card must have a word and a matching sentence.
4. If the file contains only full sentences but no isolated words, extract keywords from those sentences to use as "word", and use the visual sentence as "sentence".
5. If the file contains only isolated words but no sentences, design short, encouraging, and playful sentences in English including that word.
6. IMPORTANT TRANSLATION RULE:
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. Do NOT include English definitions, explanations or synonyms. For example, if the word is 'Apple', translation must be 'Quả táo'.
- The 'sentenceTranslation' field MUST contain the accurate, natural-sounding, child-friendly Vietnamese translation of the English example 'sentence'. Do NOT include English text or explanations.
7. Each vocabulary item in the list must feature:
- word: The English vocabulary word with first letters capitalized.
- translation: The exact Vietnamese translation/meaning of the English word. e.g. "Con mèo" or "Chiếc bút chì".
- phonetic: Accurate IPA phonetics (for example, '/kæt/').
- sentence: The English example sentence (preserved from the file if available).
- sentenceTranslation: The exact Vietnamese translation of the example sentence. e.g. "Chú mèo nhỏ kêu meow meow."
- illustration: Exactly one colorful, vivid, child-pleasing Emoji representing the word.`;
      
      if (topic) {
        prompt += `\nAdditional Focus: Prioritize and guide the selection of these vocabulary words around this topic: "${topic}".`;
      }
    } else if (rawContent) {
      // Count the number of words/items the user provided to enforce exact output count
      const inputItems = rawContent.split(/[,;\n]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      const inputCount = inputItems.length;
      prompt = `Please optimize or create an English learning curriculum based entirely on the following raw text list inside:
"${rawContent}".

TOTAL INPUT COUNT: The user has provided exactly ${inputCount} words/items. You MUST generate EXACTLY ${inputCount} vocabulary cards in your response — one for each input word/item. Do NOT generate fewer. Do NOT skip, merge, or truncate any items. The number of objects in the "words" array MUST equal ${inputCount}.

The ${inputCount} input items are:
${inputItems.map((item: string, i: number) => `${i + 1}. "${item}"`).join('\n')}

CRITICAL PRESERVATION & VIETNAMESE-TRANSLATION RULES:
1. PRESERVE ORIGINAL CONTENT: Keep and extract ALL ${inputCount} exact English words found in the text. Do NOT limit, truncate, or select a subset of the input; you must generate a vocabulary card for EVERY SINGLE one of the ${inputCount} input words or phrases provided. Output array length MUST be ${inputCount}.
2. If the text has example sentences or full phrases, you MUST keep those exact sentences inside the "sentence" field. Do not invent custom ones if the text has original sentences.
3. If the text consists only of isolated words, draft very clean, simple, and delightful English sentences containing that word, suitable for ${level || "Starters"}.
4. If the text has only sentences but no keywords, extract key words to use as "word", and keep the visual sentence for the "sentence" field.
5. IMPORTANT TRANSLATION RULE:
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. Do NOT include English definitions, explanations or synonyms. For example, if the word is 'Apple', translation must be 'Quả táo'.
- The 'sentenceTranslation' field MUST contain the accurate, natural-sounding, child-friendly Vietnamese translation of the English example 'sentence'. Do NOT include English text or explanations.
6. Provide fully detailed fields for each word as requested:
- word: The English word.
- translation: The direct Vietnamese translation (meaning) of the word.
- phonetic: Correct IPA phonetic representation.
- sentence: The English example sentence.
- sentenceTranslation: The matching Vietnamese translation of the English example sentence.
- illustration: Exactly one cute, sparkling, kid-friendly emoji representing the word.

FINAL REMINDER: Your output MUST contain exactly ${inputCount} items in the "words" array. Count them before responding.`;
    } else if (topic) {
      prompt = `Please create an engaging English vocabulary course suitable for: ${ageRange}.
The topic is: "${topic}".
You MUST select exactly ${currentLevelConfig.wordCount} highly useful, fun, and level-appropriate English vocabulary words for this topic. The number of words in the output array MUST be ${currentLevelConfig.wordRange} items.

LEVEL-APPROPRIATE VOCABULARY RULES:
- Word difficulty MUST match the level: ${ageRange}
- ${currentLevelConfig.sentenceRule}

IMPORTANT TRANSLATION RULE:
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. Do NOT include English definitions, explanations or synonyms.
- The 'sentenceTranslation' field MUST contain the accurate, natural-sounding, child-friendly Vietnamese translation of the English example 'sentence'.
For each word, fill:
- word: The English word with first letter capitalized. Word complexity must match the level.
- translation: The direct Vietnamese translation (meaning) of the English word.
- phonetic: Accurate IPA pronunciation (for example: '/dɒɡ/').
- sentence: An English sentence containing the word. ${currentLevelConfig.sentenceRule}
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
            systemInstruction: `You are an expert children's English educator and pediatric speech language pathologist specializing in infant and primary school education. Create highly engaging, simple, positive, playful, and developmentally appropriate English lessons. Respond ONLY in valid JSON conforming to the structured schema specified. Avoid complex words. Keep example sentences strictly positive and action-oriented for children. Use clear, vivid, child-pleasing Emojis for the illustration fields. CRITICAL REQUIREMENT FOR TRANSLATION: You must write the English words and sentences in their respective fields (word, sentence), but the 'translation' field must be the DIRECT VIETNAMESE translation of the word (e.g., 'con mèo', 'quả táo'), and the 'sentenceTranslation' field must be the DIRECT VIETNAMESE translation of the example sentence (e.g., 'Chú mèo nhỏ kêu meow meow.'). Do NOT write English explanations or definitions in these translation fields. If the user provides explicit English words or sentences, you MUST preserve and retain those exact English words and their matching sentences, correcting only spelling mistakes. Do not replace them with unrelated generic words. Every vocabulary item in your JSON output must feature both the core vocabulary word ('word') and the associated example sentence ('sentence'). ABSOLUTE RULE ON QUANTITY: When the user provides a list of N words, you MUST output EXACTLY N vocabulary items. Never output fewer items than the user provided. Count the input items and ensure your output array has the same count. Truncating or reducing the user's word list is STRICTLY FORBIDDEN.`,
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
                        description: "Exactly ONE colourful symbol emoji representing the word, e.g. '🐶'",
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
        const inputItems = rawContent.split(/[,;\n]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        const inputCount = inputItems.length;
        const outputCount = parsedData.words.length;
        
        if (outputCount < inputCount) {
          console.warn(`[Gemini Validation] Output has ${outputCount} words but input had ${inputCount}. Filling missing ${inputCount - outputCount} words.`);
          
          // Find which input words are missing from the output
          const existingWordsLower = new Set(parsedData.words.map((w: any) => w.word?.toLowerCase()));
          
          for (const inputItem of inputItems) {
            if (!existingWordsLower.has(inputItem.toLowerCase())) {
              // This input word is missing from output - add a basic entry
              const capitalizedWord = inputItem.charAt(0).toUpperCase() + inputItem.slice(1).toLowerCase();
              parsedData.words.push({
                id: `w-${Date.now()}-fill-${parsedData.words.length}`,
                word: capitalizedWord,
                translation: capitalizedWord, // Will show the English word as placeholder
                phonetic: `/${capitalizedWord.toLowerCase()}/`,
                sentence: `I like ${capitalizedWord.toLowerCase()}.`,
                sentenceTranslation: `Tớ thích ${capitalizedWord.toLowerCase()}.`,
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
      const inputItems = req.body.rawContent.split(/[,;\n]+/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      console.log(`[Fallback] Building from ${inputItems.length} user-provided words`);
      mappedWords = inputItems.map((item: string, idx: number) => {
        const capitalizedWord = item.charAt(0).toUpperCase() + item.slice(1);
        return {
          id: `w-fallback-${Date.now()}-${idx}`,
          word: capitalizedWord,
          translation: capitalizedWord,
          phonetic: `/${item.toLowerCase()}/`,
          sentence: `I like ${item.toLowerCase()}.`,
          sentenceTranslation: `Tớ thích ${item.toLowerCase()}.`,
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
