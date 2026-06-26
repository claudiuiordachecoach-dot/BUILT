// BUILT — Jurnal de Forță: tipuri + logică de grupare (partajat client ⇄ coach).
// Fără "use server" aici ca să putem exporta și funcții/constante sincrone.

export interface StrengthPoint {
  date: string;
  weight: number;
  reps: number | null;
}

export interface StrengthExercise {
  name: string;
  last: { weight: number; reps: number | null; date: string };
  best: number; // greutatea maximă logată vreodată
  start: number; // prima greutate logată
  deltaFromStart: number; // best − start
  points: StrengthPoint[]; // istoric cronologic, pentru grafic
  sessions: number;
}

export interface StrengthLogEntry {
  id: string;
  exercise: string;
  weight: number;
  reps: number | null;
  sets: number | null;
  date: string;
  note: string | null;
}

// Exercițiile compuse BUILT — Base Strength. Sugestiile implicite din log.
export const COMPOUND_LIFTS = [
  "Genuflexiuni",
  "Împins la piept",
  "Îndreptări",
  "Tracțiuni",
  "Ramat",
  "Împins deasupra capului",
];

type Row = {
  id: string;
  exercise: string;
  weight: number | string;
  reps: number | null;
  sets: number | null;
  logged_on: string;
  note: string | null;
};

/** Grupează rândurile brute (sortate cronologic crescător) pe exercițiu. */
export function shapeExercises(rows: Row[]): StrengthExercise[] {
  const byEx = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r.exercise;
    if (!byEx.has(k)) byEx.set(k, []);
    byEx.get(k)!.push(r);
  }
  return [...byEx.entries()]
    .map(([name, list]) => {
      const points: StrengthPoint[] = list.map((r) => ({
        date: r.logged_on,
        weight: Number(r.weight) || 0,
        reps: r.reps ?? null,
      }));
      const best = points.reduce((m, p) => Math.max(m, p.weight), 0);
      const start = points[0]?.weight ?? 0;
      const lastRow = list[list.length - 1];
      return {
        name,
        last: { weight: Number(lastRow.weight) || 0, reps: lastRow.reps ?? null, date: lastRow.logged_on },
        best,
        start,
        deltaFromStart: best - start,
        points,
        sessions: list.length,
      };
    })
    .sort((a, b) => b.last.date.localeCompare(a.last.date));
}

export function shapeRecent(rows: Row[], limit = 15): StrengthLogEntry[] {
  return rows
    .slice()
    .reverse()
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      exercise: r.exercise,
      weight: Number(r.weight) || 0,
      reps: r.reps ?? null,
      sets: r.sets ?? null,
      date: r.logged_on,
      note: r.note ?? null,
    }));
}
