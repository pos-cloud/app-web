/**
 * Lógica de calendario sin dependencias de Angular — facilita tests y reutilización.
 */

import { Appointment } from '@types';

import { argentinaCalendarDayKey } from './components/appointment-form-modal/appointment-argentina-datetime';

/** Reexport para que el componente del calendario use la misma TZ que el formulario. */
export { argentinaCalendarDayKey };

export type CalendarViewMode = 'month' | 'week';

export interface MonthCell {
  day: number | null;
  date: Date | null;
}

export interface WeekDayHeader {
  date: Date;
  weekdayShort: string;
  dayNum: number;
  isToday: boolean;
}

export interface HourSlot {
  hour: number;
  label: string;
}

/** Posición horizontal en vista semana cuando hay solapes (columnas paralelas). */
export interface WeekEventLayout {
  appointment: Appointment;
  column: number;
  columnCount: number;
}

/** Primera hora mostrada en vista semana (inclusive). */
export const WEEK_VIEW_START_HOUR = 7;
/** Hora fin exclusiva (ej. 22 → último slot 21:00–22:00). */
export const WEEK_VIEW_END_HOUR = 22;

export function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Día civil Argentina del inicio del turno (misma TZ que el formulario y el guardado).
 * Vista mes y semana usan la misma clave para no “perder” eventos entre vistas.
 */
export function appointmentLocalDayKey(a: { startDate: string; allDay?: boolean }): string {
  return argentinaCalendarDayKey(a.startDate);
}

export function appointmentMonthGridDayKey(a: { startDate: string; allDay?: boolean }): string {
  return argentinaCalendarDayKey(a.startDate);
}

/** Lunes 00:00 local de la semana que contiene `d`. */
export function startOfWeekMonday(d: Date): Date {
  const x = stripTime(d);
  const offsetMon = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - offsetMon);
  return x;
}

/** Domingo 00:00 local de la semana que contiene `d` (vista semana). */
export function startOfWeekSunday(d: Date): Date {
  const x = stripTime(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function firstOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function buildMonthGrid(year: number, month: number): MonthCell[][] {
  const first = new Date(year, month, 1);
  /** Filas dom → sáb: huecos antes del día 1 = día de la semana del primero (0 = domingo). */
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: MonthCell[] = [];
  for (let i = 0; i < startPad; i++) {
    cells.push({ day: null, date: null });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, date: new Date(year, month, day) });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, date: null });
  }

  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function buildWeekDayHeaders(weekStart: Date, today: Date): WeekDayHeader[] {
  const t = stripTime(today).getTime();
  const weekdayFmt = new Intl.DateTimeFormat('es-AR', { weekday: 'short' });
  const headers: WeekDayHeader[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    headers.push({
      date,
      weekdayShort: capitalize(weekdayFmt.format(date)),
      dayNum: date.getDate(),
      isToday: stripTime(date).getTime() === t,
    });
  }
  return headers;
}

export function createHourSlots(startHour: number, endHour: number): HourSlot[] {
  const slots: HourSlot[] = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push({
      hour: h,
      label: `${String(h).padStart(2, '0')}:00`,
    });
  }
  return slots;
}

export function formatMonthTitle(year: number, month: number): string {
  let label = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1)
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Rango [from, to] en ISO para la API: límites del período según el **calendario** que arma la vista
 * (año/mes/día locales al navegador para la grilla), pero con offset **Argentina** fijo (-03:00).
 * Así el solape `startDate`/`endDate` coincide con cómo se guardan los turnos (`toISOString` en UTC)
 * aunque el SO esté en UTC u otra zona.
 */
function localDayRangeToISO(fromLocalMidnight: Date, toLocalEndOfDay: Date): { from: string; to: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  /** Argentina no usa DST desde 2009; alineado con `appointment-argentina-datetime`. */
  const AR_OFFSET = '-03:00';
  const fmt = (d: Date, endOfDay: boolean) => {
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    if (endOfDay) {
      return `${y}-${m}-${day}T23:59:59.999${AR_OFFSET}`;
    }
    return `${y}-${m}-${day}T00:00:00.000${AR_OFFSET}`;
  };
  return {
    from: fmt(fromLocalMidnight, false),
    to: fmt(toLocalEndOfDay, true),
  };
}

