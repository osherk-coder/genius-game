import { itemById } from '../data/shop';
import type { GameState } from '../store/state';
import { useGame } from '../store/GameContext';
import { owlStage } from '../data/owlStages';

interface Props {
  equipped: GameState['equipped'];
  size?: number;
  mood?: 'happy' | 'sad' | 'wow';
  withBackground?: boolean;
  /** Growth stage 0-4 (defaults to the child's current stage). */
  stage?: number;
}

function Hat({ v }: { v: string }) {
  switch (v) {
    case 'grad':
      return (
        <g>
          <polygon points="40,42 100,18 160,42 100,66" fill="#1e1b4b" />
          <rect x="78" y="44" width="44" height="16" fill="#1e1b4b" />
          <line x1="150" y1="44" x2="150" y2="76" stroke="#facc15" strokeWidth="4" />
          <circle cx="150" cy="78" r="5" fill="#facc15" />
        </g>
      );
    case 'crown':
      return (
        <g>
          <polygon points="60,58 64,20 82,40 100,12 118,40 136,20 140,58" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
          <circle cx="100" cy="44" r="6" fill="#ef4444" />
          <circle cx="76" cy="48" r="4" fill="#3b82f6" />
          <circle cx="124" cy="48" r="4" fill="#22c55e" />
        </g>
      );
    case 'wizard':
      return (
        <g>
          <polygon points="58,62 100,-6 142,62" fill="#4338ca" />
          <ellipse cx="100" cy="62" rx="52" ry="9" fill="#3730a3" />
          <text x="92" y="40" fontSize="18" fill="#facc15">★</text>
          <text x="108" y="22" fontSize="12" fill="#facc15">✦</text>
        </g>
      );
    case 'flower':
      return (
        <g transform="translate(130 40)">
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-12" rx="8" ry="13" fill="#f472b6" transform={`rotate(${a})`} />
          ))}
          <circle r="8" fill="#facc15" />
        </g>
      );
    case 'bow':
      return (
        <g transform="translate(100 38)">
          <polygon points="0,0 -30,-16 -30,16" fill="#ef4444" />
          <polygon points="0,0 30,-16 30,16" fill="#ef4444" />
          <circle r="7" fill="#b91c1c" />
        </g>
      );
    case 'party':
      return (
        <g>
          <polygon points="76,52 100,-2 124,52" fill="#22d3ee" />
          <path d="M84 36 L116 36 M90 22 L110 22" stroke="#f472b6" strokeWidth="5" />
          <circle cx="100" cy="-2" r="7" fill="#facc15" />
        </g>
      );
    case 'phones':
      return (
        <g>
          <path d="M40 92 C40 20 160 20 160 92" fill="none" stroke="#334155" strokeWidth="9" />
          <rect x="28" y="84" width="22" height="34" rx="8" fill="#ef4444" />
          <rect x="150" y="84" width="22" height="34" rx="8" fill="#ef4444" />
        </g>
      );
  }
  return null;
}

function Glasses({ v }: { v: string }) {
  const bridge = <line x1="90" y1="96" x2="110" y2="96" stroke="#1e293b" strokeWidth="4" />;
  switch (v) {
    case 'round':
      return (
        <g fill="none" stroke="#1e293b" strokeWidth="4">
          <circle cx="72" cy="96" r="24" />
          <circle cx="128" cy="96" r="24" />
          {bridge}
        </g>
      );
    case 'sun':
      return (
        <g>
          <rect x="46" y="80" width="48" height="32" rx="10" fill="#0f172a" opacity="0.9" />
          <rect x="106" y="80" width="48" height="32" rx="10" fill="#0f172a" opacity="0.9" />
          {bridge}
        </g>
      );
    case 'star':
      return (
        <g fill="#facc15" stroke="#ca8a04" strokeWidth="2" opacity="0.92">
          <path d="M72 70 L79 88 H98 L83 99 L89 118 L72 106 L55 118 L61 99 L46 88 H65 Z" />
          <path d="M128 70 L135 88 H154 L139 99 L145 118 L128 106 L111 118 L117 99 L102 88 H121 Z" />
        </g>
      );
    case 'heart':
      return (
        <g fill="#f43f5e" opacity="0.9">
          <path d="M72 118 C50 102 44 90 48 80 C52 70 66 70 72 82 C78 70 92 70 96 80 C100 90 94 102 72 118 Z" />
          <path d="M128 118 C106 102 100 90 104 80 C108 70 122 70 128 82 C134 70 148 70 152 80 C156 90 150 102 128 118 Z" />
        </g>
      );
  }
  return null;
}

