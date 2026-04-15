import { Activity, Company } from '@types';

/** Valores sugeridos para el estado del turno (validables en el front). */
export type AppointmentStatus = 'scheduled' | 'cancelled' | 'completed' | 'no_show';

/**
 * Frecuencia base de la serie. La API expande a partir de `startDate`/`endDate` (primera ocurrencia).
 * - `daily`: cada `interval` día(s).
 * - `weekly`: cada `interval` semana(s), filtrado por `byWeekday` si viene informado.
 * - `monthly`: cada `interval` mes(es); modo detallado en `monthlyMode`.
 */
export type AppointmentRecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

/**
 * Día de la semana en **calendario local del negocio** (misma TZ que el resto de turnos, p. ej. Argentina).
 * 0 = domingo, 1 = lunes, …, 6 = sábado (igual que `Date.getDay()` en hora local de negocio).
 */
export type AppointmentWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Cómo anclar repeticiones mensuales (solo aplica si `frequency === 'monthly'`).
 * - `dayOfMonth`: mismo número de día que la primera ocurrencia (ej. siempre el 15).
 * - `nthWeekday`: mismo ordinal de la semana (ej. “segundo martes” del mes).
 */
export type AppointmentMonthlyRecurrenceMode = 'dayOfMonth' | 'nthWeekday';

/**
 * Regla de recurrencia para **crear** varias ocurrencias en un solo pedido.
 *
 * Contrato sugerido para la API:
 * - Sin `recurrence`: un solo documento (comportamiento actual).
 * - Con `recurrence`: la API genera N documentos (o falla en bloque), preservando duración `endDate - startDate` en cada ocurrencia.
 * - `untilDate` y `count` no deberían enviarse juntos; el front puede validar. Si ambos llegan, define la API la precedencia.
 * - Límite máximo de ocurrencias (ej. 365): recomendable validarlo en API y opcionalmente en front.
 */
export interface AppointmentRecurrenceRule {
  frequency: AppointmentRecurrenceFrequency;
  /** Por defecto asumir `1` si la API omite. */
  interval?: number;
  /**
   * Fin por fecha civil inclusive (recomendado: `YYYY-MM-DD` en TZ de negocio).
   * Alternativa acordar con API: instant ISO con offset explícito.
   */
  untilDate?: string;
  /**
   * Fin por cantidad de ocurrencias **incluyendo la primera** (la de `startDate`/`endDate`).
   * Ej. `count: 10` → 10 turnos en total.
   */
  count?: number;
  /**
   * Obligatorio (o altamente recomendado) si `frequency === 'weekly'`: días en que ocurre la cita.
   * Debe incluir el día de la semana de `startDate` si ese día forma parte de la serie.
   */
  byWeekday?: AppointmentWeekday[];
  /** Solo `monthly`. Si se omite, la API puede asumir `dayOfMonth`. */
  monthlyMode?: AppointmentMonthlyRecurrenceMode;
}

/**
 * Cuerpo para **crear** turno(s). Igual que hoy más `recurrence` opcional.
 * La API puede responder 200 con un solo `_id` o con `{ items: [...], seriesId?: string }` según definan.
 */
export interface AppointmentCreatePayload {
  company: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: AppointmentStatus;
  recurrence?: AppointmentRecurrenceRule;
}

/**
 * Documento persistido. Campos de serie opcionales: la API los agrega cuando aplica recurrencia.
 */
export interface Appointment extends Activity {
  company: Company | string;
  /**
   * Nombre del paciente/cliente para UI si la API lo denormaliza (evita depender solo del populate de `company`).
   */
  patientName?: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  /** Por defecto en back: `scheduled`. */
  status?: AppointmentStatus;
  /**
   * Identificador común de la serie (mismo en todas las ocurrencias generadas juntas).
   * Útil para “editar serie / cancelar serie” en el futuro.
   */
  recurrenceSeriesId?: string;
  /**
   * Regla con la que se generó la serie (opcional; puede vivir solo en la primera ocurrencia o en ninguna).
   */
  recurrenceRule?: AppointmentRecurrenceRule;
}
