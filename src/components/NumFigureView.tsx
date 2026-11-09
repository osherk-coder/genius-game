import type { NumFigure } from '../types';

const show = (n: number | null) => (n === null ? '?' : String(n));

/** A circle split in three: top-left, top-right, bottom (like the exam's "numbers in shapes"). */
function SplitCircle({ cell }: { cell: [number | null, number | null, number | null] }) {
  const [l, r, b] = cell;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="numcircle">
      <circle cx="60" cy="60" r="56" fill="#fff" stroke="#4c1d95" strokeWidth="3" />
      <line x1="60" y1="60" x2="60" y2="4" stroke="#4c1d95" strokeWidth="3" />
      <line x1="60" y1="60" x2="11.5" y2="88" stroke="#4c1d95" strokeWidth="3" />
      <line x1="60" y1="60" x2="108.5" y2="88" stroke="#4c1d95" strokeWidth="3" />
      {[
        { v: l, x: 36, y: 50 },
        { v: r, x: 84, y: 50 },
        { v: b, x: 60, y: 98 },
      ].map((t, i) => (
        <text key={i} x={t.x} y={t.y} textAnchor="middle" fontSize="22" fontWeight="800" fill={t.v === null ? '#dc2626' : '#1e1b4b'}>
          {show(t.v)}
        </text>
      ))}
    </svg>
  );
}

export function NumFigureView({ fig }: { fig: NumFigure }) {
  if (fig.kind === 'circles') {
    return (
      <div className="numfig" dir="ltr">
        {fig.cells.map((c, i) => (
          <SplitCircle key={i} cell={c} />
        ))}
      </div>
    );
  }
  return (
    <div className="machines" dir="ltr">
      {fig.rows.map(([a, op, b], i) => (
        <div key={i} className="machine-row">
          <span className={a === null ? 'mball missing' : 'mball'}>{show(a)}</span>
          <span className="marrow">➜</span>
          <span className="mbox">{op}</span>
          <span className="marrow">➜</span>
          <span className={b === null ? 'mball missing' : 'mball'}>{show(b)}</span>
        </div>
      ))}
    </div>
  );
}
