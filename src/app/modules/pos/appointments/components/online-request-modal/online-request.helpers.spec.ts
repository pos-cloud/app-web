import { Appointment } from '@types';

import {
  argentinaParts,
  confirmationMessage,
  confirmedRange,
  formatPhone,
  longDay,
  publicAppointmentUrl,
  rejectionMessage,
  whatsappUrl,
} from './online-request.helpers';

const request = {
  _id: 'a1',
  title: 'Turno online · Ana Pérez',
  startDate: '2026-11-27T16:00:00.000Z',
  endDate: '2026-11-27T21:00:00.000Z',
  status: 'pending',
  source: 'online',
  period: 'afternoon',
  customerName: 'Ana Pérez',
  customerPhone: '5493564368535',
  publicToken: 'f'.repeat(32),
} as unknown as Appointment;

describe('pedidos de turno online', () => {
  it('lee día y hora en Argentina', () => {
    expect(argentinaParts(request.startDate)).toEqual({ day: '2026-11-27', time: '13:00' });
  });

  it('arma el turno confirmado con la hora elegida y la duración', () => {
    expect(confirmedRange('2026-11-27', '15:30', 45)).toEqual({
      startDate: '2026-11-27T18:30:00.000Z',
      endDate: '2026-11-27T19:15:00.000Z',
    });
    expect(confirmedRange('2026-11-27', '', 30)).toBeNull();
    expect(confirmedRange('2026-11-27', '15:30', 0)).toBeNull();
  });

  it('escribe el día largo en español', () => {
    expect(longDay(request.startDate)).toBe('viernes 27 de noviembre');
  });

  it('el mensaje de confirmación lleva nombre, día, hora y el link del calendario', () => {
    const link = publicAppointmentUrl('mi-negocio', request.publicToken as string);
    const text = confirmationMessage(request, '2026-11-27T18:30:00.000Z', link);
    expect(text).toContain('¡Hola Ana! Tu turno quedó confirmado');
    expect(text).toContain('viernes 27 de noviembre');
    expect(text).toContain('15:30 hs');
    expect(text).toContain(`https://appointments.poscloud.ar/mi-negocio/turno/${'f'.repeat(32)}`);
  });

  it('el mensaje de rechazo menciona la franja y ofrece pedir otro día', () => {
    const text = rejectionMessage(request, 'https://appointments.poscloud.ar/mi-negocio');
    expect(text).toContain('a la tarde');
    expect(text).toContain('https://appointments.poscloud.ar/mi-negocio');
  });

  it('el link de WhatsApp usa solo dígitos y codifica el texto', () => {
    expect(whatsappUrl('+54 9 3564 368535', 'Hola ✅')).toBe('https://wa.me/5493564368535?text=Hola%20%E2%9C%85');
  });

  it('muestra el celular legible', () => {
    expect(formatPhone('5493564368535')).toBe('+54 9 3564 36-8535');
    expect(formatPhone('123')).toBe('123');
  });
});
