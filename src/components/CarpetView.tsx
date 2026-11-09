import type { Carpet } from '../types';

const TILE = 34;

/** The patterned carpet with a dashed hole. */
export function CarpetView({ c }: { c: Carpet }) {
  const w = c.cols * TILE;
  const h = c.rows * TILE;
  return (
    <div className="carpet-wrap">
      <svg viewBox={`-6 -6 ${w + 12} ${h + 12}`} className="carpet" role="img" aria-label="שטיח עם חתיכה חסרה">
        <rect x="-6" y="-6" width={w + 12} height={h + 12} rx="8" fill="#78350f" />
        {c.cells.map((color, i) => {
          const x = (i % c.cols) * TILE;
          const y = Math.floor(i / c.cols) * TILE;
          return color ? (
            <rect key={i} x={x} y={y} width={TILE} height={TILE} fill={color} stroke="#fff" strokeWidth="1.5" />
          ) : (
            <rect key={i} x={x} y={y} width={TILE} height={TILE} fill="#fff" />
          );
        })}
        {(() => {
          const first = c.cells.indexOf(null);
          const x = (first % c.cols) * TILE;
          const y = Math.floor(first / c.cols) * TILE;
          return (
            <>
              <rect x={x} y={y} width={TILE * 2} height={TILE * 2} fill="#fff" stroke="#7c3aed" strokeWidth="3" strokeDasharray="6 4" />
              <text x={x + TILE} y={y + TILE + 10} textAnchor="middle" fontSize="30" fontWeight="800" fill="#7c3aed">
                ?
              </text>
            </>
          );
        })()}
      </svg>
    </div>
  );
}

/** A 2x2 patch shown as an answer option. */
export function PatchView({ colors }: { colors: string[] }) {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" aria-hidden>
      {colors.map((col, i) => (
        <rect key={i} x={(i % 2) * TILE} y={Math.floor(i / 2) * TILE} width={TILE} height={TILE} fill={col} stroke="#fff" strokeWidth="1.5" />
      ))}
    </svg>
  );
}
