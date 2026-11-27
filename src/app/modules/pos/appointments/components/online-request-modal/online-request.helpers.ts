import { Appointment, AppointmentPeriod } from '@types';

import {
  argentinaWallTimeToUtc,
  toArgentinaDatetimeLocal,
} from '../appointment-form-modal/appointment-argentina-datetime';

/** Sitio público donde el cliente pide turno y ve el turno confirmado. */
export const APPOINTMENTS_SITE = 'https://appointments.poscloud.ar';

export const PERIOD_LABELS: Record<AppointmentPeriod, string> = {
  morning: 'Mañana',
  afternoon: 'Tarde',
  night: 'Noche',
};

export const DURATIONS = [15, 30, 45, 60, 90, 120];

/** Fecha (YYYY-MM-DD) y hora (HH:mm) en Argentina de un instante ISO. */
export function argentinaParts(iso: string): { day: string; time: string } {
  const local = toArgentinaDatetimeLocal(new Date(iso));
  return { day: local.slice(0, 10), time: local.slice(11, 16) };
}

/** Inicio y fin del turno confirmado, a partir del día pedido y la hora elegida en Argentina. */
export function confirmedRange(
  day: string,
  time: string,
  minutes: number
): { startDate: string; endDate: string } | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t || !(minutes > 0)) return null;
  const start = argentinaWallTimeToUtc(+d[1], +d[2], +d[3], +t[1], +t[2]);
  const end = new Date(start.getTime() + minutes * 60_000);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

/** "viernes 27 de noviembre" en Argentina. */
export function longDay(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
    .format(new Date(iso))
    .replace(',', '');
}

export function publicAppointmentUrl(database: string, token: string): string {
  return `${APPOINTMENTS_SITE}/${encodeURIComponent(database)}/turno/${token}`;
}

export function bookingUrl(database: string): string {
  return `${APPOINTMENTS_SITE}/${encodeURIComponent(database)}`;
}

export function whatsappUrl(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

function firstName(appointment: Appointment): string {
  return (appointment.customerName || '').trim().split(/\s+/)[0] || '';
}

export function confirmationMessage(appointment: Appointment, startDate: string, link: string): string {
  const name = firstName(appointment);
  return [
    `¡Hola${name ? ` ${name}` : ''}! Tu turno quedó confirmado ✅`,
    '',
    `📅 ${longDay(startDate)}`,
    `🕐 ${argentinaParts(startDate).time} hs`,
    '',
    'Agregalo a tu calendario para que te llegue el recordatorio:',
    link,
    '',
    '¡Te esperamos!',
  ].join('\n');
}

export function rejectionMessage(appointment: Appointment, link: string): string {
  const name = firstName(appointment);
  const period = appointment.period ? PERIOD_LABELS[appointment.period].toLowerCase() : '';
  return [
    `¡Hola${name ? ` ${name}` : ''}! Gracias por pedir turno.`,
    `No tenemos lugar el ${longDay(appointment.startDate)}${period ? ` a la ${period}` : ''}.`,
    '',
    `¿Te sirve otro día? Podés pedirlo de nuevo acá: ${link}`,
  ].join('\n');
}

/** "+54 9 3564 36-8535" para mostrar el celular guardado como 5493564368535. */
export function formatPhone(phone?: string): string {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length === 13 && d.startsWith('549')) {
    return `+54 9 ${d.slice(3, 7)} ${d.slice(7, 9)}-${d.slice(9)}`;
  }
  return phone || '';
}