function Accessory({ v }: { v: string }) {
  switch (v) {
    case 'scarf':
      return (
        <g>
          <path d="M50 150 Q100 172 150 150 L150 164 Q100 186 50 164 Z" fill="#ef4444" />
          <rect x="120" y="160" width="18" height="40" rx="4" fill="#dc2626" />
        </g>
      );
    case 'bowtie':
      return (
        <g transform="translate(100 160)">
          <polygon points="0,0 -24,-14 -24,14" fill="#2563eb" />
          <polygon points="0,0 24,-14 24,14" fill="#2563eb" />
          <circle r="6" fill="#1e40af" />
        </g>
      );
    case 'book':
      return (
        <g transform="translate(22 170) rotate(-12)">
          <rect width="46" height="34" rx="3" fill="#16a34a" />
          <rect x="4" y="4" width="38" height="26" fill="#dcfce7" />
          <line x1="23" y1="4" x2="23" y2="30" stroke="#16a34a" strokeWidth="2" />
        </g>
      );
    case 'wand':
      return (
        <g>
          <line x1="164" y1="200" x2="194" y2="150" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <text x="180" y="150" fontSize="28" fill="#facc15">★</text>
        </g>
      );
    case 'medal':
      return (
        <g>
          <path d="M86 150 L100 178 L114 150" fill="none" stroke="#3b82f6" strokeWidth="6" />
          <circle cx="100" cy="186" r="14" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
          <text x="94" y="192" fontSize="14" fill="#92400e">1</text>
        </g>
      );
  }
  return null;
}

export function Owl({ equipped, size = 180, mood = 'happy', withBackground = false, stage }: Props) {
  const { state } = useGame();
  const st = stage ?? owlStage(state.totalCorrect);
  const colorVal = itemById(equipped.color)?.value ?? '#a78bfa';
  const rainbow = colorVal === 'rainbow';
  const body = rainbow ? 'url(#rainbow)' : colorVal;
  const hat = itemById(equipped.hat)?.value;
  const glasses = itemById(equipped.glasses)?.value;
  const acc = itemById(equipped.accessory)?.value;
  const bg = itemById(equipped.background)?.value;

  const svg = (
    <svg width={size} height={size} viewBox="-10 -14 220 230" className="owl">
      <defs>
        <linearGradient id="rainbow" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f87171" />
          <stop offset="0.25" stopColor="#fbbf24" />
          <stop offset="0.5" stopColor="#4ade80" />
          <stop offset="0.75" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      {st >= 4 && (
        <g className="aura">
          <circle cx="100" cy="115" r="104" fill="#fde68a" opacity="0.45" />
          <text x="8" y="40" fontSize="22">✨</text>
          <text x="172" y="60" fontSize="18">⭐</text>
          <text x="176" y="190" fontSize="20">✨</text>
        </g>
      )}
      {st === 0 ? (
        <g fill={body}>
          <ellipse cx="92" cy="40" rx="5" ry="14" transform="rotate(-20 92 40)" />
          <ellipse cx="100" cy="36" rx="5" ry="15" />
          <ellipse cx="108" cy="40" rx="5" ry="14" transform="rotate(20 108 40)" />
        </g>
      ) : (
        <>
          <polygon points={st === 1 ? '56,62 60,40 80,54' : st >= 3 ? '42,62 50,12 82,52' : '46,62 54,20 82,52'} fill={body} />
          <polygon points={st === 1 ? '144,62 140,40 120,54' : st >= 3 ? '158,62 150,12 118,52' : '154,62 146,20 118,52'} fill={body} />
        </>
      )}
      <ellipse cx="100" cy="120" rx={st === 0 ? 66 : 72} ry={st === 0 ? 76 : 84} fill={body} />
      {st === 0 && (
        <g fill="#fff" opacity="0.35">
          <circle cx="60" cy="150" r="8" />
          <circle cx="140" cy="150" r="8" />
          <circle cx="100" cy="185" r="7" />
        </g>
      )}
      <ellipse cx="38" cy="130" rx="16" ry="42" fill={body} style={{ filter: 'brightness(0.85)' }} />
      <ellipse cx="162" cy="130" rx="16" ry="42" fill={body} style={{ filter: 'brightness(0.85)' }} />
      <ellipse cx="100" cy="146" rx="46" ry="52" fill="#fff" opacity="0.75" />
      <circle cx="72" cy="96" r="24" fill="#fff" />
      <circle cx="128" cy="96" r="24" fill="#fff" />
      {mood === 'sad' ? (
        <>
          <path d="M60 100 Q72 90 84 100" stroke="#1e1b4b" strokeWidth="5" fill="none" />
          <path d="M116 100 Q128 90 140 100" stroke="#1e1b4b" strokeWidth="5" fill="none" />
        </>
      ) : (
        <>
          <circle cx="74" cy="98" r={mood === 'wow' ? 14 : 11} fill="#1e1b4b" />
          <circle cx="126" cy="98" r={mood === 'wow' ? 14 : 11} fill="#1e1b4b" />
          <circle cx="78" cy="94" r="4" fill="#fff" />
          <circle cx="130" cy="94" r="4" fill="#fff" />
        </>
      )}
      <polygon points="90,118 110,118 100,134" fill="#f59e0b" />
      <ellipse cx="78" cy="206" rx="14" ry="6" fill="#f59e0b" />
      <ellipse cx="122" cy="206" rx="14" ry="6" fill="#f59e0b" />
      {st >= 3 && (
        <g stroke="#1e1b4b" strokeWidth="4" strokeLinecap="round">
          <line x1="56" y1="68" x2="82" y2="74" />
          <line x1="144" y1="68" x2="118" y2="74" />
        </g>
      )}
      {acc && <Accessory v={acc} />}
      {glasses && <Glasses v={glasses} />}
      {hat && <Hat v={hat} />}
    </svg>
  );

  if (!withBackground) return svg;
  return (
    <div className="owl-bg" style={{ background: bg }}>
      {svg}
    </div>
  );
}
