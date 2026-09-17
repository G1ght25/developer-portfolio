/**
 * Formats a raw input string into a standard Russian telephone format: +7 (XXX) XXX-XX-XX
 */
export function formatPhone(inputVal: string): string {
  // Strip all non-numeric characters
  const raw = inputVal.replace(/\D/g, '');
  
  if (!raw) return '';
  
  let result = '+7';
  
  // If the user starts typing with 8 or 7, we strip it out as the country code
  let digits = raw;
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1);
  }
  
  // Slice to max 10 digits
  digits = digits.slice(0, 10);
  
  if (digits.length > 0) {
    result += ` (${digits.slice(0, 3)}`;
  }
  if (digits.length >= 3) {
    result += `) ${digits.slice(3, 6)}`;
  }
  if (digits.length >= 6) {
    result += `-${digits.slice(6, 8)}`;
  }
  if (digits.length >= 8) {
    result += `-${digits.slice(8, 10)}`;
  }
  
  return result;
}
