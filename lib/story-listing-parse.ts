export function parseKeywordsJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr)
      ? arr.filter((k): k is string => typeof k === "string")
      : [];
  } catch {
    return raw.split(",").map((k) => k.trim()).filter(Boolean);
  }
}

export function parseCategoriesJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr)
      ? arr.filter((c): c is string => typeof c === "string")
      : [];
  } catch {
    return [raw.trim()];
  }
}
