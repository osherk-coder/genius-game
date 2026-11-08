import type { ShapeKind, ShapeSpec } from '../types';

function path(kind: ShapeKind): string {
  switch (kind) {
    case 'circle':
      return 'M50 10 A40 40 0 1 1 49.9 10 Z';
    case 'square':
      return 'M14 14 H86 V86 H14 Z';
    case 'triangle':
      return 'M50 10 L90 86 H10 Z';
    case 'diamond':
      return 'M50 6 L92 50 L50 94 L8 50 Z';
    case 'hexagon':
      return 'M50 6 L88 28 V72 L50 94 L12 72 V28 Z';
    case 'star':
      return 'M50 6 L61 38 H94 L67 58 L77 92 L50 72 L23 92 L33 58 L6 38 H39 Z';
    case 'heart':
      return 'M50 88 C20 66 6 48 10 30 C14 12 38 8 50 26 C62 8 86 12 90 30 C94 48 80 66 50 88 Z';
    case 'arrow':
      return 'M50 6 L84 44 H62 V94 H38 V44 H16 Z';
  }
}

function One({ s, size }: { s: ShapeSpec; size: number }) {
  const filled = s.filled ?? true;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path
        d={path(s.kind)}
        fill={filled ? s.color : 'none'}
        stroke={s.color}
        strokeWidth={filled ? 3 : 8}
        strokeLinejoin="round"
        transform={s.rotation ? `rotate(${s.rotation} 50 50)` : undefined}
      />
    </svg>
  );
}

/** Renders a shape spec; when count > 1, several small copies inside the cell. */
export function ShapeView({ s, size = 72 }: { s: ShapeSpec; size?: number }) {
  const count = s.count ?? 1;
  if (count === 1) return <One s={s} size={size} />;
  const per = count <= 2 ? 2 : count <= 4 ? 2 : 3;
  const small = Math.floor((size / per) * 0.9);
  return (
    <div className="shape-multi" style={{ width: size, height: size, gridTemplateColumns: `repeat(${per}, 1fr)` }}>
      {Array.from({ length: count }, (_, i) => (
        <One key={i} s={s} size={small} />
      ))}
    </div>
  );
}
