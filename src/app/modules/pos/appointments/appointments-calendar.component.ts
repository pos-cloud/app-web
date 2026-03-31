import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppointmentService } from '@core/services/appointment.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Appointment } from '@types';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppointmentFormModalComponent } from './components/appointment-form-modal/appointment-form-modal.component';
import {
  addDays,
  argentinaCalendarDayKey,
  appointmentLocalDayKey,
  buildMonthGrid,
  buildWeekDayHeaders,
  CalendarViewMode,
  computeWeekEventLayoutsForDay,
  createHourSlots,
  firstOfMonth,
  formatMonthTitle,
  formatWeekRangeLabel,
  getMonthRangeISO,
  getWeekRangeISO,
  HourSlot,
  MonthCell,
  startOfWeekSunday,
  stripTime,
  WeekEventLayout,
  WEEK_VIEW_END_HOUR,
  WEEK_VIEW_START_HOUR,
  WeekDayHeader,
} from './appointments-calendar.helpers';

@Component({
  selector: 'app-pos-appointments-calendar',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './appointments-calendar.component.html',
  styleUrls: ['./appointments-calendar.component.scss'],
})
export class AppointmentsCalendarComponent implements OnInit, OnDestroy {
  /** Día ancla: en mes = primer día del mes; en semana = cualquier día de esa semana (se normaliza al armar la vista). */
  protected viewAnchor = firstOfMonth(new Date());

  protected viewMode: CalendarViewMode = 'month';

  protected periodLabel = '';

  protected readonly weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  protected weeks: MonthCell[][] = [];

  protected weekDayHeaders: WeekDayHeader[] = [];
  protected hourSlots: HourSlot[] = [];

  protected appointments: Appointment[] = [];
  protected loadingAppointments = false;

  private readonly today = stripTime(new Date());
  private destroy$ = new Subject<void>();

  constructor(private _appointmentService: AppointmentService, private _modal: NgbModal) {}

