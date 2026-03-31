import { Activity, Company } from '@types';

/** Valores sugeridos para el estado del turno (validables en el front). */
export type AppointmentStatus = 'scheduled' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment extends Activity {
  company: Company | string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  /** Por defecto en back: `scheduled`. */
  status?: AppointmentStatus;
}
