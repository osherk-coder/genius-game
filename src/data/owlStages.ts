/** The owl grows as the child answers more questions correctly. */
export const OWL_STAGES = [
  { min: 0, name: 'אפרוח', emoji: '🐣' },
  { min: 40, name: 'ינשוף צעיר', emoji: '🐥' },
  { min: 120, name: 'ינשוף', emoji: '🦉' },
  { min: 300, name: 'ינשוף חכם', emoji: '📚' },
  { min: 600, name: 'ינשוף גאון', emoji: '🌟' },
];

export function owlStage(totalCorrect: number): number {
  let s = 0;
  OWL_STAGES.forEach((st, i) => {
    if (totalCorrect >= st.min) s = i;
  });
  return s;
}

/** Progress (0-1) toward the next stage, and how many correct answers are left. */
export function owlProgress(totalCorrect: number): { stage: number; pct: number; left: number } {
  const stage = owlStage(totalCorrect);
  const next = OWL_STAGES[stage + 1];
  if (!next) return { stage, pct: 1, left: 0 };
  const cur = OWL_STAGES[stage].min;
  return { stage, pct: (totalCorrect - cur) / (next.min - cur), left: next.min - totalCorrect };
}
