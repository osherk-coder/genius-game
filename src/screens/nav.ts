import type { TopicId } from '../types';

export type PlayMode =
  | { kind: 'stage'; topic: TopicId; stageIdx: number }
  | { kind: 'daily' }
  | { kind: 'exam'; part: 'A' | 'B' }
  | { kind: 'review' };

export type Screen =
  | { name: 'home' }
  | { name: 'island'; topic: TopicId }
  | { name: 'play'; mode: PlayMode }
  | { name: 'exam' }
  | { name: 'shop' }
  | { name: 'trophies' }
  | { name: 'minutes' }
  | { name: 'parent' }
  | { name: 'lesson'; lessonId: string; back: Screen };

export type Go = (s: Screen) => void;
