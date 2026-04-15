import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '@core/services/appointment.service';
import { CompanyService } from '@core/services/company.service';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  ApiResponse,
  Appointment,
  AppointmentCreatePayload,
  AppointmentMonthlyRecurrenceMode,
  AppointmentRecurrenceFrequency,
  AppointmentRecurrenceRule,
  AppointmentStatus,
  AppointmentWeekday,
  Company,
  CompanyType,
} from '@types';
import { CompanyComponent } from 'app/modules/entities/company/crud/company.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import {
  argentinaCalendarDayKey,
  argentinaWeekday0Sun,
  formatInstantAsArgentinaOffsetIso,
  fromArgentinaDatetimeLocal,
  toArgentinaDatetimeLocal,
} from './appointment-argentina-datetime';

@Component({
  selector: 'app-appointment-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule, TranslateModule, TypeaheadDropdownComponent],
  templateUrl: './appointment-form-modal.component.html',
  styleUrls: ['./appointment-form-modal.component.scss'],
})
export class AppointmentFormModalComponent implements OnInit, OnDestroy {
  /** Edición: documento completo. Alta: undefined. */
  appointment?: Appointment;

  /** Valores iniciales para nueva cita (p. ej. clic en celda). */
  defaults?: { start?: Date; end?: Date };

