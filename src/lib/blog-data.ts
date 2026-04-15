import { DIGITAL_PRESENT_PROJECTS, type ProjectSlide } from "@/data/digital-present-projects";

export type PortfolioSortMode = "default" | "title" | "client";

/**
 * Mescubook `applySort` eşleniği — yerel sıralama modları.
 */
export function applyPortfolioSort(
  items: readonly ProjectSlide[],
  mode: PortfolioSortMode
): ProjectSlide[] {
  const copy = items.slice();
  if (mode === "title") {
    copy.sort((a, b) => a.title.localeCompare(b.title));
  } else if (mode === "client") {
    copy.sort((a, b) => a.clientCode.localeCompare(b.clientCode));
  }
  return copy;
}

/**
 * Build-time: opsiyonel JSON uç noktasından proje `id` sırası (ör. sheet → publish URL).
 * `PORTFOLIO_SHEET_JSON_URL` örnek gövde: `["01","05","02","03","04"]`
 */
export async function fetchPortfolioIdOrderFromSheet(): Promise<string[] | null> {
  const url = process.env.PORTFOLIO_SHEET_JSON_URL?.trim();
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data)) return null;
    const ids = data.filter((x): x is string => typeof x === "string");
    return ids.length ? ids : null;
  } catch {
    return null;
  }
}

/**
 * Sunucu / build: sheet sırası + yerel `applyPortfolioSort`.
 */
export async function getSortedPortfolioProjects(
  mode: PortfolioSortMode = "default"
): Promise<ProjectSlide[]> {
  const sheetOrder = await fetchPortfolioIdOrderFromSheet();
  const base = DIGITAL_PRESENT_PROJECTS.slice();
  let merged: ProjectSlide[];

  if (sheetOrder?.length) {
    const byId = new Map(base.map((p) => [p.id, p]));
    merged = [];
    for (const id of sheetOrder) {
      const p = byId.get(id);
      if (p) {
        merged.push(p);
        byId.delete(id);
      }
    }
    for (const p of base) {
      if (byId.has(p.id)) merged.push(p);
    }
  } else {
    merged = base;
  }

  return applyPortfolioSort(merged, mode);
}
