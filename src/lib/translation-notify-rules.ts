export function strTrim(s: unknown): string {
  if (s == null) return '';
  return String(s).trim();
}

export function tradVerIndicatesIntegrated(tversion: unknown, tname: unknown): boolean {
  if (tname === 'integrated') return true;
  const tv = strTrim(tversion)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  return tv === 'integree';
}
