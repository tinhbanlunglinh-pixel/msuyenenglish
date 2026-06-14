import { StudentRecord, UnifiedTestResult } from "../types";

const STORAGE_KEY = "minion_student_records";

function getRecords(): Record<string, StudentRecord> {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch (e) {
    return {};
  }
}

function saveRecords(records: Record<string, StudentRecord>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function isSameWeek(ts1: number, ts2: number) {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return d1.getFullYear() === d2.getFullYear() && getWeekNumber(d1) === getWeekNumber(d2);
}

export const StudentRecordManager = {
  getRecord(phone: string, name: string): StudentRecord {
    const records = getRecords();
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    
    let record = records[cleanPhone];
    const now = Date.now();
    
    if (!record) {
      record = {
        phone: cleanPhone,
        name,
        totalStars: 0,
        weeklyStars: 0,
        lastStarDate: now,
        lessonResults: {}
      };
    } else {
      // Check for weekly reset
      if (!isSameWeek(record.lastStarDate, now)) {
        record.weeklyStars = 0;
      }
      // Update name if changed
      if (name) record.name = name;
    }
    
    records[cleanPhone] = record;
    saveRecords(records);
    return record;
  },

  addStars(phone: string, amount: number) {
    const records = getRecords();
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    const record = records[cleanPhone];
    if (record) {
      const now = Date.now();
      if (!isSameWeek(record.lastStarDate, now)) {
        record.weeklyStars = 0;
      }
      record.totalStars += amount;
      record.weeklyStars += amount;
      record.lastStarDate = now;
      saveRecords(records);
    }
  },

  updateLessonResult(phone: string, lessonId: string, updates: Partial<UnifiedTestResult>) {
    const records = getRecords();
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");
    const record = records[cleanPhone];
    if (record) {
      if (!record.lessonResults) record.lessonResults = {};
      if (!record.lessonResults[lessonId]) {
        record.lessonResults[lessonId] = { starsEarned: 0 };
      }
      const lr = record.lessonResults[lessonId];
      if (updates.quizScore !== undefined) {
        lr.quizScore = Math.max(lr.quizScore || 0, updates.quizScore);
      }
      if (updates.gameScore !== undefined) {
        lr.gameScore = Math.max(lr.gameScore || 0, updates.gameScore);
      }
      if (updates.starsEarned !== undefined) {
        lr.starsEarned = updates.starsEarned;
      }
      saveRecords(records);
    }
  }
};
