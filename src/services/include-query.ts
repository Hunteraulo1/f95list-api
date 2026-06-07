/** Valeurs reconnues pour `?include=` (liste séparée par des virgules, insensible à la casse). */
export function parseInclude(searchParams: URLSearchParams): Set<string> {
  const raw = searchParams.get('include');
  const set = new Set<string>();
  if (!raw?.trim()) return set;
  for (const part of raw.split(',')) {
    const t = part.trim().toLowerCase();
    if (t) set.add(t);
  }
  return set;
}

export function searchParamsFromQuery(query: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) params.append(key, String(item));
      }
    } else {
      params.set(key, String(value));
    }
  }
  return params;
}
