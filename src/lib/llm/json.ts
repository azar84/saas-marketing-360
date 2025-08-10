export function extractJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {}
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const slice = text.slice(start, end + 1);
    try { return JSON.parse(slice); } catch {}
  }
  const aStart = text.indexOf('[');
  const aEnd = text.lastIndexOf(']');
  if (aStart >= 0 && aEnd > aStart) {
    const slice = text.slice(aStart, aEnd + 1);
    try { return JSON.parse(slice); } catch {}
  }
  throw new Error('Model did not return valid JSON');
}

export function normalizeList(val: any, max: number): string[] {
  if (!Array.isArray(val)) return [];
  const dedup = new Set<string>();
  for (const v of val) {
    const s = (v ?? '').toString().trim().toLowerCase();
    if (s) dedup.add(s);
    if (dedup.size >= max) break;
  }
  return Array.from(dedup);
}


