export type TopicId = 'math' | 'reading' | 'sequences' | 'analogies' | 'shapes' | 'logic';

export type ShapeKind =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'star'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'heptagon'
  | 'octagon'
  | 'arrow'
  | 'heart';

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

/** "Numbers in shapes" visuals: split circles, or arrow machines. null marks the missing number. */
export type NumFigure =
  | { kind: 'circles'; cells: [number | null, number | null, number | null][] }
  | { kind: 'machine'; rows: [number | null, string, number | null][] };

export interface Question {
  id: string;
  topic: TopicId;
  level: number;
  prompt: string;
  /** Large text shown under the prompt (e.g. a number sequence or an analogy). */
  display?: string;
  /** Show `display` left-to-right (math expressions). */
  displayLtr?: boolean;
  /** Reading passage: first line is the title, the rest are numbered lines. */
  passage?: string;
  /** Visual grid of shapes; null marks the missing cell. Rendered left-to-right. */
  grid?: (ShapeSpec | null)[];
  gridCols?: number;
  numFigure?: NumFigure;
  options: Option[];
  answer: number;
  hint: string;
  explanation: string;
}
