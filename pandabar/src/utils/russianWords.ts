/**
 * Russian number-to-words currency generator and 1C formatting helpers
 */

const ONES_MASCULINE = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const ONES_FEMININE = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const TEENS = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
const TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
const HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

function getPluralForm(n: number, one: string, two: string, five: string): string {
  const absN = Math.abs(n) % 100;
  const rem = absN % 10;
  if (absN > 10 && absN < 20) return five;
  if (rem > 1 && rem < 5) return two;
  if (rem === 1) return one;
  return five;
}

function tripletToWords(num: number, isFemale = false): string {
  if (num === 0) return '';
  const parts: string[] = [];

  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const o = num % 10;

  if (h > 0) parts.push(HUNDREDS[h]);

  if (t === 1) {
    parts.push(TEENS[o]);
  } else {
    if (t > 1) parts.push(TENS[t]);
    if (o > 0) {
      parts.push(isFemale ? ONES_FEMININE[o] : ONES_MASCULINE[o]);
    }
  }

  return parts.filter(Boolean).join(' ');
}

export function rublesToWords(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Ноль рублей 00 копеек';

  const integerPart = Math.floor(Math.abs(amount));
  const kopecksPart = Math.round((Math.abs(amount) - integerPart) * 100);

  if (integerPart === 0) {
    const kopecksStr = kopecksPart.toString().padStart(2, '0');
    return `Ноль рублей ${kopecksStr} ${getPluralForm(kopecksPart, 'копейка', 'копейки', 'копеек')}`;
  }

  const millions = Math.floor(integerPart / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1_000);
  const units = integerPart % 1_000;

  const parts: string[] = [];

  if (millions > 0) {
    parts.push(tripletToWords(millions, false));
    parts.push(getPluralForm(millions, 'миллион', 'миллиона', 'миллионов'));
  }

  if (thousands > 0) {
    parts.push(tripletToWords(thousands, true));
    parts.push(getPluralForm(thousands, 'тысяча', 'тысячи', 'тысяч'));
  }

  if (units > 0) {
    parts.push(tripletToWords(units, false));
  }

  parts.push(getPluralForm(units, 'рубль', 'рубля', 'рублей'));

  const rublesText = parts.filter(Boolean).join(' ');
  const capitalized = rublesText.charAt(0).toUpperCase() + rublesText.slice(1);
  const kopecksStr = kopecksPart.toString().padStart(2, '0');

  return `${capitalized} ${kopecksStr} ${getPluralForm(kopecksPart, 'копейка', 'копейки', 'копеек')}`;
}

export function formatOrder1CNumber(orderId: string, createdAt: number): string {
  const d = new Date(createdAt || Date.now());
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  
  // Extract number from id or hash
  let seq = '00001';
  if (orderId) {
    const digits = orderId.replace(/\D/g, '');
    if (digits.length >= 3) {
      seq = digits.slice(-5).padStart(5, '0');
    } else {
      let hash = 0;
      for (let i = 0; i < orderId.length; i++) {
        hash = (hash * 31 + orderId.charCodeAt(i)) % 99999;
      }
      seq = Math.max(1, hash).toString().padStart(5, '0');
    }
  }

  return `${day}${month}-${seq}`;
}
