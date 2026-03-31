import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppointmentService } from '@core/services/appointment.service';
import { CompanyService } from '@core/services/company.service';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse, Appointment, AppointmentStatus, Company } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import {
  argentinaAllDayRangeFromStartInput,
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

  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private _fb: UntypedFormBuilder,
    private _appointmentService: AppointmentService,
    private _companyService: CompanyService,
    private _toastService: ToastService
  ) {
    this.form = this._fb.group({
      _id: [''],
      company: [null, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      startLocal: ['', Validators.required],
      endLocal: ['', Validators.required],
      allDay: [false],
      status: ['scheduled' as AppointmentStatus, Validators.required],
    });
  }

  get companyControl(): FormControl {
    return this.form.get('company') as FormControl;
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
        allDay: false,
        status: 'scheduled',
      });
    }

    this.form
      .get('allDay')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((allDay: boolean) => {
        if (allDay) {
          const range = argentinaAllDayRangeFromStartInput(this.form.get('startLocal')?.value ?? '');
          if (range) {
            this.form.patchValue(
              {
                startLocal: toArgentinaDatetimeLocal(range.start),
                endLocal: toArgentinaDatetimeLocal(range.end),
              },
              { emitEvent: false }
            );
          }
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

    const payload: Record<string, unknown> = {
      company: companyId,
      title: (v.title as string).trim(),
      description: (v.description as string)?.trim() || undefined,
      startDate: formatInstantAsArgentinaOffsetIso(start),
      endDate: formatInstantAsArgentinaOffsetIso(end),
      allDay: !!v.allDay,
      status: v.status as AppointmentStatus,
    };

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
      allDay: !!a.allDay,
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

}
