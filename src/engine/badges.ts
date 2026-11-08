import type { GameState } from '../store/state';
import { STAGES_PER_ISLAND, TOPICS } from '../data/topics';

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  check: (s: GameState) => boolean;
}

const passed = (s: GameState) => TOPICS.reduce((n, t) => n + s.stars[t.id].filter((x) => x > 0).length, 0);
const islandsDone = (s: GameState) => TOPICS.filter((t) => (s.stars[t.id][STAGES_PER_ISLAND - 1] ?? 0) > 0).length;
const islandsStarted = (s: GameState) => TOPICS.filter((t) => (s.stars[t.id][0] ?? 0) > 0).length;

export const BADGES: Badge[] = [
  { id: 'first', name: 'צעד ראשון', emoji: '👣', desc: 'עברת שלב ראשון', check: (s) => passed(s) >= 1 },
  { id: 'c25', name: 'מתחממת', emoji: '🔥', desc: '25 תשובות נכונות', check: (s) => s.totalCorrect >= 25 },
  { id: 'c100', name: 'מאה!', emoji: '💯', desc: '100 תשובות נכונות', check: (s) => s.totalCorrect >= 100 },
  { id: 'c500', name: 'מוח על', emoji: '🧠', desc: '500 תשובות נכונות', check: (s) => s.totalCorrect >= 500 },
  { id: 'explorer', name: 'חוקרת איים', emoji: '🗺️', desc: 'שיחקת בכל ששת האיים', check: (s) => islandsStarted(s) >= 6 },
  { id: 'perfect', name: 'מושלם', emoji: '⭐', desc: 'שלב עם 3 כוכבים', check: (s) => TOPICS.some((t) => s.stars[t.id].includes(3)) },
  { id: 'perfect10', name: 'כוכבת', emoji: '🌟', desc: '10 שלבים עם 3 כוכבים', check: (s) => TOPICS.reduce((n, t) => n + s.stars[t.id].filter((x) => x === 3).length, 0) >= 10 },
  { id: 'boss1', name: 'מנצחת בוסים', emoji: '🐉', desc: 'ניצחת בוס ראשון', check: (s) => s.bossesBeaten >= 1 },
  { id: 'island1', name: 'כובשת אי', emoji: '🏝️', desc: 'סיימת אי שלם', check: (s) => islandsDone(s) >= 1 },
  { id: 'island6', name: 'מלכת הארכיפלג', emoji: '👑', desc: 'סיימת את כל האיים', check: (s) => islandsDone(s) >= 6 },
  { id: 's3', name: '3 ימים ברצף', emoji: '📅', desc: 'תרגלת 3 ימים ברצף', check: (s) => s.streak.count >= 3 },
  { id: 's7', name: 'שבוע שלם', emoji: '🗓️', desc: 'תרגלת 7 ימים ברצף', check: (s) => s.streak.count >= 7 },
  { id: 's30', name: 'חודש של גאונות', emoji: '🏆', desc: 'תרגלת 30 ימים ברצף', check: (s) => s.streak.count >= 30 },
  { id: 'exam1', name: 'מוכנה למבחן', emoji: '📝', desc: 'סיימת סימולציית מבחן', check: (s) => s.examsDone >= 1 },
  { id: 'exam80', name: 'מצטיינת', emoji: '🎓', desc: '80% ומעלה בסימולציה', check: (s) => s.bestExam >= 80 },
  { id: 'shopper', name: 'קונה ראשונה', emoji: '🛍️', desc: 'קנית פריט בחנות', check: (s) => s.owned.length > 3 },
  { id: 'rich', name: 'אוצר', emoji: '💰', desc: 'צברת 1000 יהלומים', check: (s) => s.coins >= 1000 },
];

export function awardBadges(s: GameState): [GameState, Badge[]] {
  const earned = BADGES.filter((b) => !s.badges.includes(b.id) && b.check(s));
  if (!earned.length) return [s, []];
  return [{ ...s, badges: [...s.badges, ...earned.map((b) => b.id)] }, earned];
}
