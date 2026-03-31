/**
 * Zona horaria de negocio para turnos (Argentina; sin horario de verano desde 2009).
 * Se usa para interpretar y mostrar los campos datetime-local con criterio único,
 * independiente de la zona del navegador.
 */
export const APPOINTMENT_BUSINESS_TIMEZONE = 'America/Argentina/Buenos_Aires';

/** Offset fijo respecto a UTC para Argentina (horario estándar). */
const ARG_UTC_OFFSET_HOURS = 3;

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Instantáneo UTC correspondiente a una fecha/hora civil en Argentina (UTC−3).
 */
export function argentinaWallTimeToUtc(
  year: number,
  month1: number,
  day: number,
  hour: number,
  minute: number
): Date {
  return new Date(Date.UTC(year, month1 - 1, day, hour + ARG_UTC_OFFSET_HOURS, minute, 0, 0));
}

/**
 * Valor para `<input type="datetime-local">`: componentes en hora Argentina.
 */
export function toArgentinaDatetimeLocal(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APPOINTMENT_BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const y = parts.find((p) => p.type === 'year')?.value;
  const mo = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  const hour = parts.find((p) => p.type === 'hour')?.value;
  const minute = parts.find((p) => p.type === 'minute')?.value;

  if (!y || !mo || !day || hour === undefined || minute === undefined) {
    return '';
  }

  return `${y}-${mo}-${day}T${pad2(Number(hour))}:${pad2(Number(minute))}`;
}

/** Acepta `YYYY-MM-DDTHH:mm` o `YYYY-MM-DDTHH:mm:ss` (algunos navegadores agregan segundos). */
const DATETIME_LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/;

function isValidCalendar(y: number, mo: number, d: number, h: number, mi: number): boolean {
  if (mo < 1 || mo > 12 || h > 23 || mi > 59) {
    return false;
  }
  const test = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0, 0));
  return test.getUTCFullYear() === y && test.getUTCMonth() === mo - 1 && test.getUTCDate() === d;
}

/**
 * Interpreta el string del datetime-local como hora civil en Argentina (no la del navegador).
 */
export function fromArgentinaDatetimeLocal(s: string): Date | null {
  const m = DATETIME_LOCAL_RE.exec(s.trim());
  if (!m) {
    return null;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const h = Number(m[4]);
  const mi = Number(m[5]);
  if (!isValidCalendar(y, mo, d, h, mi)) {
    return null;
  }
  return argentinaWallTimeToUtc(y, mo, d, h, mi);
}

/**
 * Mismo instante que `toISOString()`, pero en ISO con offset Argentina (`-03:00`).
 * MongoDB/Mongoose siguen guardando un BSON Date (instante); en DevTools se ve la intención local.
 */
export function formatInstantAsArgentinaOffsetIso(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APPOINTMENT_BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const y = parts.find((p) => p.type === 'year')?.value;
  const mo = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  const hour = parts.find((p) => p.type === 'hour')?.value;
  const minute = parts.find((p) => p.type === 'minute')?.value;
  const second = parts.find((p) => p.type === 'second')?.value;
  if (!y || !mo || !day || hour === undefined || minute === undefined) {
    return d.toISOString();
  }
  const sec = second !== undefined ? pad2(Number(second)) : '00';
  return `${y}-${mo}-${day}T${pad2(Number(hour))}:${pad2(Number(minute))}:${sec}.000-03:00`;
}

/**
 * Rango 00:00–23:59 del día indicado en el prefijo `YYYY-MM-DD` del input (hora Argentina).
 */
/**
 * Clave `YYYY-MM-DD` del día civil en Argentina para un instante (misma regla que el formulario).
 * Usar en calendario para alinear celdas y turnos sin depender de la zona del navegador.
 */
export function argentinaCalendarDayKey(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APPOINTMENT_BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const y = parts.find((p) => p.type === 'year')?.value;
  const mo = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  if (!y || !mo || !day) {
    return '';
  }
  return `${y}-${mo}-${day}`;
}

export function argentinaAllDayRangeFromStartInput(startLocal: string): { start: Date; end: Date } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T/.exec(startLocal.trim());
  if (!m) {
    return null;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!isValidCalendar(y, mo, d, 0, 0)) {
    return null;
  }
  return {
    start: argentinaWallTimeToUtc(y, mo, d, 0, 0),
    end: argentinaWallTimeToUtc(y, mo, d, 23, 59),
  };
}
