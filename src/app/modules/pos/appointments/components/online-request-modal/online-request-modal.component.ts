import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '@core/services/appointment.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Appointment } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Observable } from 'rxjs';

import {
  argentinaParts,
  bookingUrl,
  confirmationMessage,
  confirmedRange,
  DURATIONS,
  formatPhone,
  longDay,
  PERIOD_LABELS,
  publicAppointmentUrl,
  rejectionMessage,
  whatsappUrl,
} from './online-request.helpers';

/**
 * Pedido de turno online: el negocio elige la hora exacta y confirma, o lo rechaza.
 * En los dos casos se abre WhatsApp con el mensaje para el cliente, listo para enviar.
 */
@Component({
  selector: 'app-online-request-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './online-request-modal.component.html',
})
export class OnlineRequestModalComponent implements OnInit {
  @Input() appointment!: Appointment;

  protected readonly durations = DURATIONS;
  protected day = '';
  protected time = '';
  protected minutes = 30;
  protected saving = false;

  private readonly database = localStorage.getItem('company') || '';

  constructor(
    public activeModal: NgbActiveModal,
    private _appointmentService: AppointmentService,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    const start = argentinaParts(this.appointment.startDate);
    this.day = start.day;
    this.time = start.time;
  }

  protected get requestedLabel(): string {
    const from = argentinaParts(this.appointment.startDate).time;
    const to = argentinaParts(this.appointment.endDate).time;
    const period = this.appointment.period ? PERIOD_LABELS[this.appointment.period] : 'Franja';
    const day = longDay(this.appointment.startDate);
    return `${day.charAt(0).toUpperCase()}${day.slice(1)} · ${period} (${from} a ${to})`;
  }

  protected get phoneLabel(): string {
    return formatPhone(this.appointment.customerPhone);
  }

  protected confirm(): void {
    const range = confirmedRange(this.day, this.time, Number(this.minutes));
    if (!range) {
      this._toastService.showToast({ type: 'warning', message: 'Elegí la hora del turno.' });
      return;
    }
    const link = publicAppointmentUrl(this.database, this.appointment.publicToken || '');
    const text = confirmationMessage(this.appointment, range.startDate, link);
    this.saveAndNotify(
      this._appointmentService.update({ _id: this.appointment._id, status: 'scheduled', ...range }),
      text,
      'Turno confirmado.'
    );
  }

  protected reject(): void {
    const text = rejectionMessage(this.appointment, bookingUrl(this.database));
    this.saveAndNotify(
      this._appointmentService.update({ _id: this.appointment._id, status: 'cancelled' }),
      text,
      'Pedido rechazado.'
    );
  }

  /**
   * La ventana de WhatsApp se abre en el click para que el navegador no la bloquee,
   * y recién se le carga el mensaje cuando el turno quedó guardado.
   */
  private saveAndNotify(request: Observable<any>, text: string, done: string): void {
    const tab = window.open('', '_blank');
    this.saving = true;
    request.subscribe({
      next: (result) => {
        this.saving = false;
        if (result?.status !== 200) {
          tab?.close();
          this._toastService.showToast(result);
          return;
        }
        const url = whatsappUrl(this.appointment.customerPhone || '', text);
        if (tab) {
          tab.location.href = url;
        } else {
          window.location.href = url;
        }
        this._toastService.showToast({ type: 'success', message: done });
        this.activeModal.close(true);
      },
      error: (error) => {
        this.saving = false;
        tab?.close();
        this._toastService.showToast(error);
      },
    });
  }
}
