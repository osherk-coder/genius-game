export type Slot = 'color' | 'hat' | 'glasses' | 'accessory' | 'background';

export interface ShopItem {
  id: string;
  slot: Slot;
  name: string;
  price: number;
  /** Visual value: a color for 'color', a gradient for 'background', or an item key. */
  value: string;
}

export const SLOT_NAMES: Record<Slot, string> = {
  color: 'צבע',
  hat: 'כובעים',
  glasses: 'משקפיים',
  accessory: 'אביזרים',
  background: 'רקעים',
};

export const SHOP: ShopItem[] = [
  { id: 'c-purple', slot: 'color', name: 'סגול', price: 0, value: '#a78bfa' },
  { id: 'c-pink', slot: 'color', name: 'ורוד', price: 60, value: '#f9a8d4' },
  { id: 'c-blue', slot: 'color', name: 'תכלת', price: 60, value: '#7dd3fc' },
  { id: 'c-mint', slot: 'color', name: 'מנטה', price: 60, value: '#6ee7b7' },
  { id: 'c-gold', slot: 'color', name: 'זהב', price: 250, value: '#fcd34d' },
  { id: 'c-rainbow', slot: 'color', name: 'קשת', price: 500, value: 'rainbow' },

  { id: 'h-grad', slot: 'hat', name: 'כובע סיום', price: 0, value: 'grad' },
  { id: 'h-crown', slot: 'hat', name: 'כתר', price: 300, value: 'crown' },
  { id: 'h-wizard', slot: 'hat', name: 'כובע קוסם', price: 200, value: 'wizard' },
  { id: 'h-flower', slot: 'hat', name: 'פרח', price: 80, value: 'flower' },
  { id: 'h-bow', slot: 'hat', name: 'סרט', price: 80, value: 'bow' },
  { id: 'h-party', slot: 'hat', name: 'כובע מסיבה', price: 120, value: 'party' },
  { id: 'h-phones', slot: 'hat', name: 'אוזניות', price: 150, value: 'phones' },

  { id: 'g-round', slot: 'glasses', name: 'משקפיים עגולים', price: 70, value: 'round' },
  { id: 'g-sun', slot: 'glasses', name: 'משקפי שמש', price: 120, value: 'sun' },
  { id: 'g-star', slot: 'glasses', name: 'משקפי כוכבים', price: 180, value: 'star' },
  { id: 'g-heart', slot: 'glasses', name: 'משקפי לבבות', price: 180, value: 'heart' },

  { id: 'a-scarf', slot: 'accessory', name: 'צעיף', price: 90, value: 'scarf' },
  { id: 'a-bowtie', slot: 'accessory', name: 'עניבת פרפר', price: 90, value: 'bowtie' },
  { id: 'a-book', slot: 'accessory', name: 'ספר', price: 140, value: 'book' },
  { id: 'a-wand', slot: 'accessory', name: 'שרביט קסמים', price: 220, value: 'wand' },
  { id: 'a-medal', slot: 'accessory', name: 'מדליה', price: 350, value: 'medal' },

  { id: 'b-sky', slot: 'background', name: 'שמיים', price: 0, value: 'linear-gradient(160deg,#bae6fd,#e0f2fe)' },
  { id: 'b-sunset', slot: 'background', name: 'שקיעה', price: 100, value: 'linear-gradient(160deg,#fb923c,#f472b6)' },
  { id: 'b-forest', slot: 'background', name: 'יער', price: 100, value: 'linear-gradient(160deg,#4ade80,#166534)' },
  { id: 'b-sea', slot: 'background', name: 'ים', price: 100, value: 'linear-gradient(160deg,#22d3ee,#1e3a8a)' },
  { id: 'b-space', slot: 'background', name: 'חלל', price: 250, value: 'radial-gradient(circle at 30% 30%,#6d28d9,#0f172a 70%)' },
  { id: 'b-candy', slot: 'background', name: 'ממתקים', price: 200, value: 'repeating-linear-gradient(45deg,#fbcfe8 0 20px,#fef3c7 20px 40px)' },
];

export const itemById = (id: string | null | undefined) => SHOP.find((i) => i.id === id);
