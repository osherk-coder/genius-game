/**
 * Read text aloud in Hebrew using the device's built-in voices (Web Speech API).
 * iPad/iPhone include a Hebrew voice; on Android it comes with Google's speech engine.
 */
let hebrewVoice: SpeechSynthesisVoice | null | undefined;

function findVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang?.toLowerCase().startsWith('he') || v.lang?.toLowerCase().startsWith('iw')) ?? null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    hebrewVoice = findVoice();
  };
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** True when the device has a Hebrew voice installed (checked after voices load). */
export function hasHebrewVoice(): boolean {
  if (hebrewVoice === undefined) hebrewVoice = findVoice();
  return !!hebrewVoice;
}

/** Turn symbols into words so the voice reads math naturally. */
function forSpeech(text: string): string {
  return text
    .replace(/_{2,}/g, ' משהו ')
    .replace(/🙂/g, ' חייכן ')
    .replace(/×/g, ' כפול ')
    .replace(/:/g, ' חלקי ')
    .replace(/−/g, ' פחות ')
    .replace(/\+/g, ' ועוד ')
    .replace(/=/g, ' שווה ')
    .replace(/</g, ' קטן מ ')
    .replace(/>/g, ' גדול מ ')
    .replace(/←/g, ' ')
    .replace(/[^\p{L}\p{N}\s.,?!'"%\-]/gu, ' ');
}

export function speak(text: string) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(forSpeech(text));
  u.lang = 'he-IL';
  if (hasHebrewVoice()) u.voice = hebrewVoice!;
  u.rate = 0.9;
  synth.speak(u);
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
