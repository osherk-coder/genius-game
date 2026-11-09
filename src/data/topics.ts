import type { TopicId } from '../types';

export interface TopicInfo {
  id: TopicId;
  name: string;
  island: string;
  emoji: string;
  stage: 'א' | 'ב';
  color: string;
  desc: string;
}

export const TOPICS: TopicInfo[] = [
  { id: 'math', name: 'חשבון', island: 'אי החשבון', emoji: '🔢', stage: 'א', color: '#f59e0b', desc: 'תרגילים, חייכנים, אי-שוויונים, חידות בציורים ובעיות' },
  { id: 'reading', name: 'הבנת הנקרא', island: 'אי הסיפורים', emoji: '📖', stage: 'א', color: '#10b981', desc: 'קטעי מידע וסיפורים עם שורות ממוספרות' },
  { id: 'sequences', name: 'סדרות ומספרים בצורות', island: 'אי הסדרות', emoji: '🔗', stage: 'ב', color: '#3b82f6', desc: 'סדרות, עיגולים עם מספרים ומכונות' },
  { id: 'analogies', name: 'מילים ויחסים', island: 'אי המילים', emoji: '💬', stage: 'ב', color: '#ec4899', desc: 'קשר בין מילים, השלמת משפטים וביטויים' },
  { id: 'shapes', name: 'צורות', island: 'אי הצורות', emoji: '🔷', stage: 'ב', color: '#8b5cf6', desc: 'מטריצות, סדרות צורות, מצולעים ויוצא דופן' },
  { id: 'logic', name: 'חשיבה', island: 'אי החידות', emoji: '🧩', stage: 'ב', color: '#ef4444', desc: 'חידות היגיון וסידור' },
];

export const topicById = (id: TopicId) => TOPICS.find((t) => t.id === id)!;

export const STAGES_PER_ISLAND = 10;
export const QUESTIONS_PER_STAGE = 8;
export const QUESTIONS_PER_BOSS = 10;
export const BOSS_SECONDS = 6 * 60;

export const isBoss = (stageIdx: number) => stageIdx === STAGES_PER_ISLAND - 1;

/** Allowed difficulty window for a stage: later stages allow harder questions. */
export function stageLevelRange(stageIdx: number): [number, number] {
  const max = Math.min(5, 1 + Math.floor(stageIdx / 2));
  return [Math.max(1, max - 2), max];
}