/** Rango para consultar API v2 en vista mes (mes calendario local). */
export function getMonthRangeISO(viewAnchor: Date): { from: string; to: string } {
  const y = viewAnchor.getFullYear();
  const m = viewAnchor.getMonth();
  const from = new Date(y, m, 1, 0, 0, 0, 0);
  const lastDayOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return localDayRangeToISO(from, lastDayOfMonth);
}

/** Rango para la semana de 7 días desde `weekStart` (p. ej. domingo 00:00 local). */
export function getWeekRangeISO(weekStart: Date): { from: string; to: string } {
  const from = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate(),
    0,
    0,
    0,
    0
  );
  const lastMorning = addDays(from, 6);
  const lastDayEnd = new Date(
    lastMorning.getFullYear(),
    lastMorning.getMonth(),
    lastMorning.getDate(),
    23,
    59,
    59,
    999
  );
  return localDayRangeToISO(from, lastDayEnd);
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const y1 = weekStart.getFullYear();
  const y2 = end.getFullYear();
  const dOpt: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const f = new Intl.DateTimeFormat('es-AR', dOpt);
  const startStr = capitalize(f.format(weekStart));
  const endStr = capitalize(f.format(end));
  if (y1 === y2) {
    return `${startStr} – ${endStr} ${y1}`;
  }
  return `${startStr} ${y1} – ${endStr} ${y2}`;
}

function capitalize(s: string): string {
  if (!s.length) {
    return s;
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function appointmentEventKey(apt: Appointment): string {
  return String(apt._id ?? `${apt.startDate}|${apt.endDate}`);
}

function intervalsOverlap(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Rango en ms para solapes: todo el día civil local del `dayDate` o start/end reales. */
function rangeMsForOverlap(apt: Appointment, dayDate: Date): { start: number; end: number } {
  if (apt.allDay) {
    const s = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0, 0);
    const e = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59, 999);
    return { start: s.getTime(), end: e.getTime() };
  }
  return { start: new Date(apt.startDate).getTime(), end: new Date(apt.endDate).getTime() };
}

interface RangeItem {
  apt: Appointment;
  start: number;
  end: number;
}

/**
 * Reparte turnos solapados en columnas (componentes conexos + greedy por grupo).
 */
export function computeWeekEventLayoutsForDay(appointments: Appointment[], dayDate: Date): WeekEventLayout[] {
  const dayKey = argentinaCalendarDayKey(dayDate);
  const dayApps = appointments.filter((a) => appointmentLocalDayKey(a) === dayKey);
  if (dayApps.length === 0) {
    return [];
  }

  const ranges: RangeItem[] = dayApps.map((apt) => ({
    apt,
    ...rangeMsForOverlap(apt, dayDate),
  }));

  const n = ranges.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => {
    let x = i;
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) {
      parent[ra] = rb;
    }
  };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (intervalsOverlap(ranges[i], ranges[j])) {
        union(i, j);
      }
    }
  }

  const groupIndices = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    if (!groupIndices.has(r)) {
      groupIndices.set(r, []);
    }
    groupIndices.get(r)!.push(i);
  }

  const colByKey = new Map<string, { column: number; columnCount: number }>();

  for (const indices of groupIndices.values()) {
    const group = indices.map((i) => ranges[i]);
    group.sort((a, b) => a.start - b.start);

    const columns: RangeItem[][] = [];
    for (const ev of group) {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        const conflict = columns[c].some((x) => intervalsOverlap(ev, x));
        if (!conflict) {
          columns[c].push(ev);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([ev]);
      }
    }

    const columnCount = Math.max(1, columns.length);
    for (let c = 0; c < columns.length; c++) {
      for (const ev of columns[c]) {
        colByKey.set(appointmentEventKey(ev.apt), { column: c, columnCount });
      }
    }
  }

  return dayApps.map((apt) => {
    const meta = colByKey.get(appointmentEventKey(apt));
    return {
      appointment: apt,
      column: meta?.column ?? 0,
      columnCount: meta?.columnCount ?? 1,
    };
  });
}
