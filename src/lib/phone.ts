export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  if (digits.startsWith("254") && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+254${digits.slice(1)}`;
  }

  if (digits.length === 9 && /^[17]/.test(digits)) {
    return `+254${digits}`;
  }

  return null;
}

export function isValidKenyanPhone(input: string): boolean {
  return normalizeKenyanPhone(input) !== null;
}
