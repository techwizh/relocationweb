const PHONE_PATTERNS = [
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3}[\s.-]?\d{3,4}/g,
  /\b0[17]\d[\s.-]?\d{3}[\s.-]?\d{3,4}\b/g,
  /\b\+254[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{3,4}\b/gi,
  /\b\d{3}[\s.-]\d{3}[\s.-]\d{3,4}\b/g,
  /\b(?:phone|call|whatsapp|wa\.me|reach me|contact me at)\b/gi,
];

const NUMBER_WORDS: Record<string, string> = {
  zero: "0",
  oh: "0",
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
};

const NUMBER_WORD_PATTERN =
  /^(zero|oh|one|two|three|four|five|six|seven|eight|nine)$/i;

export const PHONE_BLOCKED_MESSAGE =
  "Phone numbers and off-platform contact details are not allowed. Use this chat only.";

export const DIGIT_FRAGMENT_MESSAGE =
  "Sending numbers one at a time is not allowed. Describe your message in words without phone numbers.";

export function containsContactInfo(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;

  return PHONE_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(normalized);
  });
}

export function extractDigitFragment(text: string): string | null {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  if (NUMBER_WORD_PATTERN.test(trimmed)) {
    return NUMBER_WORDS[trimmed.toLowerCase()];
  }

  return null;
}

function isSpacedDigitSequence(text: string): boolean {
  const trimmed = text.trim().toLowerCase();
  const spacedDigits = trimmed.match(/^(\d\s+){2,}\d$/);
  if (spacedDigits) return true;

  const words = trimmed.split(/\s+/);
  if (words.length >= 3 && words.every((word) => NUMBER_WORD_PATTERN.test(word))) {
    return true;
  }

  return false;
}

export function validateChatMessage(text: string): {
  ok: boolean;
  error?: string;
} {
  const trimmed = text.trim();

  if (!trimmed) {
    return { ok: false, error: "Message cannot be empty." };
  }

  if (containsContactInfo(trimmed)) {
    return { ok: false, error: PHONE_BLOCKED_MESSAGE };
  }

  if (isSpacedDigitSequence(trimmed)) {
    return { ok: false, error: DIGIT_FRAGMENT_MESSAGE };
  }

  const currentFragment = extractDigitFragment(trimmed);
  if (currentFragment !== null) {
    return { ok: false, error: DIGIT_FRAGMENT_MESSAGE };
  }

  return { ok: true };
}
