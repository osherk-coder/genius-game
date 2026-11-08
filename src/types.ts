export type TopicId = 'math' | 'reading' | 'sequences' | 'analogies' | 'shapes' | 'logic';

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'diamond' | 'hexagon' | 'arrow' | 'heart';

export interface ShapeSpec {
  kind: ShapeKind;
  color: string;
  count?: number;
  rotation?: number;
  filled?: boolean;
}

export interface Option {
  text?: string;
  shape?: ShapeSpec;
}

export interface Question {
  id: string;
  topic: TopicId;
  level: number;
  prompt: string;
  /** Large text shown under the prompt (e.g. a number sequence or an analogy). */
  display?: string;
  /** Reading passage. */
  passage?: string;
  /** Visual grid of shapes; null marks the missing cell. */
  grid?: (ShapeSpec | null)[];
  gridCols?: number;
  options: Option[];
  answer: number;
  hint: string;
  explanation: string;
}