  ngOnInit(): void {
    this.hourSlots = createHourSlots(WEEK_VIEW_START_HOUR, WEEK_VIEW_END_HOUR);
    this.rebuildView();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected setViewMode(mode: CalendarViewMode): void {
    if (this.viewMode === mode) {
      return;
    }
    this.viewMode = mode;
    if (mode === 'week') {
      /** Al pasar de mes (u otra vista) a semana, mostrar siempre la semana actual. */
      this.viewAnchor = stripTime(new Date());
    } else {
      this.viewAnchor = firstOfMonth(this.viewAnchor);
    }
    this.rebuildView();
  }

  /** Clic en un día del mes: abrir vista semana que contiene ese día. */
  protected onMonthDayClick(cell: MonthCell): void {
    if (!cell.date || !cell.day) {
      return;
    }
    this.viewAnchor = stripTime(cell.date);
    this.viewMode = 'week';
    this.rebuildView();
  }

  protected navigatePrev(): void {
    if (this.viewMode === 'month') {
      this.viewAnchor = new Date(this.viewAnchor.getFullYear(), this.viewAnchor.getMonth() - 1, 1);
    } else {
      const ws = startOfWeekSunday(this.viewAnchor);
      this.viewAnchor = addDays(ws, -7);
    }
    this.rebuildView();
  }

  protected navigateNext(): void {
    if (this.viewMode === 'month') {
      this.viewAnchor = new Date(this.viewAnchor.getFullYear(), this.viewAnchor.getMonth() + 1, 1);
    } else {
      const ws = startOfWeekSunday(this.viewAnchor);
      this.viewAnchor = addDays(ws, 7);
    }
    this.rebuildView();
  }

  protected goToday(): void {
    const n = new Date();
    if (this.viewMode === 'month') {
      this.viewAnchor = firstOfMonth(n);
    } else {
      this.viewAnchor = n;
    }
    this.rebuildView();
  }

  /** Recarga turnos del período visible sin cambiar fecha ni vista. */
  protected refreshAppointments(): void {
    this.loadAppointments();
  }

  protected isTodayCell(cell: MonthCell): boolean {
    if (!cell.date) {
      return false;
    }
    return stripTime(cell.date).getTime() === this.today.getTime();
  }

  /** Vista mes: turnos cuyo día civil en Argentina coincide con la celda (misma regla que el formulario). */
  protected getMonthAppointmentsForDay(date: Date | null): Appointment[] {
    if (!date) {
      return [];
    }
    const key = argentinaCalendarDayKey(date);
    return this.appointments.filter((a) => appointmentLocalDayKey(a) === key);
  }

  /** Vista mes: cantidad para el indicador con punto. */
  protected countAppointmentsForDay(date: Date | null): number {
    return this.getMonthAppointmentsForDay(date).length;
  }

  /** Turnos del día con columnas cuando hay solape (mismo instante o tramos superpuestos). */
  protected getWeekLayoutsForDay(date: Date | null): WeekEventLayout[] {
    if (!date) {
      return [];
    }
    return computeWeekEventLayoutsForDay(this.appointments, date);
  }

  /** Vista semana: rango horario tipo calendario (ej. 09:00 – 10:30). */
  protected weekEventTimeLabel(apt: Appointment): string {
    if (apt.allDay) {
      return 'Todo el día';
    }
    const opt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const fmt = new Intl.DateTimeFormat('es-AR', opt);
    return `${fmt.format(new Date(apt.startDate))} – ${fmt.format(new Date(apt.endDate))}`;
  }

  /** Color / estado del bloque en vista semana (estilo Google Calendar). */
  protected weekEventModifierClass(apt: Appointment): string {
    switch (apt.status) {
      case 'cancelled':
        return 'week-view__event--cancelled';
      case 'completed':
        return 'week-view__event--completed';
      case 'no_show':
        return 'week-view__event--no-show';
      default:
        return 'week-view__event--scheduled';
    }
  }

  protected openNewAppointment(): void {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    this.openModal(undefined, { start, end });
  }

  protected openNewForDay(date: Date): void {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    this.openModal(undefined, { start, end });
  }

  protected openEditAppointment(apt: Appointment, ev?: Event): void {
    ev?.stopPropagation();
    this.openModal(apt);
  }

  private openModal(appointment?: Appointment, defaults?: { start: Date; end: Date }): void {
    const ref = this._modal.open(AppointmentFormModalComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    ref.componentInstance.appointment = appointment;
    ref.componentInstance.defaults = defaults;
    ref.result.then(
      (r) => {
        if (r === true || r === 'deleted') {
          this.loadAppointments();
        }
      },
      () => {}
    );
  }

  /** Estilo de bloque en vista semana (posición vertical + columnas si hay solape). */
  protected weekEventStyle(layout: WeekEventLayout, dayDate: Date): { [key: string]: string } {
    const apt = layout.appointment;
    const { column, columnCount } = layout;
    const colW = 100 / columnCount;
    const leftPct = (column / columnCount) * 100;

    if (apt.allDay) {
      return {
        top: '0',
        height: '34px',
        left: `${leftPct}%`,
        width: `${colW}%`,
        right: 'auto',
      };
    }
    const start = new Date(apt.startDate);
    const end = new Date(apt.endDate);
    const dayStart = new Date(
      dayDate.getFullYear(),
      dayDate.getMonth(),
      dayDate.getDate(),
      WEEK_VIEW_START_HOUR,
      0,
      0,
      0
    );
    const totalMin = (WEEK_VIEW_END_HOUR - WEEK_VIEW_START_HOUR) * 60;
    const dayStartMs = dayStart.getTime();
    const dayViewportEnd = dayStartMs + totalMin * 60 * 1000;
    const startClamped = Math.max(start.getTime(), dayStartMs);
    const endClamped = Math.min(end.getTime(), dayViewportEnd);
    if (startClamped >= endClamped) {
      return { display: 'none' };
    }
    const startMin = (startClamped - dayStartMs) / 60000;
    const endMin = (endClamped - dayStartMs) / 60000;
    const topPct = (startMin / totalMin) * 100;
    const heightPct = ((endMin - startMin) / totalMin) * 100;
    return {
      top: `${topPct}%`,
      height: `${Math.max(heightPct, 3)}%`,
      left: `${leftPct}%`,
      width: `${colW}%`,
      right: 'auto',
    };
  }

  private rebuildView(): void {
    if (this.viewMode === 'month') {
      const y = this.viewAnchor.getFullYear();
      const m = this.viewAnchor.getMonth();
      this.periodLabel = formatMonthTitle(y, m);
      this.weeks = buildMonthGrid(y, m);
    } else {
      const ws = startOfWeekSunday(this.viewAnchor);
      this.periodLabel = formatWeekRangeLabel(ws);
      this.weekDayHeaders = buildWeekDayHeaders(ws, new Date());
    }
    this.loadAppointments();
  }

  private loadAppointments(): void {
    const range =
      this.viewMode === 'month'
        ? getMonthRangeISO(this.viewAnchor)
        : getWeekRangeISO(startOfWeekSunday(this.viewAnchor));

    this.loadingAppointments = true;
    this._appointmentService
      .getInRange(range.from, range.to)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingAppointments = false;
        })
      )
      .subscribe({
        next: (res: { status: number; result: unknown }) => {
          let list: Appointment[] = [];
          if (res.status === 200 && res.result) {
            if (Array.isArray(res.result)) {
              list = res.result as Appointment[];
            } else if (
              typeof res.result === 'object' &&
              res.result !== null &&
              Array.isArray((res.result as { items?: unknown[] }).items)
            ) {
              list = (res.result as { items: Appointment[] }).items;
            }
          }
          this.appointments = list;
        },
        error: () => {
          this.appointments = [];
        },
      });
  }
}
