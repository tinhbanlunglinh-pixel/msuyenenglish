var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "20mb" }));
var classroomsList = [
  {
    id: "class-1",
    name: "L\u1EDBp L\xE1 m\u1EA7m non \u{1F31F}",
    students: [
      { name: "B\xE9 Minh Anh", phone: "0912345678" },
      { name: "B\xE9 H\u01B0\u01A1ng Giang", phone: "0987654321" },
      { name: "B\xE9 B\u1EA3o Nam", phone: "0345678901" },
      { name: "B\xE9 Kh\xE1nh Vy", phone: "0356789012" }
    ],
    createdAt: Date.now() - 864e5 * 5
  },
  {
    id: "class-2",
    name: "L\u1EDBp 3A Ti\u1EC3u h\u1ECDc \u{1F981}",
    students: [
      { name: "Nguy\u1EC5n Ho\xE0ng L\xE2m", phone: "0911223344" },
      { name: "Tr\u1EA7n Th\xFAy V\xE2n", phone: "0922334455" },
      { name: "L\xEA Gia B\u1EA3o", phone: "0933445566" },
      { name: "V\u0169 Tu\u1EA5n T\xFA", phone: "0944556677" }
    ],
    createdAt: Date.now() - 864e5 * 2
  }
];
var testAttempts = [
  {
    id: "att-1",
    studentName: "B\xE9 Minh Anh",
    classId: "class-1",
    className: "L\u1EDBp L\xE1 m\u1EA7m non \u{1F31F}",
    lessonId: "lesson-1",
    lessonTitle: "\u{1F916} T\u1EEB V\u1EF1ng \u0110\u1ED9ng V\u1EADt \u0110\xE1ng Y\xEAu",
    score: 100,
    level: "preschool",
    timestamp: Date.now() - 36e5 * 4,
    teacherName: "C\xF4 Th\u1EA3o"
  },
  {
    id: "att-2",
    studentName: "B\xE9 B\u1EA3o Nam",
    classId: "class-1",
    className: "L\u1EDBp L\xE1 m\u1EA7m non \u{1F31F}",
    lessonId: "lesson-1",
    lessonTitle: "\u{1F916} T\u1EEB V\u1EF1ng \u0110\u1ED9ng V\u1EADt \u0110\xE1ng Y\xEAu",
    score: 80,
    level: "preschool",
    timestamp: Date.now() - 36e5 * 24,
    teacherName: "C\xF4 Th\u1EA3o"
  },
  {
    id: "att-3",
    studentName: "Nguy\u1EC5n Ho\xE0ng L\xE2m",
    classId: "class-2",
    className: "L\u1EDBp 3A Ti\u1EC3u h\u1ECDc \u{1F981}",
    lessonId: "lesson-1",
    lessonTitle: "\u{1F916} T\u1EEB V\u1EF1ng \u0110\u1ED9ng V\u1EADt \u0110\xE1ng Y\xEAu",
    score: 90,
    level: "elementary",
    timestamp: Date.now() - 36e5 * 2,
    teacherName: "Th\u1EA7y H\xF9ng"
  }
];
var lessonsList = [
  {
    id: "lesson-1",
    title: "\u{1F916} T\u1EEB V\u1EF1ng \u0110\u1ED9ng V\u1EADt \u0110\xE1ng Y\xEAu",
    level: "preschool",
    createdAt: Date.now() - 864e5,
    words: [
      {
        id: "m1",
        word: "Cat",
        translation: "Con m\xE8o",
        phonetic: "/k\xE6t/",
        sentence: "The little cat is sleeping.",
        sentenceTranslation: "Ch\xFA m\xE8o nh\u1ECF \u0111ang ng\u1EE7.",
        illustration: "\u{1F431}",
        category: "Animals"
      },
      {
        id: "m2",
        word: "Dog",
        translation: "Con ch\xF3",
        phonetic: "/d\u0252\u0261/",
        sentence: "The happy dog wags its tail.",
        sentenceTranslation: "Ch\xFA ch\xF3 vui v\u1EBB v\u1EABy \u0111u\xF4i.",
        illustration: "\u{1F436}",
        category: "Animals"
      },
      {
        id: "m3",
        word: "Bird",
        translation: "Con chim",
        phonetic: "/b\u025C\u02D0d/",
        sentence: "The colorful bird sings softly.",
        sentenceTranslation: "Ch\xFA chim nhi\u1EC1u m\xE0u s\u1EAFc h\xF3t l\xEDu lo ng\u1ECDt ng\xE0o.",
        illustration: "\u{1F426}",
        category: "Animals"
      },
      {
        id: "m4",
        word: "Monkey",
        translation: "Con kh\u1EC9",
        phonetic: "/\u02C8m\u028C\u014B.ki/",
        sentence: "The banana is yummy for the monkey.",
        sentenceTranslation: "Tr\xE1i chu\u1ED1i ng\u1ECDt ng\xE0o ngon mi\u1EC7ng cho ch\xFA kh\u1EC9.",
        illustration: "\u{1F435}",
        category: "Animals"
      },
      {
        id: "m5",
        word: "Rabbit",
        translation: "Con th\u1ECF",
        phonetic: "/\u02C8r\xE6b.\u026At/",
        sentence: "The fast white rabbit hops to me.",
        sentenceTranslation: "Ch\xFA th\u1ECF tr\u1EAFng ch\u1EA1y nh\u1EA3y th\u1EADt nhanh v\u1EC1 ph\xEDa t\u1EDB.",
        illustration: "\u{1F430}",
        category: "Animals"
      },
      {
        id: "m6",
        word: "Lion",
        translation: "S\u01B0 t\u1EED m\u1EABu",
        phonetic: "/\u02C8la\u026A.\u0259n/",
        sentence: "The big lion rules the savanna jungle.",
        sentenceTranslation: "Ch\xFA s\u01B0 t\u1EED to l\u1EDBn th\u1ED1ng tr\u1ECB v\xF9ng th\u1EA3o nguy\xEAn c\u1ECF.",
        illustration: "\u{1F981}",
        category: "Animals"
      }
    ]
  },
  {
    id: "lesson-2",
    title: "\u{1F34E} Tr\xE1i C\xE2y Ng\u1ECDt L\u1ECBm Cho B\xE9 Th\u01A1",
    level: "preschool",
    createdAt: Date.now() - 1728e5,
    words: [
      {
        id: "ff1",
        word: "Apple",
        translation: "Qu\u1EA3 t\xE1o",
        phonetic: "/\u02C8\xE6p.\u0259l/",
        sentence: "I love eating crunchy red apples.",
        sentenceTranslation: "T\u1EDB c\u1EF1c k\u1EF3 th\xEDch \u0103n nh\u1EEFng qu\u1EA3 t\xE1o \u0111\u1ECF gi\xF2n r\u1EE5m.",
        illustration: "\u{1F34E}",
        category: "Fruits"
      },
      {
        id: "ff2",
        word: "Banana",
        translation: "Qu\u1EA3 chu\u1ED1i",
        phonetic: "/b\u0259\u02C8n\u0251\u02D0.n\u0259/",
        sentence: "Bananas are sweet and yellow.",
        sentenceTranslation: "Nh\u1EEFng qu\u1EA3 chu\u1ED1i v\u1EEBa ng\u1ECDt v\u1EEBa c\xF3 m\xE0u v\xE0ng \xF3ng.",
        illustration: "\u{1F34C}",
        category: "Fruits"
      },
      {
        id: "ff3",
        word: "Orange",
        translation: "Qu\u1EA3 cam",
        phonetic: "/\u02C8\u0252r.\u026And\u0292/",
        sentence: "Fresh orange juice is full of vitamins.",
        sentenceTranslation: "N\u01B0\u1EDBc cam t\u01B0\u01A1i c\xF3 ch\u1EE9a r\u1EA5t nhi\u1EC1u vitamin b\u1ED5 d\u01B0\u1EE1ng.",
        illustration: "\u{1F34A}",
        category: "Fruits"
      }
    ]
  }
];
var DB_FILE = import_path.default.join(process.cwd(), "db.json");
function loadDb() {
  try {
    if (import_fs.default.existsSync(DB_FILE)) {
      const raw = import_fs.default.readFileSync(DB_FILE, "utf-8");
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
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[DB] Had trouble writing to DB file:", err);
  }
}
loadDb();
var apiKey = process.env.GEMINI_API_KEY;
var ai = apiKey ? new import_genai.GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
function getFallbackTranslation(english) {
  const dict = {
    "this is my classroom": "\u0110\xE2y l\xE0 l\u1EDBp h\u1ECDc c\u1EE7a t\u1EDB.",
    "this is my classroom.": "\u0110\xE2y l\xE0 l\u1EDBp h\u1ECDc c\u1EE7a t\u1EDB.",
    "classroom": "L\u1EDBp h\u1ECDc",
    "teacher": "Gi\xE1o vi\xEAn",
    "student": "H\u1ECDc sinh",
    "school": "Tr\u01B0\u1EDDng h\u1ECDc",
    "book": "Quy\u1EC3n s\xE1ch",
    "pencil": "B\xFAt ch\xEC",
    "desk": "B\xE0n h\u1ECDc",
    "chair": "Gh\u1EBF",
    "blackboard": "B\u1EA3ng \u0111en",
    "hello": "Xin ch\xE0o",
    "good morning": "Ch\xE0o bu\u1ED5i s\xE1ng",
    "thank you": "C\u1EA3m \u01A1n b\u1EA1n",
    "how are you": "B\u1EA1n c\xF3 kh\u1ECFe kh\xF4ng?",
    "i like english": "T\u1EDB th\xEDch h\u1ECDc ti\u1EBFng Anh."
  };
  const key = english.toLowerCase().trim();
  const cleanKey = key.endsWith(".") ? key.slice(0, -1).trim() : key;
  return dict[key] || dict[cleanKey] || english;
}
var commonWordsDict = {
  "teacher": { translation: "Gi\xE1o vi\xEAn", phonetic: "/\u02C8ti\u02D0t\u0283\u0259(r)/", sentence: "I love my teacher.", sentenceTranslation: "T\xF4i y\xEAu c\xF4 gi\xE1o c\u1EE7a t\xF4i." },
  "student": { translation: "H\u1ECDc sinh", phonetic: "/\u02C8stju\u02D0dnt/", sentence: "I am a good student.", sentenceTranslation: "T\xF4i l\xE0 m\u1ED9t h\u1ECDc sinh ngoan." },
  "classroom": { translation: "L\u1EDBp h\u1ECDc", phonetic: "/\u02C8kl\u0251\u02D0sru\u02D0m/", sentence: "I like my classroom.", sentenceTranslation: "T\xF4i y\xEAu l\u1EDBp h\u1ECDc c\u1EE7a t\xF4i." },
  "school": { translation: "Tr\u01B0\u1EDDng h\u1ECDc", phonetic: "/sku\u02D0l/", sentence: "I go to school every day.", sentenceTranslation: "T\xF4i \u0111i h\u1ECDc m\u1ED7i ng\xE0y." },
  "book": { translation: "Quy\u1EC3n s\xE1ch", phonetic: "/b\u028Ak/", sentence: "I read a fun book.", sentenceTranslation: "T\xF4i \u0111\u1ECDc m\u1ED9t quy\u1EC3n s\xE1ch th\xFA v\u1ECB." },
  "pencil": { translation: "B\xFAt ch\xEC", phonetic: "/\u02C8tensl/", sentence: "I write with my pencil.", sentenceTranslation: "T\xF4i v\u1EBD b\u1EB1ng b\xFAt ch\xEC c\u1EE7a t\xF4i." },
  "desk": { translation: "B\xE0n h\u1ECDc", phonetic: "/desk/", sentence: "I sit at my desk.", sentenceTranslation: "T\xF4i ng\u1ED3i \u1EDF b\xE0n h\u1ECDc c\u1EE7a t\xF4i." },
  "chair": { translation: "Gh\u1EBF", phonetic: "/t\u0283e\u0259(r)/", sentence: "I sit on my chair.", sentenceTranslation: "T\xF4i ng\u1ED3i tr\xEAn gh\u1EBF c\u1EE7a t\xF4i." },
  "blackboard": { translation: "B\u1EA3ng \u0111en", phonetic: "/\u02C8bl\xE6kb\u0254\u02D0d/", sentence: "The teacher writes on the blackboard.", sentenceTranslation: "C\xF4 gi\xE1o vi\u1EBFt tr\xEAn b\u1EA3ng \u0111en." },
  "pen": { translation: "B\xFAt m\u1EF1c", phonetic: "/pen/", sentence: "I write with my pen.", sentenceTranslation: "T\xF4i vi\u1EBFt b\u1EB1ng b\xFAt m\u1EF1c c\u1EE7a t\xF4i." },
  "eraser": { translation: "C\u1EE5c t\u1EA9y", phonetic: "/\u026A\u02C8re\u026Az\u0259(r)/", sentence: "I rub with my eraser.", sentenceTranslation: "T\xF4i t\u1EA9y b\u1EB1ng c\u1EE5c t\u1EA9y c\u1EE7a t\xF4i." },
  "ruler": { translation: "Th\u01B0\u1EDBc k\u1EBB", phonetic: "/\u02C8ru\u02D0l\u0259(r)/", sentence: "I use my ruler to draw lines.", sentenceTranslation: "T\xF4i d\xF9ng th\u01B0\u1EDBc k\u1EBB \u0111\u1EC3 v\u1EBD c\xE1c \u0111\u01B0\u1EDDng th\u1EB3ng." },
  "notebook": { translation: "V\u1EDF ghi", phonetic: "/\u02C8n\u0259\u028Atb\u028Ak/", sentence: "I write in my notebook.", sentenceTranslation: "T\xF4i vi\u1EBFt v\xE0o v\u1EDF c\u1EE7a t\xF4i." },
  "cat": { translation: "Con m\xE8o", phonetic: "/k\xE6t/", sentence: "I like my cat.", sentenceTranslation: "T\xF4i y\xEAu con m\xE8o c\u1EE7a t\xF4i." },
  "dog": { translation: "Con ch\xF3", phonetic: "/d\u0252\u0261/", sentence: "I like my dog.", sentenceTranslation: "T\xF4i y\xEAu con ch\xF3 c\u1EE7a t\xF4i." },
  "bird": { translation: "Con chim", phonetic: "/b\u025C\u02D0d/", sentence: "The bird sings sweet songs.", sentenceTranslation: "Ch\xFA chim h\xF3t nh\u1EEFng kh\xFAc ca ng\u1ECDt ng\xE0o." },
  "monkey": { translation: "Con kh\u1EC9", phonetic: "/\u02C8m\u028C\u014Bki/", sentence: "The monkey eats sweet bananas.", sentenceTranslation: "Ch\xFA kh\u1EC9 \u0103n nh\u1EEFng qu\u1EA3 chu\u1ED1i ng\u1ECDt l\u1ECBm." },
  "rabbit": { translation: "Con th\u1ECF", phonetic: "/\u02C8r\xE6b\u026At/", sentence: "The white rabbit hops fast.", sentenceTranslation: "Ch\xFA th\u1ECF tr\u1EAFng nh\u1EA3y th\u1EADt nhanh." },
  "lion": { translation: "S\u01B0 t\u1EED", phonetic: "/\u02C8la\u026A\u0259n/", sentence: "The big lion rules the jungle.", sentenceTranslation: "S\u01B0 t\u1EED to l\u1EDBn th\u1ED1ng tr\u1ECB khu r\u1EEBng." },
  "elephant": { translation: "Con voi", phonetic: "/\u02C8el\u026Af\u0259nt/", sentence: "The elephant has a very long nose.", sentenceTranslation: "Ch\xFA voi c\xF3 m\u1ED9t chi\u1EBFc m\u0169i r\u1EA5t d\xE0i." },
  "frog": { translation: "Con \u1EBFch", phonetic: "/fr\u0252\u0261/", sentence: "The green frog jumps high.", sentenceTranslation: "Ch\xFA \u1EBFch xanh nh\u1EA3y th\u1EADt cao." },
  "apple": { translation: "Qu\u1EA3 t\xE1o", phonetic: "/\u02C8\xE6pl/", sentence: "I eat a crunchy red apple.", sentenceTranslation: "T\xF4i \u0103n m\u1ED9t qu\u1EA3 t\xE1o \u0111\u1ECF gi\xF2n r\u1EE5m." },
  "banana": { translation: "Qu\u1EA3 chu\u1ED1i", phonetic: "/b\u0259\u02C8n\u0251\u02D0n\u0259/", sentence: "I love eating sweet yellow bananas.", sentenceTranslation: "T\xF4i th\xEDch \u0103n nh\u1EEFng qu\u1EA3 chu\u1ED1i v\xE0ng ng\u1ECDt l\u1ECBm." },
  "orange": { translation: "Qu\u1EA3 cam", phonetic: "/\u02C8\u0252r\u026And\u0292/", sentence: "I drink orange juice in the morning.", sentenceTranslation: "T\xF4i u\u1ED1ng n\u01B0\u1EDBc cam v\xE0o bu\u1ED5i s\xE1ng." },
  "hello": { translation: "Xin ch\xE0o", phonetic: "/h\u0259\u02C8l\u0259\u028A/", sentence: "I say hello to my friends.", sentenceTranslation: "T\xF4i ch\xE0o c\xE1c b\u1EA1n c\u1EE7a t\xF4i." },
  "goodbye": { translation: "T\u1EA1m bi\u1EC7t", phonetic: "/\u02CC\u0261\u028Ad\u02C8ba\u026A/", sentence: "I say goodbye to my teacher.", sentenceTranslation: "T\xF4i ch\xE0o t\u1EA1m bi\u1EC7t c\xF4 gi\xE1o c\u1EE7a t\xF4i." },
  "mother": { translation: "M\u1EB9", phonetic: "/\u02C8m\u028C\xF0\u0259(r)/", sentence: "I love my mother very much.", sentenceTranslation: "T\xF4i y\xEAu m\u1EB9 c\u1EE7a t\xF4i r\u1EA5t nhi\u1EC1u." },
  "father": { translation: "B\u1ED1", phonetic: "/\u02C8f\u0251\u02D0\xF0\u0259(r)/", sentence: "My father plays games with me.", sentenceTranslation: "B\u1ED1 ch\u01A1i tr\xF2 ch\u01A1i v\u1EDBi t\xF4i." },
  "brother": { translation: "Anh/Em trai", phonetic: "/\u02C8br\u028C\xF0\u0259(r)/", sentence: "I play football with my brother.", sentenceTranslation: "T\xF4i ch\u01A1i \u0111\xE1 b\xF3ng v\u1EDBi anh/em trai c\u1EE7a t\xF4i." },
  "sister": { translation: "Ch\u1ECB/Em g\xE1i", phonetic: "/\u02C8s\u026Ast\u0259(r)/", sentence: "I share my toys with my sister.", sentenceTranslation: "T\xF4i chia s\u1EBB \u0111\u1ED3 ch\u01A1i v\u1EDBi ch\u1ECB/em g\xE1i c\u1EE7a t\xF4i." },
  "baby": { translation: "Em b\xE9", phonetic: "/\u02C8be\u026Abi/", sentence: "The cute baby is sleeping.", sentenceTranslation: "Em b\xE9 \u0111\xE1ng y\xEAu \u0111ang ng\u1EE7." },
  "family": { translation: "Gia \u0111\xECnh", phonetic: "/\u02C8f\xE6m\u0259li/", sentence: "I love my happy family.", sentenceTranslation: "T\xF4i y\xEAu gia \u0111\xECnh h\u1EA1nh ph\xFAc c\u1EE7a t\xF4i." },
  "house": { translation: "Ng\xF4i nh\xE0", phonetic: "/ha\u028As/", sentence: "This is my lovely house.", sentenceTranslation: "\u0110\xE2y l\xE0 ng\xF4i nh\xE0 \u0111\xE1ng y\xEAu c\u1EE7a t\xF4i." },
  "door": { translation: "C\u1EEDa ra v\xE0o", phonetic: "/d\u0254\u02D0(r)/", sentence: "I open the door for my mom.", sentenceTranslation: "T\xF4i m\u1EDF c\u1EEDa cho m\u1EB9." },
  "window": { translation: "C\u1EEDa s\u1ED5", phonetic: "/\u02C8w\u026And\u0259\u028A/", sentence: "I look out of the window.", sentenceTranslation: "T\xF4i nh\xECn ra ngo\xE0i c\u1EEDa s\u1ED5." },
  "bag": { translation: "C\u1EB7p s\xE1ch", phonetic: "/b\xE6\u0261/", sentence: "I pack my books into my bag.", sentenceTranslation: "T\xF4i x\u1EBFp s\xE1ch v\xE0o c\u1EB7p h\u1ECDc sinh." },
  "board": { translation: "B\u1EA3ng h\u1ECDc", phonetic: "/b\u0254\u02D0d/", sentence: "Please look at the board.", sentenceTranslation: "Xin vui l\xF2ng nh\xECn l\xEAn b\u1EA3ng." },
  "marker": { translation: "B\xFAt vi\u1EBFt b\u1EA3ng", phonetic: "/\u02C8m\u0251\u02D0k\u0259(r)/", sentence: "I write on the white board with a marker.", sentenceTranslation: "T\xF4i vi\u1EBFt l\xEAn b\u1EA3ng tr\u1EAFng b\u1EB1ng b\xFAt l\xF4ng." },
  "computer": { translation: "M\xE1y t\xEDnh", phonetic: "/k\u0259m\u02C8pju\u02D0t\u0259(r)/", sentence: "We learn English on the computer.", sentenceTranslation: "Ch\xFAng t\xF4i h\u1ECDc ti\u1EBFng Anh tr\xEAn m\xE1y t\xEDnh." },
  "crayon": { translation: "B\xFAt s\xE1p m\xE0u", phonetic: "/\u02C8kre\u026A\u0252n/", sentence: "I draw a picture with my crayon.", sentenceTranslation: "T\xF4i v\u1EBD m\u1ED9t b\u1EE9c tranh b\u1EB1ng b\xFAt s\xE1p m\xE0u c\u1EE7a t\xF4i." },
  "crayons": { translation: "B\xFAt s\xE1p m\xE0u", phonetic: "/\u02C8kre\u026A\u0252nz/", sentence: "I color with my crayons.", sentenceTranslation: "T\xF4i t\xF4 m\xE0u b\u1EB1ng b\xFAt s\xE1p m\xE0u c\u1EE7a t\xF4i." },
  "paper": { translation: "T\u1EDD gi\u1EA5y", phonetic: "/\u02C8pe\u026Ap\u0259(r)/" },
  "table": { translation: "C\xE1i b\xE0n", phonetic: "/\u02C8te\u026Abl/" },
  "clock": { translation: "\u0110\u1ED3ng h\u1ED3", phonetic: "/kl\u0252k/" },
  "fish": { translation: "Con c\xE1", phonetic: "/f\u026A\u0283/" },
  "bear": { translation: "Con g\u1EA5u", phonetic: "/be\u0259(r)/" },
  "duck": { translation: "Con v\u1ECBt", phonetic: "/d\u028Ck/" },
  "pig": { translation: "Con heo", phonetic: "/p\u026A\u0261/" },
  "chicken": { translation: "Con g\xE0", phonetic: "/\u02C8t\u0283\u026Ak\u026An/" },
  "cow": { translation: "Con b\xF2", phonetic: "/ka\u028A/" },
  "horse": { translation: "Con ng\u1EF1a", phonetic: "/h\u0254\u02D0s/" },
  "sheep": { translation: "Con c\u1EEBu", phonetic: "/\u0283i\u02D0p/" },
  "mouse": { translation: "Con chu\u1ED9t", phonetic: "/m\u028As/" },
  "tiger": { translation: "Con h\u1ED5", phonetic: "/\u02C8ta\u026A\u0261\u0259(r)/" },
  "zebra": { translation: "Ng\u1EF1a v\u1EB1n", phonetic: "/\u02C8zebr\u0259/" },
  "giraffe": { translation: "H\u01B0\u01A1u cao c\u1ED5", phonetic: "/d\u0292\u0259\u02C8r\u0251\u02D0f/" },
  "hippo": { translation: "H\xE0 m\xE3", phonetic: "/\u02C8h\u026Ap\u0259\u028A/" },
  "turtle": { translation: "Con r\xF9a", phonetic: "/\u02C8t\u025C\u02D0tl/" },
  "spider": { translation: "Con nh\u1EC7n", phonetic: "/\u02C8spa\u026Ad\u0259(r)/" },
  "ant": { translation: "Con ki\u1EBFn", phonetic: "/\xE6nt/" },
  "bee": { translation: "Con ong", phonetic: "/bi\u02D0/" },
  "flower": { translation: "B\xF4ng hoa", phonetic: "/\u02C8fla\u028A\u0259(r)/" },
  "tree": { translation: "C\xE1i c\xE2y", phonetic: "/tri\u02D0/" },
  "leaf": { translation: "Chi\u1EBFc l\xE1", phonetic: "/li\u02D0f/" },
  "sun": { translation: "M\u1EB7t tr\u1EDDi", phonetic: "/s\u028Cn/" },
  "moon": { translation: "M\u1EB7t tr\u0103ng", phonetic: "/mu\u02D0n/" },
  "star": { translation: "Ng\xF4i sao", phonetic: "/st\u0251\u02D0(r)/" },
  "cloud": { translation: "\u0110\xE1m m\xE2y", phonetic: "/kla\u028Ad/" },
  "rain": { translation: "C\u01A1n m\u01B0a", phonetic: "/re\u026An/" },
  "sky": { translation: "B\u1EA7u tr\u1EDDi", phonetic: "/ska\u026A/" },
  "water": { translation: "N\u01B0\u1EDBc", phonetic: "/\u02C8w\u0254\u02D0t\u0259(r)/" },
  "milk": { translation: "S\u1EEFa", phonetic: "/m\u026Alk/" },
  "bread": { translation: "B\xE1nh m\xEC", phonetic: "/bred/" },
  "rice": { translation: "C\u01A1m", phonetic: "/ra\u026As/" },
  "cake": { translation: "B\xE1nh ng\u1ECDt", phonetic: "/ke\u026Ak/" },
  "sweet": { translation: "K\u1EB9o ng\u1ECDt", phonetic: "/swi\u02D0t/" },
  "ice cream": { translation: "Kem", phonetic: "/\u02CCa\u026As \u02C8kri\u02D0m/" },
  "toy": { translation: "\u0110\u1ED3 ch\u01A1i", phonetic: "/t\u0254\u026A/" },
  "ball": { translation: "Qu\u1EA3 b\xF3ng", phonetic: "/b\u0254\u02D0l/" },
  "doll": { translation: "B\xFAp b\xEA", phonetic: "/d\u0252l/" },
  "car": { translation: "\xD4 t\xF4", phonetic: "/k\u0251\u02D0(r)/" },
  "train": { translation: "T\xE0u h\u1ECFa", phonetic: "/tre\u026An/" },
  "plane": { translation: "M\xE1y bay", phonetic: "/ple\u026An/" },
  "boat": { translation: "Thuy\u1EC1n", phonetic: "/b\u0259\u028At/" },
  "bike": { translation: "Xe \u0111\u1EA1p", phonetic: "/ba\u026Ak/" },
  "red": { translation: "M\xE0u \u0111\u1ECF", phonetic: "/red/" },
  "blue": { translation: "M\xE0u xanh d\u01B0\u01A1ng", phonetic: "/blu\u02D0/" },
  "green": { translation: "M\xE0u xanh l\xE1", phonetic: "/\u0261ri\u02D0n/" },
  "yellow": { translation: "M\xE0u v\xE0ng", phonetic: "/\u02C8jel\u0259\u028A/" },
  "pink": { translation: "M\xE0u h\u1ED3ng", phonetic: "/p\u026A\u014Bk/" },
  "purple": { translation: "M\xE0u t\xEDm", phonetic: "/\u02C8p\u025C\u02D0pl/" },
  "black": { translation: "M\xE0u \u0111en", phonetic: "/bl\xE6k/" },
  "white": { translation: "M\xE0u tr\u1EAFng", phonetic: "/wa\u026At/" },
  "brown": { translation: "M\xE0u n\xE2u", phonetic: "/bra\u028An/" },
  "grey": { translation: "M\xE0u x\xE1m", phonetic: "/\u0261re\u026A/" },
  "gray": { translation: "M\xE0u x\xE1m", phonetic: "/\u0261re\u026A/" },
  "one": { translation: "S\u1ED1 m\u1ED9t", phonetic: "/w\u028Cn/" },
  "two": { translation: "S\u1ED1 hai", phonetic: "/tu\u02D0/" },
  "three": { translation: "S\u1ED1 ba", phonetic: "/\u03B8ri\u02D0/" },
  "four": { translation: "S\u1ED1 b\u1ED1n", phonetic: "/f\u0254\u02D0(r)/" },
  "five": { translation: "S\u1ED1 n\u0103m", phonetic: "/fa\u026Av/" },
  "six": { translation: "S\u1ED1 s\xE1u", phonetic: "/s\u026Aks/" },
  "seven": { translation: "S\u1ED1 b\u1EA3y", phonetic: "/\u02C8sevn/" },
  "eight": { translation: "S\u1ED1 t\xE1m", phonetic: "/e\u026At/" },
  "nine": { translation: "S\u1ED1 ch\xEDn", phonetic: "/na\u026An/" },
  "ten": { translation: "S\u1ED1 m\u01B0\u1EDDi", phonetic: "/ten/" }
};
function getOrGenerateEntry(word) {
  const key = word.toLowerCase().trim();
  const cleanKey = key.endsWith(".") ? key.slice(0, -1).trim() : key;
  const entry = commonWordsDict[key] || commonWordsDict[cleanKey];
  if (!entry) return void 0;
  if (entry.sentence && entry.sentenceTranslation) {
    return entry;
  }
  let sentence = "";
  let sentenceTranslation = "";
  const translation = entry.translation;
  const colors = ["red", "blue", "green", "yellow", "pink", "purple", "black", "white", "brown", "grey", "gray"];
  const numbers = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const greetings = ["hello", "goodbye"];
  if (colors.includes(cleanKey)) {
    sentence = `I like ${cleanKey}.`;
    sentenceTranslation = `T\xF4i th\xEDch m\xE0u ${translation.toLowerCase()}.`;
  } else if (numbers.includes(cleanKey)) {
    sentence = `I have ${cleanKey} apples.`;
    sentenceTranslation = `T\xF4i c\xF3 ${translation.toLowerCase()} qu\u1EA3 t\xE1o.`;
  } else if (greetings.includes(cleanKey)) {
    sentence = `I say ${cleanKey} to you.`;
    sentenceTranslation = `T\xF4i n\xF3i ${translation.toLowerCase()} v\u1EDBi b\u1EA1n.`;
  } else {
    sentence = `I like my ${cleanKey}.`;
    sentenceTranslation = `T\xF4i y\xEAu ${translation.toLowerCase()} c\u1EE7a t\xF4i.`;
  }
  return {
    ...entry,
    sentence,
    sentenceTranslation
  };
}
function cleanAndFixVocabularyItem(w) {
  if (!w || typeof w !== "object") return w;
  const rawWord = String(w.word || "").trim();
  const wordKey = rawWord.toLowerCase();
  const cleanWordKey = wordKey.endsWith(".") ? wordKey.slice(0, -1).trim() : wordKey;
  const rawPhonetic = String(w.phonetic || "").trim();
  const cleanPhonetic = rawPhonetic.toLowerCase().replace(/[\s/]/g, "");
  const cleanWord = wordKey.replace(/[^a-z]/g, "");
  const isLazyPhonetic = cleanPhonetic === cleanWord || cleanPhonetic === "" || !rawPhonetic.startsWith("/") || !rawPhonetic.endsWith("/");
  const isLazyTranslation = String(w.translation || "").toLowerCase().trim() === wordKey;
  const dictEntry = getOrGenerateEntry(rawWord);
  if (dictEntry) {
    if (isLazyTranslation) {
      w.translation = dictEntry.translation;
    }
    if (isLazyPhonetic) {
      w.phonetic = dictEntry.phonetic;
    }
    const currentSentenceLower = String(w.sentence || "").toLowerCase().trim();
    const isLazySentence = !w.sentence || currentSentenceLower === "" || currentSentenceLower === `i like ${wordKey}.` || currentSentenceLower === `i like ${cleanWordKey}.` || currentSentenceLower === `i like ${wordKey}` || currentSentenceLower === `i like ${cleanWordKey}`;
    if (isLazySentence && dictEntry.sentence) {
      w.sentence = dictEntry.sentence;
      if (dictEntry.sentenceTranslation) {
        w.sentenceTranslation = dictEntry.sentenceTranslation;
      }
    }
  }
  if (String(w.translation || "").toLowerCase().trim() === wordKey) {
    w.translation = getFallbackTranslation(rawWord);
  }
  if (w.sentenceTranslation && rawWord) {
    const rx = new RegExp(`\\b${rawWord}\\b`, "gi");
    if (rx.test(w.sentenceTranslation)) {
      w.sentenceTranslation = w.sentenceTranslation.replace(rx, w.translation.toLowerCase());
    }
  }
  if (w.sentenceTranslation) {
    let sTrans = String(w.sentenceTranslation).trim();
    if (sTrans.startsWith("(") && sTrans.endsWith(")")) {
      sTrans = sTrans.slice(1, -1).trim();
    }
    w.sentenceTranslation = sTrans;
  }
  return w;
}
function getFallbackIllustration(word) {
  const dict = {
    "classroom": "\u{1F3EB}",
    "teacher": "\u{1F469}\u200D\u{1F3EB}",
    "student": "\u{1F9D1}\u200D\u{1F393}",
    "school": "\u{1F392}",
    "book": "\u{1F4D6}",
    "pencil": "\u270F\uFE0F",
    "desk": "\u270D\uFE0F",
    "chair": "\u{1FA91}",
    "blackboard": "\u{1F4CB}",
    "pen": "\u{1F58A}\uFE0F",
    "eraser": "\u{1F9FD}",
    "ruler": "\u{1F4CF}",
    "notebook": "\u{1F4D3}",
    "cat": "\u{1F431}",
    "dog": "\u{1F436}",
    "bird": "\u{1F426}",
    "monkey": "\u{1F435}",
    "rabbit": "\u{1F430}",
    "lion": "\u{1F981}",
    "elephant": "\u{1F418}",
    "frog": "\u{1F438}",
    "apple": "\u{1F34E}",
    "banana": "\u{1F34C}",
    "orange": "\u{1F34A}"
  };
  const key = word.toLowerCase().trim().replace(/[.,?!]/g, "");
  if (dict[key]) return dict[key];
  const list = ["\u{1F3A8}", "\u{1F3AD}", "\u{1F3AA}", "\u{1F3A2}", "\u{1F682}", "\u{1F680}", "\u{1F6F8}", "\u{1F681}", "\u{1F6B2}", "\u{1F6F9}", "\u26BD", "\u{1F3C0}", "\u{1F388}", "\u{1F381}", "\u{1F9F8}", "\u{1F389}", "\u{1F451}", "\u{1F308}", "\u2600\uFE0F", "\u{1F340}", "\u{1F34E}", "\u{1F95D}", "\u{1F349}", "\u{1F347}", "\u{1F955}", "\u{1F355}", "\u{1F9C1}", "\u{1F37F}", "\u{1F369}", "\u{1F964}", "\u{1F43E}", "\u{1F981}", "\u{1F43C}", "\u{1F43B}", "\u{1F98A}", "\u{1F431}", "\u{1F436}", "\u{1F430}", "\u{1F428}", "\u{1F438}"];
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % list.length;
  return list[index];
}
function parseRawContent(rawContent) {
  let lines = rawContent.split(/[\n;]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  if (lines.length === 1 && lines[0].includes(",")) {
    lines = lines[0].split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  }
  return lines.map((line) => {
    let english = line;
    let vietnamese = "";
    const separators = [" - ", " \u2013 ", " : ", " / ", " (", "=>"];
    for (const sep of separators) {
      const idx = line.indexOf(sep);
      if (idx !== -1) {
        english = line.substring(0, idx).trim();
        vietnamese = line.substring(idx + sep.length).replace(/\)$/, "").trim();
        break;
      }
    }
    english = english.replace(/^\d+[\s.\-_)]+/, "").trim();
    return { original: line, english, vietnamese };
  }).filter((item) => item.english.length > 0);
}
app.post("/api/generate-lesson", async (req, res) => {
  try {
    const { topic, rawContent, level, fileData, fileMime } = req.body;
    if (!ai) {
      console.warn("GEMINI_API_KEY is not configured. Serving high-quality illustrative sample lessons.");
      return res.json({
        title: `B\xE0i H\u1ECDc Ti\u1EBFng Anh Tr\xECnh \u0110\u1ED9 ${String(level).toUpperCase()}`,
        words: getFallbackWords(topic || "Animals", level || "starter")
      });
    }
    const levelConfig = {
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
      }
    };
    const currentLevelConfig = levelConfig[level] || levelConfig["starter"];
    const ageRange = currentLevelConfig.ageRange;
    let prompt = "";
    let filePart = null;
    if (fileData && fileMime) {
      let cleanedBase64 = fileData;
      if (fileData.includes(";base64,")) {
        cleanedBase64 = fileData.split(";base64,")[1];
      }
      filePart = {
        inlineData: {
          mimeType: fileMime,
          data: cleanedBase64
        }
      };
      prompt = `Please analyze the uploaded document or image to extract English vocabulary words and complete sentences appropriate for this level: ${ageRange}.

CRITICAL SYSTEM REQUIREMENTS (GI\u1EEE NGUY\xCAN \u0110\u1EA6U V\xC0O - KH\xD4NG S\xC1NG T\u1EA0O):
1. PRESERVE ORIGINAL CONTENT: You MUST extract and output the EXACT English words and matching sentences appearing in the uploaded file/image. Do NOT create, alter, or replace them with custom sentences or vocabulary. Keep them exactly as they are in the file. Do not be creative.
2. DO NOT MIX LANGUAGES IN FIELDS: The 'word' field must contain ONLY the English word/phrase (e.g. "Classroom"). Do NOT add Vietnamese translation text or separators (like " - l\u1EDBp h\u1ECDc") into the 'word' or 'sentence' fields.
3. GRAMMATICAL ACCURACY: Double check all English grammar. Every sentence must be grammatically correct and natural for children.
4. Every card must have a word and a matching sentence.
5. If the file contains only full sentences but no isolated words, extract keywords from those sentences to use as "word", and use the exact visual sentence as "sentence".
6. If the file contains only isolated words but no sentences, write short, grammatically perfect, and simple sentences containing that word.
7. TRANSLATION RULE (D\u1ECACH TI\u1EBENG VI\u1EC6T CHU\u1EA8N, KH\xD4NG D\u1ECACH TR\u1ED8N TI\u1EBENG ANH):
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. NEVER output the English word itself or any English text in the 'translation' field. (E.g. If the word is 'Teacher', translation MUST be 'Gi\xE1o vi\xEAn' or 'C\xF4 gi\xE1o/Th\u1EA7y gi\xE1o', NEVER 'Teacher').
- The 'sentenceTranslation' field MUST contain the direct, natural-sounding, child-friendly Vietnamese translation of the 'sentence'. Do NOT mix English words or write parenthesized English phrases. (E.g. If the sentence is 'I like my teacher.', sentenceTranslation MUST be 'T\xF4i y\xEAu c\xF4 gi\xE1o c\u1EE7a t\xF4i.', NEVER 'T\u1EDB th\xEDch teacher.' or '(T\u1EDB th\xEDch teacher.)').
8. Each vocabulary item in the list must feature:
- word: The English vocabulary word (strictly English, with first letters capitalized).
- translation: The exact Vietnamese translation/meaning.
- phonetic: Accurate IPA phonetics (for example, '/k\xE6t/', '/\u02C8ti\u02D0t\u0283\u0259(r)/'). Do not lazy-render '/teacher/'.
- sentence: The English example sentence (preserved from the file exactly, strictly English).
- sentenceTranslation: The exact Vietnamese translation of the sentence.
- illustration: Exactly one colorful, vivid Emoji representing the word.`;
      if (topic) {
        prompt += `
Additional Focus: Prioritize and guide the selection of these vocabulary words around this topic: "${topic}".`;
      }
    } else if (rawContent) {
      const inputItems = parseRawContent(rawContent);
      const inputCount = inputItems.length;
      prompt = `Please optimize or create an English learning curriculum based entirely on the following raw text list.
You MUST generate EXACTLY ${inputCount} vocabulary cards in your response \u2014 one for each input item. The number of objects in the "words" array MUST equal ${inputCount}.

Here is the parsed input list of ${inputCount} items:
${inputItems.map((item, i) => `${i + 1}. English Word/Phrase: "${item.english}"${item.vietnamese ? `, Vietnamese Translation: "${item.vietnamese}"` : ""}`).join("\n")}

CRITICAL SYSTEM REQUIREMENTS (GI\u1EEE NGUY\xCAN \u0110\u1EA6U V\xC0O - KH\xD4NG S\xC1NG T\u1EA0O):
1. PRESERVE ORIGINAL ENGLISH WORDS: You MUST use the exact English words/phrases listed above (e.g., "${inputItems[0]?.english}"). Do NOT add Vietnamese translation text or separators (like " - l\u1EDBp h\u1ECDc") into the "word" field. The "word" field must contain ONLY the English word/phrase.
2. GRAMMATICAL ACCURACY: Double check all English grammar. Every sentence must be grammatically correct and natural for children.
3. If the input list includes a Vietnamese translation, use that translation for the 'translation' field (or optimize it to be child-friendly). If no translation is provided, translate it accurately to Vietnamese.
4. If the input item already contains a full sentence, use that sentence in the "sentence" field. Otherwise, write a simple, grammatically perfect English sentence containing the word.
5. TRANSLATION RULE (D\u1ECACH TI\u1EBENG VI\u1EC6T CHU\u1EA8N, KH\xD4NG D\u1ECACH TR\u1ED8N TI\u1EBENG ANH):
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. NEVER output the English word itself or any English text in the 'translation' field. (E.g. If the word is 'Teacher', translation MUST be 'Gi\xE1o vi\xEAn' or 'C\xF4 gi\xE1o/Th\u1EA7y gi\xE1o', NEVER 'Teacher').
- The 'sentenceTranslation' field MUST contain the direct, natural-sounding, child-friendly Vietnamese translation of the 'sentence'. Do NOT mix English words or write parenthesized English phrases. (E.g. If the sentence is 'I like my teacher.', sentenceTranslation MUST be 'T\xF4i y\xEAu c\xF4 gi\xE1o c\u1EE7a t\xF4i.', NEVER 'T\u1EDB th\xEDch teacher.' or '(T\u1EDB th\xEDch teacher.)').
6. Provide fully detailed fields for each word as requested:
- word: The clean English word (with no Vietnamese meaning/translation text inside it).
- translation: The direct Vietnamese translation.
- phonetic: Correct IPA phonetic representation (using actual IPA symbols like '/\u02C8ti\u02D0t\u0283\u0259(r)/').
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

TRANSLATION RULE (D\u1ECACH TI\u1EBENG VI\u1EC6T CHU\u1EA8N, KH\xD4NG D\u1ECACH TR\u1ED8N TI\u1EBENG ANH):
- The 'translation' field MUST contain the direct Vietnamese translation of the core vocabulary word. NEVER output the English word itself or any English text in the 'translation' field. (E.g. If the word is 'Teacher', translation MUST be 'Gi\xE1o vi\xEAn' or 'C\xF4 gi\xE1o/Th\u1EA7y gi\xE1o', NEVER 'Teacher').
- The 'sentenceTranslation' field MUST contain the direct, natural-sounding, child-friendly Vietnamese translation of the 'sentence'. Do NOT mix English words or write parenthesized English phrases. (E.g. If the sentence is 'I like my teacher.', sentenceTranslation MUST be 'T\xF4i y\xEAu c\xF4 gi\xE1o c\u1EE7a t\xF4i.', NEVER 'T\u1EDB th\xEDch teacher.' or '(T\u1EDB th\xEDch teacher.)').

For each word, fill:
- word: The English word with first letter capitalized. Word complexity must match the level.
- translation: The direct Vietnamese translation of the English word.
- phonetic: Accurate IPA pronunciation (for example: '/d\u0252\u0261/', '/\u02C8ti\u02D0t\u0283\u0259(r)/').
- sentence: An English sentence containing the word.
- sentenceTranslation: The matching Vietnamese translation of the English example sentence.
- illustration: Exactly one glowing, colorful, delightful emoji representing the word.

REMINDER: Output MUST contain ${currentLevelConfig.wordCount} vocabulary items. Sentences MUST match the complexity level described above.`;
    } else {
      return res.status(400).json({ error: "Please enter a topic, paste text list, or upload a material file." });
    }
    console.log(`[Gemini Request] Generating lesson for level: ${level} with topic: ${topic || "(none)"} (Has File: ${!!filePart}) (Has RawContent: ${!!rawContent}${rawContent ? `, inputWords: ${rawContent.split(/[,;\n]+/).filter((s) => s.trim()).length}` : ""})`);
    let response = null;
    const modelsToTry = ["gemini-2.5-pro", "gemini-1.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let attempts = modelsToTry.length;
    let lastError = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const modelName = modelsToTry[i] || "gemini-2.5-pro";
        console.log(`[Gemini Attempt ${i + 1}] Requesting with model: ${modelName}`);
        const contentsPayload = filePart ? { parts: [filePart, { text: prompt }] } : prompt;
        response = await ai.models.generateContent({
          model: modelName,
          contents: contentsPayload,
          config: {
            systemInstruction: `You are an expert children's English teacher with many years of experience (gi\xE1o vi\xEAn ti\u1EBFng Anh ti\u1EC3u h\u1ECDc v\xE0 m\u1EA7m non nhi\u1EC1u n\u0103m kinh nghi\u1EC7m).
Your English sentences MUST be 100% grammatically correct, natural, simple, and age-appropriate for kids. Never write grammatically incorrect sentences or run-on sentences.
Respond ONLY in valid JSON conforming to the structured schema specified. Avoid complex words. Keep example sentences strictly positive and action-oriented for children. Use clear, vivid, child-pleasing Emojis for the illustration fields.

CRITICAL RULES:
1. PURE VIETNAMESE TRANSLATION (KH\xD4NG D\u1ECACH TR\u1ED8N TI\u1EBENG ANH): The 'translation' field must be the DIRECT VIETNAMESE translation of the word (e.g., 'con m\xE8o', 'qu\u1EA3 t\xE1o'), and the 'sentenceTranslation' field must be the DIRECT VIETNAMESE translation of the example sentence (e.g., 'Ch\xFA m\xE8o nh\u1ECF k\xEAu meow meow.'). Do NOT mix English words, explanations, or definitions into these translation fields. NEVER write the English word inside the Vietnamese translation fields (e.g. never write 'Teacher' as translation for 'Teacher', it must be 'Gi\xE1o vi\xEAn'; and never write 'T\u1EDB th\xEDch teacher.' as translation for 'I like teacher.', it must be 'T\xF4i y\xEAu c\xF4 gi\xE1o c\u1EE7a t\xF4i.').
2. PRESERVE ORIGINAL CONTENT (GI\u1EEE NGUY\xCAN \u0110\u1EA6U V\xC0O - KH\xD4NG S\xC1NG T\u1EA0O): If the user provides explicit English words, text, or uploads a document/image, you must preserve and retain those exact English words and their matching sentences, correcting only spelling mistakes. Do not replace them with unrelated words, do not create new custom sentences if the input already contains sentences. Do not be creative.
3. ABSOLUTE RULE ON QUANTITY: When the user provides a list of N words, you MUST output EXACTLY N vocabulary items. Never output fewer items than the user provided. Count the input items and ensure your output array has the same count. Truncating or reducing the user's word list is STRICTLY FORBIDDEN.`,
            responseMimeType: "application/json",
            responseSchema: {
              type: import_genai.Type.OBJECT,
              required: ["title", "words"],
              properties: {
                title: {
                  type: import_genai.Type.STRING,
                  description: "An engaging, fun lesson title written in Vietnamese, for example: 'B\u1EA1n B\xE8 \u0110\u1ED9ng V\u1EADt \u0110\xE1ng Y\xEAu' or 'Th\u1EBF Gi\u1EDBi Tr\xE1i C\xE2y Ng\u1ECDt L\u1ECBm'"
                },
                words: {
                  type: import_genai.Type.ARRAY,
                  description: `List of English vocabulary words. CRITICAL: If the user provided a raw text list or uploaded file, you MUST output ALL words from the input without any truncation \u2014 the output count MUST match the input count exactly. Never reduce, skip, or limit the list. For topic-based generations, provide exactly ${currentLevelConfig.wordCount} items matching the student's level.`,
                  items: {
                    type: import_genai.Type.OBJECT,
                    required: ["word", "translation", "phonetic", "sentence", "sentenceTranslation", "illustration"],
                    properties: {
                      word: {
                        type: import_genai.Type.STRING,
                        description: "The English word, capitalized properly, e.g., 'Dog'"
                      },
                      translation: {
                        type: import_genai.Type.STRING,
                        description: "The direct, accurate Vietnamese translation of the English word, for example: 'Con ch\xF3' or 'Chi\u1EBFc b\xFAt ch\xEC'. No English definitions or explanations."
                      },
                      phonetic: {
                        type: import_genai.Type.STRING,
                        description: "Standard IPA phonetics (International Phonetic Alphabet) using actual phonetic symbols, for example '/d\u0252\u0261/', '/\u02C8ti\u02D0t\u0283\u0259(r)/', '/\u02C8kl\u0251\u02D0sru\u02D0m/'. Never output the plain English word itself enclosed in slashes (e.g., never write '/teacher/' or '/classroom/')."
                      },
                      sentence: {
                        type: import_genai.Type.STRING,
                        description: "A short, engaging English sentence containing the word. E.g., 'The friendly dog wags its tail.'"
                      },
                      sentenceTranslation: {
                        type: import_genai.Type.STRING,
                        description: "The direct, natural, child-friendly Vietnamese translation of the English example sentence, for example: 'Ch\xFA ch\xF3 vui v\u1EBB v\u1EABy \u0111u\xF4i.'"
                      },
                      illustration: {
                        type: import_genai.Type.STRING,
                        description: "Exactly ONE colourful symbol emoji representing the word, e.g., '\u{1F436}'"
                      }
                    }
                  }
                }
              }
            }
          }
        });
        break;
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini Retry] Attempt ${i + 1} failed.`, err.message || err);
        if (i < attempts - 1) {
          const backoffDelay = i === 0 ? 1e3 : 3e3;
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
      if (parsedData.words && Array.isArray(parsedData.words)) {
        parsedData.words = parsedData.words.map((w, idx) => {
          const cleaned = cleanAndFixVocabularyItem(w);
          return {
            ...cleaned,
            id: `w-${Date.now()}-${idx}`,
            category: topic || "Uploaded List"
          };
        });
      }
      if (rawContent && parsedData.words && Array.isArray(parsedData.words)) {
        const inputItems = parseRawContent(rawContent);
        const inputCount = inputItems.length;
        const outputCount = parsedData.words.length;
        if (outputCount < inputCount) {
          console.warn(`[Gemini Validation] Output has ${outputCount} words but input had ${inputCount}. Filling missing ${inputCount - outputCount} words.`);
          const existingWordsLower = new Set(parsedData.words.map((w) => w.word?.toLowerCase()));
          for (const item of inputItems) {
            if (!existingWordsLower.has(item.english.toLowerCase())) {
              const capitalizedWord = item.english.charAt(0).toUpperCase() + item.english.slice(1).toLowerCase();
              const isSentence = item.english.trim().split(/\s+/).length > 1;
              const translation = item.vietnamese || getFallbackTranslation(item.english);
              const dictEntry = getOrGenerateEntry(capitalizedWord);
              const fallbackPhonetic = `/${capitalizedWord.toLowerCase().replace(/[^a-z\s]/g, "")}/`;
              const newWordItem = {
                word: capitalizedWord,
                translation,
                phonetic: dictEntry ? dictEntry.phonetic : fallbackPhonetic,
                sentence: isSentence ? capitalizedWord : dictEntry && dictEntry.sentence ? dictEntry.sentence : `I like my ${capitalizedWord.toLowerCase()}.`,
                sentenceTranslation: isSentence ? translation : dictEntry && dictEntry.sentenceTranslation ? dictEntry.sentenceTranslation : `T\xF4i y\xEAu ${translation.toLowerCase()} c\u1EE7a t\xF4i.`,
                illustration: getFallbackIllustration(item.english)
              };
              const cleanedWordItem = cleanAndFixVocabularyItem(newWordItem);
              parsedData.words.push({
                ...cleanedWordItem,
                id: `w-${Date.now()}-fill-${parsedData.words.length}`,
                category: topic || "Uploaded List"
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
  } catch (err) {
    console.error("Gemini lesson generation error (switching to fallback):", err);
    const fallbackTitle = req.body.topic ? `\u{1F388} T\u1EEB V\u1EF1ng: ${req.body.topic}` : `\u{1F388} B\xE0i H\u1ECDc ${req.body.level ? String(req.body.level).toUpperCase() : "STARTER"}`;
    let mappedWords;
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
          translation,
          phonetic: dictEntry ? dictEntry.phonetic : fallbackPhonetic,
          sentence: isSentence ? capitalizedWord : dictEntry && dictEntry.sentence ? dictEntry.sentence : `I like my ${item.english.toLowerCase()}.`,
          sentenceTranslation: isSentence ? translation : dictEntry && dictEntry.sentenceTranslation ? dictEntry.sentenceTranslation : `T\xF4i y\xEAu ${translation.toLowerCase()} c\u1EE7a t\xF4i.`,
          illustration: getFallbackIllustration(item.english)
        };
        const cleanedItem = cleanAndFixVocabularyItem(rawItem);
        return {
          ...cleanedItem,
          id: `w-fallback-${Date.now()}-${idx}`,
          category: req.body.topic || "Uploaded List"
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
      errorMsg: req.body.rawContent ? `\u2728 \u0110\xE3 kh\u1EDFi t\u1EA1o ${mappedWords.length} th\u1EBB t\u1EEB v\u1EF1ng d\u1EF1 ph\xF2ng t\u1EEB danh s\xE1ch c\u1EE7a b\u1EA1n! B\u1EA3n d\u1ECBch s\u1EBD \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt khi h\u1EC7 th\u1ED1ng AI ho\u1EA1t \u0111\u1ED9ng tr\u1EDF l\u1EA1i. \u{1F495}` : "H\u1EC7 th\u1ED1ng AI \u0111ang qu\xE1 t\u1EA3i. \u0110\xE3 chu\u1EA9n b\u1ECB s\u1EB5n gi\xE1o \xE1n minh h\u1ECDa ho\u1EA1t h\xECnh t\u01B0\u01A1ng \u1EE9ng si\xEAu \u0111\xE1ng y\xEAu cho Th\u1EA7y C\xF4! \u{1F495}"
    });
  }
});
app.get("/api/lessons", (req, res) => {
  res.json(lessonsList);
});
app.post("/api/lessons", (req, res) => {
  const { id, title, level, words, classId, deadline } = req.body;
  if (!title || !words || !Array.isArray(words)) {
    return res.status(400).json({ error: "D\u1EEF li\u1EC7u b\xE0i h\u1ECDc kh\xF4ng \u0111\u1EA7y \u0111\u1EE7!" });
  }
  const newLesson = {
    id: id || `lesson-${Date.now()}`,
    title,
    level,
    words,
    createdAt: req.body.createdAt || Date.now(),
    classId,
    deadline: deadline ? Number(deadline) : void 0
  };
  lessonsList.unshift(newLesson);
  saveDb();
  res.json({ success: true, lesson: newLesson });
});
app.get("/api/classrooms", (req, res) => {
  res.json(classroomsList);
});
app.post("/api/classrooms", (req, res) => {
  const { id, name, students } = req.body;
  if (!name || !Array.isArray(students)) {
    return res.status(400).json({ error: "D\u1EEF li\u1EC7u l\u1EDBp h\u1ECDc kh\xF4ng \u0111\u1EA7y \u0111\u1EE7!" });
  }
  if (id) {
    const idx = classroomsList.findIndex((c) => c.id === id);
    if (idx !== -1) {
      classroomsList[idx].name = name;
      classroomsList[idx].students = students;
      saveDb();
      return res.json({ success: true, classroom: classroomsList[idx] });
    }
  }
  const newClass = {
    id: `class-${Date.now()}`,
    name,
    students,
    createdAt: Date.now()
  };
  classroomsList.unshift(newClass);
  saveDb();
  res.json({ success: true, classroom: newClass });
});
app.post("/api/classrooms/delete", (req, res) => {
  const { id } = req.body;
  classroomsList = classroomsList.filter((c) => c.id !== id);
  saveDb();
  res.json({ success: true });
});
app.get("/api/attempts", (req, res) => {
  res.json(testAttempts);
});
app.post("/api/attempts", (req, res) => {
  const { studentName, classId, className, lessonId, lessonTitle, score, level, teacherName } = req.body;
  if (!studentName || !classId || !lessonId || score === void 0) {
    return res.status(400).json({ error: "D\u1EEF li\u1EC7u n\u1ED9p b\xE0i kh\xF4ng \u0111\u1EA7y \u0111\u1EE7!" });
  }
  let isLate = req.body.isLate || false;
  const targetLesson = lessonsList.find((l) => l.id === lessonId);
  if (targetLesson && targetLesson.deadline && Date.now() > targetLesson.deadline) {
    isLate = true;
  }
  const newAttempt = {
    id: `att-${Date.now()}`,
    studentName,
    classId,
    className,
    lessonId,
    lessonTitle,
    score,
    level,
    timestamp: Date.now(),
    teacherName: teacherName || "C\xF4 Th\u1EA3o",
    isLate
  };
  testAttempts.unshift(newAttempt);
  saveDb();
  res.json({ success: true, attempt: newAttempt });
});
app.get("/api/student/resolve", (req, res) => {
  const phone = (req.query.phone || "").trim().replace(/[\s-]/g, "");
  if (!phone) {
    return res.status(400).json({ error: "Vui l\xF2ng nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i!" });
  }
  for (const classroom of classroomsList) {
    const student = classroom.students.find((s) => s.phone.trim().replace(/[\s-]/g, "") === phone);
    if (student) {
      const isMamNon = classroom.name.toLowerCase().includes("m\u1EA7m") || classroom.name.toLowerCase().includes("l\xE1");
      const targetLevel = isMamNon ? "preschool" : "elementary";
      const classLessons = lessonsList.filter((l) => l.classId === classroom.id).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      let linkedLesson = classLessons[0];
      if (!linkedLesson) {
        const filteredLessons = lessonsList.filter((l) => l.level === targetLevel).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        linkedLesson = filteredLessons[0] || lessonsList[0];
      }
      return res.json({
        success: true,
        name: student.name,
        phone: student.phone,
        classId: classroom.id,
        className: classroom.name,
        teacherName: isMamNon ? "C\xF4 Th\u1EA3o" : "Th\u1EA7y H\xF9ng",
        linkedLesson: linkedLesson ? { id: linkedLesson.id, title: linkedLesson.title } : null
      });
    }
  }
  res.status(404).json({ error: "Kh\xF4ng t\xECm th\u1EA5y s\u1ED1 \u0111i\u1EC7n tho\u1EA1i trong h\u1EC7 th\u1ED1ng c\u1EE7a Th\u1EA7y C\xF4!" });
});
function getFallbackWords(topic, level) {
  const normalized = topic.toLowerCase();
  const sampleAnimals = [
    { id: "fa1", word: "Cat", translation: "Con m\xE8o", phonetic: "/k\xE6t/", sentence: "The little cat is sleeping.", sentenceTranslation: "Ch\xFA m\xE8o nh\u1ECF \u0111ang ng\u1EE7.", illustration: "\u{1F431}", category: "Animals" },
    { id: "fa2", word: "Dog", translation: "Con ch\xF3", phonetic: "/d\u0252\u0261/", sentence: "The happy dog wags its tail.", sentenceTranslation: "Ch\xFA ch\xF3 vui v\u1EBB v\u1EABy \u0111u\xF4i.", illustration: "\u{1F436}", category: "Animals" },
    { id: "fa3", word: "Monkey", translation: "Con kh\u1EC9", phonetic: "/\u02C8m\u028C\u014B.ki/", sentence: "The monkey eats sweet bananas.", sentenceTranslation: "Ch\xFA kh\u1EC9 th\xEDch \u0103n nh\u1EEFng qu\u1EA3 chu\u1ED1i ng\u1ECDt l\u1ECBm.", illustration: "\u{1F435}", category: "Animals" },
    { id: "fa4", word: "Rabbit", translation: "Con th\u1ECF", phonetic: "/\u02C8r\xE6b.\u026At/", sentence: "The white rabbit hops fast.", sentenceTranslation: "Ch\xFA th\u1ECF tr\u1EAFng nh\u1EA3y th\u1EADt nhanh.", illustration: "\u{1F430}", category: "Animals" },
    { id: "fa5", word: "Lion", translation: "S\u01B0 t\u1EED", phonetic: "/\u02C8la\u026A.\u0259n/", sentence: "The lion rules the savanna jungle.", sentenceTranslation: "Ch\xFA s\u01B0 t\u1EED th\u1ED1ng tr\u1ECB v\xF9ng th\u1EA3o nguy\xEAn c\u1ECF.", illustration: "\u{1F981}", category: "Animals" },
    { id: "fa6", word: "Bird", translation: "Con chim", phonetic: "/b\u025C\u02D0d/", sentence: "The colorful bird sings softly.", sentenceTranslation: "Ch\xFA chim nhi\u1EC1u m\xE0u s\u1EAFc h\xF3t l\xEDu lo ng\u1ECDt ng\xE0o.", illustration: "\u{1F426}", category: "Animals" },
    { id: "fa7", word: "Elephant", translation: "Con voi", phonetic: "/\u02C8el.\u026A.f\u0259nt/", sentence: "The big elephant has a very long nose.", sentenceTranslation: "Ch\xFA voi to l\u1EDBn c\xF3 m\u1ED9t chi\u1EBFc m\u0169i r\u1EA5t d\xE0i.", illustration: "\u{1F418}", category: "Animals" },
    { id: "fa8", word: "Frog", translation: "Con \u1EBFch", phonetic: "/fr\u0252\u0261/", sentence: "The green frog jumps high.", sentenceTranslation: "Ch\xFA \u1EBFch xanh nh\u1EA3y th\u1EADt cao.", illustration: "\u{1F438}", category: "Animals" },
    { id: "fa9", word: "Giraffe", translation: "H\u01B0\u01A1u cao c\u1ED5", phonetic: "/d\u0292\u0259\u02C8r\u0251\u02D0f/", sentence: "The tall giraffe eats green leaves.", sentenceTranslation: "Ch\xFA h\u01B0\u01A1u cao c\u1ED5 cao l\u1EDBn \u0103n nh\u1EEFng chi\u1EBFc l\xE1 xanh.", illustration: "\u{1F992}", category: "Animals" },
    { id: "fa10", word: "Tiger", translation: "Con h\u1ED5", phonetic: "/\u02C8ta\u026A\u0261\u0259(r)/", sentence: "The strong tiger runs very fast.", sentenceTranslation: "Ch\xFA h\u1ED5 m\u1EA1nh m\u1EBD ch\u1EA1y r\u1EA5t nhanh.", illustration: "\u{1F42F}", category: "Animals" },
    { id: "fa11", word: "Pig", translation: "Con heo", phonetic: "/p\u026A\u0261/", sentence: "The cute pink pig plays in the mud.", sentenceTranslation: "Ch\xFA heo h\u1ED3ng \u0111\xE1ng y\xEAu ch\u01A1i trong b\xF9n.", illustration: "\u{1F437}", category: "Animals" },
    { id: "fa12", word: "Sheep", translation: "Con c\u1EEBu", phonetic: "/\u0283i\u02D0p/", sentence: "The white sheep eats grass in the field.", sentenceTranslation: "Ch\xFA c\u1EEBu tr\u1EAFng \u0103n c\u1ECF tr\xEAn c\xE1nh \u0111\u1ED3ng.", illustration: "\u{1F411}", category: "Animals" },
    { id: "fa13", word: "Duck", translation: "Con v\u1ECBt", phonetic: "/d\u028Ck/", sentence: "The little duck swims in the pond.", sentenceTranslation: "Ch\xFA v\u1ECBt nh\u1ECF b\u01A1i trong ao.", illustration: "\u{1F986}", category: "Animals" },
    { id: "fa14", word: "Chicken", translation: "Con g\xE0", phonetic: "/\u02C8t\u0283\u026Ak\u026An/", sentence: "The chicken walks around the farm.", sentenceTranslation: "Con g\xE0 \u0111i quanh trang tr\u1EA1i.", illustration: "\u{1F414}", category: "Animals" },
    { id: "fa15", word: "Cow", translation: "Con b\xF2", phonetic: "/ka\u028A/", sentence: "The friendly cow gives fresh milk.", sentenceTranslation: "Ch\xFA b\xF2 th\xE2n thi\u1EC7n cho s\u1EEFa t\u01B0\u01A1i.", illustration: "\u{1F42E}", category: "Animals" },
    { id: "fa16", word: "Bear", translation: "Con g\u1EA5u", phonetic: "/be\u0259(r)/", sentence: "The big brown bear loves sweet honey.", sentenceTranslation: "Ch\xFA g\u1EA5u n\xE2u l\u1EDBn th\xEDch m\u1EADt ong ng\u1ECDt ng\xE0o.", illustration: "\u{1F43B}", category: "Animals" },
    { id: "fa17", word: "Mouse", translation: "Con chu\u1ED9t", phonetic: "/ma\u028As/", sentence: "The tiny mouse eats cheese.", sentenceTranslation: "Ch\xFA chu\u1ED9t nh\u1ECF b\xE9 \u0103n ph\xF4 mai.", illustration: "\u{1F42D}", category: "Animals" },
    { id: "fa18", word: "Horse", translation: "Con ng\u1EF1a", phonetic: "/h\u0254\u02D0s/", sentence: "The fast horse runs on the grass.", sentenceTranslation: "Ch\xFA ng\u1EF1a ch\u1EA1y nhanh tr\xEAn c\u1ECF.", illustration: "\u{1F434}", category: "Animals" },
    { id: "fa19", word: "Fish", translation: "Con c\xE1", phonetic: "/f\u026A\u0283/", sentence: "The little fish swims in the water.", sentenceTranslation: "Ch\xFA c\xE1 nh\u1ECF b\u01A1i d\u01B0\u1EDBi n\u01B0\u1EDBc.", illustration: "\u{1F41F}", category: "Animals" },
    { id: "fa20", word: "Turtle", translation: "Con r\xF9a", phonetic: "/\u02C8t\u025C\u02D0tl/", sentence: "The slow turtle walks slowly.", sentenceTranslation: "Ch\xFA r\xF9a ch\u1EADm ch\u1EA1p b\u01B0\u1EDBc \u0111i thong th\u1EA3.", illustration: "\u{1F422}", category: "Animals" }
  ];
  const sampleFruits = [
    { id: "ff1", word: "Apple", translation: "Qu\u1EA3 t\xE1o", phonetic: "/\u02C8\xE6p.\u0259l/", sentence: "I love eating crunchy red apples.", sentenceTranslation: "T\u1EDB c\u1EF1c k\u1EF3 th\xEDch \u0103n nh\u1EEFng qu\u1EA3 t\xE1o \u0111\u1ECF gi\xF2n r\u1EE5m.", illustration: "\u{1F34E}", category: "Fruits" },
    { id: "ff2", word: "Banana", translation: "Qu\u1EA3 chu\u1ED1i", phonetic: "/b\u0259\u02C8n\u0251\u02D0.n\u0259/", sentence: "Bananas are sweet and yellow.", sentenceTranslation: "Nh\u1EEFng qu\u1EA3 chu\u1ED1i v\u1EEBa ng\u1ECDt v\u1EEBa c\xF3 m\xE0u v\xE0ng \xF3ng.", illustration: "\u{1F34C}", category: "Fruits" },
    { id: "ff3", word: "Watermelon", translation: "D\u01B0a h\u1EA5u", phonetic: "/\u02C8w\u0254\u02D0.t\u0259\u02CCmel.\u0259n/", sentence: "Watermelon keeps us cool on hot days.", sentenceTranslation: "D\u01B0a h\u1EA5u gi\xFAp ch\xFAng ta m\xE1t m\u1EBB trong nh\u1EEFng ng\xE0y n\xF3ng n\u1EF1c.", illustration: "\u{1F349}", category: "Fruits" },
    { id: "ff4", word: "Orange", translation: "Qu\u1EA3 cam", phonetic: "/\u02C8\u0252r.\u026And\u0292/", sentence: "Fresh orange juice is full of vitamins.", sentenceTranslation: "N\u01B0\u1EDBc cam t\u01B0\u01A1i c\xF3 ch\u1EE9a r\u1EA5t nhi\u1EC1u vitamin b\u1ED5 d\u01B0\u1EE1ng.", illustration: "\u{1F34A}", category: "Fruits" },
    { id: "ff5", word: "Strawberry", translation: "Qu\u1EA3 d\xE2u t\xE2y", phonetic: "/\u02C8str\u0254\u02D0.b\u0259r.i/", sentence: "The cute strawberries are red and sweet.", sentenceTranslation: "Nh\u1EEFng qu\u1EA3 d\xE2u t\xE2y xinh x\u1EAFn v\u1EEBa \u0111\u1ECF v\u1EEBa ng\u1ECDt.", illustration: "\u{1F353}", category: "Fruits" },
    { id: "ff6", word: "Grapes", translation: "Qu\u1EA3 nho", phonetic: "/gre\u026Aps/", sentence: "Lulu has a bunch of delicious grapes.", sentenceTranslation: "Lulu c\xF3 m\u1ED9t ch\xF9m nho r\u1EA5t ngon ng\u1ECDt.", illustration: "\u{1F347}", category: "Fruits" },
    { id: "ff7", word: "Pineapple", translation: "Qu\u1EA3 d\u1EE9a", phonetic: "/\u02C8pa\u026An.\xE6p.l/", sentence: "The yellow pineapple is sweet and sour.", sentenceTranslation: "Qu\u1EA3 d\u1EE9a m\xE0u v\xE0ng c\xF3 v\u1ECB chua chua ng\u1ECDt ng\u1ECDt.", illustration: "\u{1F34D}", category: "Fruits" },
    { id: "ff8", word: "Mango", translation: "Qu\u1EA3 xo\xE0i", phonetic: "/\u02C8m\xE6\u014B.\u0261\u0259\u028A/", sentence: "I love eating sweet ripe mangoes.", sentenceTranslation: "T\u1EDB th\xEDch \u0103n nh\u1EEFng qu\u1EA3 xo\xE0i ch\xEDn ng\u1ECDt l\u1ECBm.", illustration: "\u{1F96D}", category: "Fruits" },
    { id: "ff9", word: "Peach", translation: "Qu\u1EA3 \u0111\xE0o", phonetic: "/pi\u02D0t\u0283/", sentence: "The pink peach is soft and juicy.", sentenceTranslation: "Qu\u1EA3 \u0111\xE0o h\u1ED3ng h\xE0o m\u1EC1m m\u1EA1i v\xE0 m\u1ECDng n\u01B0\u1EDBc.", illustration: "\u{1F351}", category: "Fruits" },
    { id: "ff10", word: "Cherry", translation: "Qu\u1EA3 anh \u0111\xE0o", phonetic: "/\u02C8t\u0283er.i/", sentence: "The small red cherries are sweet.", sentenceTranslation: "Nh\u1EEFng qu\u1EA3 anh \u0111\xE0o nh\u1ECF m\xE0u \u0111\u1ECF th\u1EADt ng\u1ECDt ng\xE0o.", illustration: "\u{1F352}", category: "Fruits" },
    { id: "ff11", word: "Pear", translation: "Qu\u1EA3 l\xEA", phonetic: "/pe\u0259(r)/", sentence: "The green pear is sweet and crunchy.", sentenceTranslation: "Qu\u1EA3 l\xEA xanh ng\u1ECDt v\xE0 gi\xF2n r\u1EE5m.", illustration: "\u{1F350}", category: "Fruits" },
    { id: "ff12", word: "Lemon", translation: "Qu\u1EA3 chanh", phonetic: "/\u02C8lem.\u0259n/", sentence: "The yellow lemon is very sour.", sentenceTranslation: "Qu\u1EA3 chanh m\xE0u v\xE0ng th\xEC r\u1EA5t chua.", illustration: "\u{1F34B}", category: "Fruits" },
    { id: "ff13", word: "Coconut", translation: "Qu\u1EA3 d\u1EEBa", phonetic: "/\u02C8k\u0259\u028A.k\u0259.n\u028Ct/", sentence: "Coconut water is very sweet and fresh.", sentenceTranslation: "N\u01B0\u1EDBc d\u1EEBa r\u1EA5t ng\u1ECDt v\xE0 t\u01B0\u01A1i m\xE1t.", illustration: "\u{1F965}", category: "Fruits" },
    { id: "ff14", word: "Melon", translation: "Qu\u1EA3 d\u01B0a l\u01B0\u1EDBi", phonetic: "/\u02C8mel.\u0259n/", sentence: "The melon is sweet and cool.", sentenceTranslation: "Qu\u1EA3 d\u01B0a l\u01B0\u1EDBi ng\u1ECDt ng\xE0o v\xE0 m\xE1t l\xE0nh.", illustration: "\u{1F348}", category: "Fruits" },
    { id: "ff15", word: "Kiwi", translation: "Qu\u1EA3 kiwi", phonetic: "/\u02C8ki\u02D0.wi\u02D0/", sentence: "The green kiwi is delicious.", sentenceTranslation: "Qu\u1EA3 kiwi m\xE0u xanh \u0103n r\u1EA5t ngon.", illustration: "\u{1F95D}", category: "Fruits" },
    { id: "ff16", word: "Avocado", translation: "Qu\u1EA3 b\u01A1", phonetic: "/\u02CC\xE6v.\u0259\u02C8k\u0251\u02D0.d\u0259\u028A/", sentence: "Avocado is soft and very healthy.", sentenceTranslation: "Qu\u1EA3 b\u01A1 m\u1EC1m m\u1EA1i v\xE0 r\u1EA5t t\u1ED1t cho s\u1EE9c kh\u1ECFe.", illustration: "\u{1F951}", category: "Fruits" },
    { id: "ff17", word: "Tomato", translation: "Qu\u1EA3 c\xE0 chua", phonetic: "/t\u0259\u02C8m\u0251\u02D0.t\u0259\u028A/", sentence: "The tomato is red and round.", sentenceTranslation: "Qu\u1EA3 c\xE0 chua m\xE0u \u0111\u1ECF v\xE0 tr\xF2n x\xF2e.", illustration: "\u{1F345}", category: "Fruits" },
    { id: "ff18", word: "Plum", translation: "Qu\u1EA3 m\u1EADn", phonetic: "/pl\u028Cm/", sentence: "The sweet plum has a dark color.", sentenceTranslation: "Qu\u1EA3 m\u1EADn ng\u1ECDt c\xF3 m\xE0u \u0111\u1EADm \u0111\xE0.", illustration: "\u{1F351}", category: "Fruits" },
    { id: "ff19", word: "Blueberry", translation: "Qu\u1EA3 vi\u1EC7t qu\u1EA5t", phonetic: "/\u02C8blu\u02D0.b\u0259r.i/", sentence: "Blueberries are small and blue.", sentenceTranslation: "Nh\u1EEFng qu\u1EA3 vi\u1EC7t qu\u1EA5t nh\u1ECF nh\u1EAFn v\xE0 c\xF3 m\xE0u xanh d\u01B0\u01A1ng.", illustration: "\u{1FAD0}", category: "Fruits" },
    { id: "ff20", word: "Papaya", translation: "Qu\u1EA3 \u0111u \u0111\u1EE7", phonetic: "/p\u0259\u02C8pa\u026A.\u0259/", sentence: "The orange papaya is soft and sweet.", sentenceTranslation: "Qu\u1EA3 \u0111u \u0111\u1EE7 m\xE0u cam m\u1EC1m m\u1EA1i v\xE0 ng\u1ECDt ng\xE0o.", illustration: "\u{1F348}", category: "Fruits" }
  ];
  const sampleSchool = [
    { id: "fs1", word: "Book", translation: "Quy\u1EC3n s\xE1ch", phonetic: "/b\u028Ak/", sentence: "This book has funny animal stories.", sentenceTranslation: "Quy\u1EC3n s\xE1ch n\xE0y c\xF3 nh\u1EEFng c\xE2u chuy\u1EC7n \u0111\u1ED9ng v\u1EADt vui nh\u1ED9n.", illustration: "\u{1F4D5}", category: "School Objects" },
    { id: "fs2", word: "Pencil", translation: "B\xFAt ch\xEC", phonetic: "/\u02C8pen.s\u0259l/", sentence: "I draw a smiling flower with my pencil.", sentenceTranslation: "T\u1EDB v\u1EBD m\u1ED9t b\xF4ng hoa m\u1EC9m c\u01B0\u1EDDi b\u1EB1ng b\xFAt ch\xEC c\u1EE7a t\u1EDB.", illustration: "\u270F\uFE0F", category: "School Objects" },
    { id: "fs3", word: "Ruler", translation: "Th\u01B0\u1EDBc k\u1EBB", phonetic: "/\u02C8ru\u02D0.l\u0259r/", sentence: "Use your ruler to make straight lines.", sentenceTranslation: "H\xE3y d\xF9ng th\u01B0\u1EDBc k\u1EBB c\u1EE7a c\u1EADu \u0111\u1EC3 v\u1EBD nh\u1EEFng \u0111\u01B0\u1EDDng th\u1EB3ng nh\xE9.", illustration: "\u{1F4CF}", category: "School Objects" },
    { id: "fs4", word: "Backpack", translation: "Balo", phonetic: "/\u02C8b\xE6k.p\xE6k/", sentence: "My school backpack is heavy but colorful.", sentenceTranslation: "Balo \u0111i h\u1ECDc c\u1EE7a t\u1EDB tuy n\u1EB7ng nh\u01B0ng \u0111\u1EA7y m\xE0u s\u1EAFc.", illustration: "\u{1F392}", category: "School Objects" },
    { id: "fs5", word: "Eraser", translation: "C\u1EE5c t\u1EA9y", phonetic: "/let's use Eraser/", sentence: "I erase the tiny mistake quickly.", sentenceTranslation: "T\u1EDB t\u1EA9y v\u1EBFt sai nh\u1ECF m\u1ED9t c\xE1ch nhanh ch\xF3ng.", illustration: "\u{1F9FC}", category: "School Objects" },
    { id: "fs6", word: "School", translation: "Tr\u01B0\u1EDDng h\u1ECDc", phonetic: "/sku\u02D0l/", sentence: "School is a happy place to meet friends.", sentenceTranslation: "Tr\u01B0\u1EDDng h\u1ECDc l\xE0 m\u1ED9t n\u01A1i vui v\u1EBB \u0111\u1EC3 g\u1EB7p g\u1EE1 b\u1EA1n b\xE8.", illustration: "\u{1F3EB}", category: "School Objects" },
    { id: "fs7", word: "Pen", translation: "B\xFAt m\u1EF1c", phonetic: "/pen/", sentence: "I write my homework with a blue pen.", sentenceTranslation: "T\xF4i vi\u1EBFt b\xE0i t\u1EADp v\u1EC1 nh\xE0 b\u1EB1ng b\xFAt m\u1EF1c xanh.", illustration: "\u{1F58A}\uFE0F", category: "School Objects" },
    { id: "fs8", word: "Desk", translation: "B\xE0n h\u1ECDc", phonetic: "/desk/", sentence: "I sit at my clean desk to read.", sentenceTranslation: "T\xF4i ng\u1ED3i \u0111\u1ECDc s\xE1ch t\u1EA1i chi\u1EBFc b\xE0n h\u1ECDc s\u1EA1ch s\u1EBD.", illustration: "\u{1F4E5}", category: "School Objects" },
    { id: "fs9", word: "Chair", translation: "Gh\u1EBF", phonetic: "/t\u0283e\u0259(r)/", sentence: "I sit on a comfortable wooden chair.", sentenceTranslation: "T\xF4i ng\u1ED3i tr\xEAn chi\u1EBFc gh\u1EBF g\u1ED7 tho\u1EA3i m\xE1i.", illustration: "\u{1FA91}", category: "School Objects" },
    { id: "fs10", word: "Notebook", translation: "V\u1EDF ghi", phonetic: "/\u02C8n\u0259\u028At.b\u028Ak/", sentence: "I write new English words in my notebook.", sentenceTranslation: "T\xF4i vi\u1EBFt t\u1EEB m\u1EDBi ti\u1EBFng Anh v\xE0o v\u1EDF ghi c\u1EE7a m\xECnh.", illustration: "\u{1F4D3}", category: "School Objects" },
    { id: "fs11", word: "Marker", translation: "B\xFAt vi\u1EBFt b\u1EA3ng", phonetic: "/\u02C8m\u0251\u02D0.k\u0259r/", sentence: "The teacher writes with a red marker.", sentenceTranslation: "C\xF4 gi\xE1o vi\u1EBFt b\xE0i b\u1EB1ng b\xFAt l\xF4ng m\xE0u \u0111\u1ECF.", illustration: "\u{1F58D}\uFE0F", category: "School Objects" },
    { id: "fs12", word: "Sharpener", translation: "G\u1ECDt b\xFAt ch\xEC", phonetic: "/\u02C8\u0283\u0251\u02D0p.n\u0259r/", sentence: "I sharpen my pencil with a sharpener.", sentenceTranslation: "T\xF4i chu\u1ED1t nh\u1ECDn b\xFAt ch\xEC b\u1EB1ng chi\u1EBFc g\u1ECDt b\xFAt ch\xEC.", illustration: "\u270F\uFE0F", category: "School Objects" },
    { id: "fs13", word: "Scissors", translation: "C\xE2y k\xE9o", phonetic: "/\u02C8s\u026Az.\u0259z/", sentence: "I cut colorful paper with my scissors.", sentenceTranslation: "T\xF4i c\u1EAFt gi\u1EA5y m\xE0u b\u1EB1ng c\xE2y k\xE9o c\u1EE7a t\xF4i.", illustration: "\u2702\uFE0F", category: "School Objects" },
    { id: "fs14", word: "Glue", translation: "Keo d\xE1n", phonetic: "/\u0261lu\u02D0/", sentence: "I stick the pictures using craft glue.", sentenceTranslation: "T\xF4i d\xE1n tranh b\u1EB1ng keo d\xE1n th\u1EE7 c\xF4ng.", illustration: "\u{1F9F4}", category: "School Objects" },
    { id: "fs15", word: "Board", translation: "B\u1EA3ng h\u1ECDc", phonetic: "/b\u0254\u02D0d/", sentence: "Look at the blackboard for our lesson.", sentenceTranslation: "H\xE3y nh\xECn l\xEAn b\u1EA3ng \u0111en \u0111\u1EC3 theo d\xF5i b\xE0i h\u1ECDc.", illustration: "\u{1F4CB}", category: "School Objects" },
    { id: "fs16", word: "Crayon", translation: "B\xFAt s\xE1p m\xE0u", phonetic: "/\u02C8cre\u026A.\u0252n/", sentence: "I draw a yellow sun with my crayon.", sentenceTranslation: "T\xF4i v\u1EBD m\u1ED9t m\u1EB7t tr\u1EDDi m\xE0u v\xE0ng b\u1EB1ng b\xFAt s\xE1p m\xE0u c\u1EE7a t\xF4i.", illustration: "\u{1F58D}\uFE0F", category: "School Objects" },
    { id: "fs17", word: "Computer", translation: "M\xE1y t\xEDnh", phonetic: "/k\u0259m\u02C8pju\u02D0.t\u0259r/", sentence: "We play educational games on the computer.", sentenceTranslation: "Ch\xFAng t\xF4i ch\u01A1i tr\xF2 ch\u01A1i h\u1ECDc t\u1EADp tr\xEAn m\xE1y t\xEDnh.", illustration: "\u{1F4BB}", category: "School Objects" },
    { id: "fs18", word: "Paper", translation: "T\u1EDD gi\u1EA5y", phonetic: "/\u02C8pe\u026A.p\u0259r/", sentence: "I write my name on the white paper.", sentenceTranslation: "T\xF4i vi\u1EBFt t\xEAn m\xECnh l\xEAn t\u1EDD gi\u1EA5y tr\u1EAFng.", illustration: "\u{1F4C4}", category: "School Objects" },
    { id: "fs19", word: "Clock", translation: "\u0110\u1ED3ng h\u1ED3", phonetic: "/kl\u0252k/", sentence: "The school clock tells us it is lunchtime.", sentenceTranslation: "\u0110\u1ED3ng h\u1ED3 tr\u01B0\u1EDDng h\u1ECDc b\xE1o hi\u1EC7u \u0111\xE3 \u0111\u1EBFn gi\u1EDD \u0103n tr\u01B0a.", illustration: "\u23F0", category: "School Objects" },
    { id: "fs20", word: "Map", translation: "B\u1EA3n \u0111\u1ED3", phonetic: "/m\xE6p/", sentence: "We look at the world map on the wall.", sentenceTranslation: "Ch\xFAng t\xF4i xem b\u1EA3n \u0111\u1ED3 th\u1EBF gi\u1EDBi treo tr\xEAn t\u01B0\u1EDDng.", illustration: "\u{1F5FA}\uFE0F", category: "School Objects" }
  ];
  const countMap = {
    "pre-starter": 4,
    "starter": 8,
    "mover": 12,
    "flyer": 20
  };
  const count = countMap[level.toLowerCase()] || 8;
  let selectedList = sampleAnimals;
  if (normalized.includes("tr\xE1i") || normalized.includes("qu\u1EA3") || normalized.includes("fruit") || normalized.includes("\u0103n")) {
    selectedList = sampleFruits;
  } else if (normalized.includes("h\u1ECDc") || normalized.includes("tr\u01B0\u1EDDng") || normalized.includes("school") || normalized.includes("\u0111\u1ED3 d\xF9ng")) {
    selectedList = sampleSchool;
  }
  return selectedList.slice(0, count);
}
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VibeExpress] Server actively listening on http://0.0.0.0:${PORT}`);
  });
}
setupServer().catch((err) => {
  console.error("Critical: Express-Vite backend assembly failed:", err);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
