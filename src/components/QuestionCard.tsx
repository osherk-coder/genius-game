import type { Question } from '../types';
import { ShapeView } from './ShapeView';

interface Props {
  q: Question;
  selected: number | null;
  /** Show correct/wrong colors and explanation. */
  revealed: boolean;
  hintShown: boolean;
  onSelect: (i: number) => void;
}

export function QuestionCard({ q, selected, revealed, hintShown, onSelect }: Props) {
  const hasShapes = q.options.some((o) => o.shape);
  return (
    <div className="qcard">
      {q.passage && (
        <div className="passage">
          {q.passage.split('\n\n').map((p, i) => (i === 0 ? <h4 key={i}>{p}</h4> : <p key={i}>{p}</p>))}
        </div>
      )}
      <div className="prompt">
        {q.prompt.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      {q.display && <div className="display">{q.display}</div>}
      {q.grid && (
        <div className="grid" style={{ gridTemplateColumns: `repeat(${q.gridCols ?? 3}, 1fr)` }}>
          {q.grid.map((cell, i) => (
            <div key={i} className={cell ? 'cell' : 'cell missing'}>
              {cell ? <ShapeView s={cell} size={q.gridCols && q.gridCols > 3 ? 56 : 68} /> : '?'}
            </div>
          ))}
        </div>
      )}
      {hintShown && !revealed && <div className="hint">💡 {q.hint}</div>}
      <div className={hasShapes ? 'options shapes' : 'options'}>
        {q.options.map((o, i) => {
          let cls = 'option';
          if (selected === i) cls += ' selected';
          if (revealed && i === q.answer) cls += ' correct';
          if (revealed && selected === i && i !== q.answer) cls += ' wrong';
          return (
            <button key={i} className={cls} disabled={revealed} onClick={() => onSelect(i)}>
              <span className="opt-letter">{'אבגד'[i]}</span>
              {o.shape ? <ShapeView s={o.shape} size={64} /> : <span className="opt-text">{o.text}</span>}
            </button>
          );
        })}
      </div>
      {revealed && selected !== null && selected !== q.answer && (
        <div className="explain">
          <strong>הסבר:</strong> {q.explanation}
        </div>
      )}
    </div>
  );
}