  public loading = false;
  public companies: Company[] = [];
  public form: UntypedFormGroup;
  public readonly statusOptions: { value: AppointmentStatus; label: string }[] = [
    { value: 'scheduled', label: 'Programado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'completed', label: 'Completado' },
    { value: 'no_show', label: 'No asistió' },
  ];

  public readonly recurrenceFrequencyOptions: { value: AppointmentRecurrenceFrequency; label: string }[] = [
    { value: 'daily', label: 'Diaria (cada N día(s))' },
    { value: 'weekly', label: 'Semanal (ej. todos los lunes)' },
    { value: 'monthly', label: 'Mensual' },
  ];

  public readonly weekdayCheckboxes: { key: string; label: string }[] = [
    { key: '0', label: 'Dom' },
    { key: '1', label: 'Lun' },
    { key: '2', label: 'Mar' },
    { key: '3', label: 'Mié' },
    { key: '4', label: 'Jue' },
    { key: '5', label: 'Vie' },
    { key: '6', label: 'Sáb' },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private _fb: UntypedFormBuilder,
    private _appointmentService: AppointmentService,
    private _companyService: CompanyService,
    private _toastService: ToastService,
    private _modalService: NgbModal
  ) {
    this.form = this._fb.group({
      _id: [''],
      company: [null, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      startLocal: ['', Validators.required],
      endLocal: ['', Validators.required],
      status: ['scheduled' as AppointmentStatus, Validators.required],
      recurrence: this._fb.group({
        enabled: [false],
        frequency: ['weekly' as AppointmentRecurrenceFrequency],
        interval: [1, [Validators.min(1)]],
        /** Por defecto "N ocurrencias": si no, muchos usuarios dejan "Hasta fecha" (+56 días) y esperaban el número de "Cantidad". */
        endType: ['count' as 'until' | 'count'],
        untilDate: [''],
        count: [10, [Validators.min(2), Validators.max(366)]],
        monthlyMode: ['dayOfMonth' as AppointmentMonthlyRecurrenceMode],
        weekdays: this._fb.group({
          '0': [false],
          '1': [false],
          '2': [false],
          '3': [false],
          '4': [false],
          '5': [false],
          '6': [false],
        }),
      }),
    });
  }

  get companyControl(): FormControl {
    return this.form.get('company') as FormControl;
  }

  /** Abre el alta de cliente (mismo flujo que en POS / select-company). */
  openCreateClientModal(): void {
    const modalRef = this._modalService.open(CompanyComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.property = {
      companyId: null,
      operation: 'add',
      type: CompanyType.Client,
    };
    modalRef.result.then(
      (result: { company?: Company }) => {
        const c = result?.company;
        if (c?._id) {
          if (!this.companies.some((x) => x._id === c._id)) {
            this.companies = [...this.companies, c];
          }
          this.companyControl.patchValue(c);
        }
      },
      () => {}
    );
  }

  ngOnInit(): void {
    this._companyService
      .find({ query: { operationType: { $ne: 'D' } } })
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        map((res: unknown) => {
          if (Array.isArray(res)) {
            return res as Company[];
          }
          const r = res as { status?: number; result?: unknown };
          if (r?.status === 200 && r.result) {
            if (Array.isArray(r.result)) {
              return r.result as Company[];
            }
            const inner = r.result as { items?: Company[] };
            if (Array.isArray(inner.items)) {
              return inner.items;
            }
          }
          return [];
        })
      )
      .subscribe({
        next: (list) => {
          this.companies = list;
          this.initFormAfterCompaniesLoaded();
        },
        error: () => {
          this.companies = [];
          this.initFormAfterCompaniesLoaded();
        },
      });
  }

  private initFormAfterCompaniesLoaded(): void {
    if (this.appointment?._id) {
      this.patchFromAppointment(this.appointment);
    } else {
      const start = this.defaults?.start ?? new Date();
      const end = this.defaults?.end ?? new Date(start.getTime() + 60 * 60 * 1000);
      this.form.patchValue({
        startLocal: toArgentinaDatetimeLocal(start),
        endLocal: toArgentinaDatetimeLocal(end),
        status: 'scheduled',
      });
      const untilGuess = new Date(start.getTime() + 56 * 24 * 60 * 60 * 1000);
      this.form.get('recurrence.untilDate')?.patchValue(argentinaCalendarDayKey(untilGuess));
      this.presetWeekdayFromStart();
    }

    this.form
      .get('recurrence.enabled')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((on: boolean) => {
        if (on) {
          this.presetWeekdayFromStart();
        }
      });

    this.form
      .get('startLocal')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.form.get('recurrence.enabled')?.value && this.form.get('recurrence.frequency')?.value === 'weekly') {
          this.presetWeekdayFromStart();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const v = this.form.value;
    const companyId = this.resolveCompanyId(v.company);
    if (!companyId) {
      this._toastService.showToast({ type: 'warning', message: 'Seleccioná una empresa.' });
      return;
    }

    const start = fromArgentinaDatetimeLocal(v.startLocal);
    const end = fromArgentinaDatetimeLocal(v.endLocal);
    if (!start || !end || end <= start) {
      this._toastService.showToast({ type: 'warning', message: 'La fecha/hora de fin debe ser posterior al inicio.' });
      return;
    }

    const base: AppointmentCreatePayload = {
      company: companyId,
      title: (v.title as string).trim(),
      description: (v.description as string)?.trim() || undefined,
      startDate: formatInstantAsArgentinaOffsetIso(start),
      endDate: formatInstantAsArgentinaOffsetIso(end),
      status: v.status as AppointmentStatus,
    };

    let payload: AppointmentCreatePayload | (AppointmentCreatePayload & { _id: string }) = base;

    if (!v._id && v.recurrence?.enabled) {
      const rule = this.buildRecurrenceRule(v.recurrence, start);
      if (!rule) {
        return;
      }
      payload = { ...base, recurrence: rule };
    }

    this.loading = true;
    const req = v._id
      ? this._appointmentService.update({ ...payload, _id: v._id })
      : this._appointmentService.save(payload);

    req.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: ApiResponse) => {
        this._toastService.showToast(result);
        if (result.status === 200) {
          this.activeModal.close(true);
        }
      },
      error: (err) => this._toastService.showToast(err),
      complete: () => {
        this.loading = false;
      },
    });
  }

  delete(): void {
    const id = this.form.get('_id')?.value;
    if (!id) {
      return;
    }
    this.loading = true;
    this._appointmentService
      .delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) {
            this.activeModal.close('deleted');
          }
        },
        error: (err) => this._toastService.showToast(err),
        complete: () => {
          this.loading = false;
        },
      });
  }

  private patchFromAppointment(a: Appointment): void {
    const start = new Date(a.startDate);
    const end = new Date(a.endDate);
    this.form.patchValue({
      _id: a._id,
      company: this.resolveCompanyForPatch(a.company),
      title: a.title,
      description: a.description ?? '',
      startLocal: toArgentinaDatetimeLocal(start),
      endLocal: toArgentinaDatetimeLocal(end),
      status: a.status ?? 'scheduled',
    });
  }

  private resolveCompanyForPatch(company: Appointment['company']): Company | null {
    if (!company) {
      return null;
    }
    if (typeof company === 'object' && company !== null && '_id' in company) {
      const id = (company as Company)._id;
      return this.companies.find((c) => c._id === id) ?? (company as Company);
    }
    if (typeof company === 'string') {
      return this.companies.find((c) => c._id === company) ?? null;
    }
    return null;
  }

  private resolveCompanyId(company: unknown): string {
    if (company && typeof company === 'object' && '_id' in (company as Company)) {
      return String((company as Company)._id);
    }
    if (typeof company === 'string') {
      return company;
    }
    return '';
  }

  private presetWeekdayFromStart(): void {
    const startLocal = this.form.get('startLocal')?.value as string;
    const start = fromArgentinaDatetimeLocal(startLocal);
    if (!start) {
      return;
    }
    const w = argentinaWeekday0Sun(start);
    const wg = this.form.get('recurrence.weekdays') as UntypedFormGroup;
    wg?.get(String(w))?.patchValue(true, { emitEvent: false });
  }

  private buildRecurrenceRule(rec: Record<string, unknown>, start: Date): AppointmentRecurrenceRule | null {
    const frequency = rec.frequency as AppointmentRecurrenceFrequency;
    const interval = Math.max(1, Math.min(99, Number(rec.interval) || 1));
    const endType = rec.endType as 'until' | 'count';

    if (frequency === 'weekly') {
      const byWeekday = this.collectWeekdays(rec.weekdays as Record<string, boolean>);
      if (byWeekday.length === 0) {
        this._toastService.showToast({ type: 'warning', message: 'Elegí al menos un día de la semana.' });
        return null;
      }
      const startDay = argentinaWeekday0Sun(start) as AppointmentWeekday;
      if (!byWeekday.includes(startDay)) {
        this._toastService.showToast({
          type: 'warning',
          message: 'El día de inicio debe estar entre los días repetidos (o cambiá el inicio).',
        });
        return null;
      }
    }

    if (endType === 'until') {
      const untilDate = (rec.untilDate as string)?.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(untilDate)) {
        this._toastService.showToast({ type: 'warning', message: 'Indicá una fecha “hasta” válida (AAAA-MM-DD).' });
        return null;
      }
      const startKey = argentinaCalendarDayKey(start);
      if (untilDate < startKey) {
        this._toastService.showToast({
          type: 'warning',
          message: 'La fecha “hasta” no puede ser anterior al día de inicio.',
        });
        return null;
      }
      const rule: AppointmentRecurrenceRule = {
        frequency,
        interval,
        untilDate,
        ...(frequency === 'weekly' ? { byWeekday: this.collectWeekdays(rec.weekdays as Record<string, boolean>) } : {}),
        ...(frequency === 'monthly' ? { monthlyMode: rec.monthlyMode as AppointmentMonthlyRecurrenceMode } : {}),
      };
      return rule;
    }

    const count = Math.floor(Number(rec.count));
    if (count < 2 || count > 366) {
      this._toastService.showToast({
        type: 'warning',
        message: 'La cantidad de ocurrencias debe estar entre 2 y 366.',
      });
      return null;
    }
    const rule: AppointmentRecurrenceRule = {
      frequency,
      interval,
      count,
      ...(frequency === 'weekly' ? { byWeekday: this.collectWeekdays(rec.weekdays as Record<string, boolean>) } : {}),
      ...(frequency === 'monthly' ? { monthlyMode: rec.monthlyMode as AppointmentMonthlyRecurrenceMode } : {}),
    };
    return rule;
  }

  private collectWeekdays(wg: Record<string, boolean>): AppointmentWeekday[] {
    return (Object.keys(wg || {}) as string[])
      .filter((k) => wg[k])
      .map((k) => Number(k) as AppointmentWeekday)
      .sort((a, b) => a - b);
  }
}
