// Tabla de clasificación del ECO RETO, guardada solo en este navegador (localStorage).

export interface ScoreEntry { id: string; name: string; score: number; max: number; ms: number; ts: number }

const KEY = 'biodigestion.leaderboard.v1';
const KEEP = 50;
export const NAME_MAX = 20;

export function loadScores(): ScoreEntry[] {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(data)) return [];
    return data.filter((e): e is ScoreEntry =>
      e && typeof e.id === 'string' && typeof e.name === 'string' && Number.isFinite(e.score) &&
      Number.isFinite(e.max) && Number.isFinite(e.ms) && Number.isFinite(e.ts))
      .map((e) => ({ ...e, name: e.name.slice(0, NAME_MAX) }))
      .sort(compare);
  } catch {
    return [];
  }
}

/** Más puntos primero; a igual puntaje, quien terminó más rápido. */
function compare(a: ScoreEntry, b: ScoreEntry): number {
  return b.score - a.score || a.ms - b.ms || a.ts - b.ts;
}

/** Guarda el resultado y devuelve la tabla ordenada (o null si no se pudo guardar). */
export function addScore(entry: Omit<ScoreEntry, 'id' | 'ts'>): { list: ScoreEntry[]; id: string } | null {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const list = [...loadScores(), { ...entry, id, ts: Date.now() }].sort(compare).slice(0, KEEP);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return { list, id };
  } catch {
    return null;
  }
}

export function clearScores(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignorar */ }
}

export const cleanName = (s: string) =>
  s.replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);

export const formatTime = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
};
