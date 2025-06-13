import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { CountryService } from '@core/services/country.service';
import { IdentificationTypeService } from '@core/services/identification-type.service';
import { StateService } from '@core/services/state.service';
import { TransportService } from '@core/services/transport.service';
import { VATConditionService } from '@core/services/vat-condition.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ApiResponse, Country, IdentificationType, State, Transport, VATCondition } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
    ProgressbarModule,
  ],
})
export class TransportComponent implements OnInit {
  @Input() property: {
    transportId: string;
    operation: string;
  };
  public transportId: string;
  public operation: string;

  public transport: Transport;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public transportForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public vatConditions: VATCondition[];
  public states: State[];
  public countries: Country[];
  public identificationTypes: IdentificationType[];

  constructor(
    public _transportService: TransportService,
    public _vatConditionService: VATConditionService,
    public _stateService: StateService,
    public _identificationTypeService: IdentificationTypeService,
    public _countryService: CountryService,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.transportForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z .0-9]+$')]],
      vatCondition: ['', [Validators.required]],
      identificationType: ['', [Validators.required]],
      identificationValue: ['', [Validators.required]],
      address: ['', []],
      city: ['', []],
      phones: ['', []],
      emails: ['', []],
      observation: ['', []],
      country: ['', []],
      state: ['', []],
      addressNumber: ['', []],
      flat: ['', []],
      zipCode: ['', []],
    });
  }

  ngOnInit() {
    if (this.property) {
      this.operation = this.property.operation;
      this.transportId = this.property.transportId;
    } else {
      const URL = this._router.url.split('/');
      this.operation = URL[3];
      this.transportId = URL[4];
    }
    if (this.operation === 'view' || this.operation === 'delete') this.transportForm.disable();
    this.loading = true;

    combineLatest({
      vatConditions: this._vatConditionService.find({ query: { operationType: { $ne: 'D' } } }),
      states: this._stateService.find({ query: { operationType: { $ne: 'D' } } }),
      countries: this._countryService.find({ query: { operationType: { $ne: 'D' } } }),
      identificationTypes: this._identificationTypeService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ vatConditions, states, countries, identificationTypes }) => {
          this.vatConditions = vatConditions ?? [];
          this.states = states ?? [];
          this.countries = countries ?? [];
          this.identificationTypes = identificationTypes ?? [];

          if (this.transportId) {
            this.getTransport(this.transportId);
          } else {
            this.setValueForm();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  public setValueForm(): void {
    const vatCondition = this.vatConditions?.find((item) => item._id === this.transport?.vatCondition?.toString());
    const identificationType = this.identificationTypes?.find(
      (item) => item._id === this.transport?.identificationType?.toString()
    );
    const country = this.countries?.find((item) => item._id === this.transport?.country?.toString());
    const state = this.states?.find((item) => item._id === this.transport?.state?.toString());

    const values = {
      _id: this.transport?._id ?? '',
      name: this.transport?.name ?? '',
      vatCondition: vatCondition ?? null,
      identificationType: identificationType ?? null,
      identificationValue: this.transport?.identificationValue ?? '',
      address: this.transport?.address ?? '',
      city: this.transport?.city ?? '',
      phones: this.transport?.phones ?? '',
      emails: this.transport?.emails ?? '',
      observation: this.transport?.observation ?? '',
      country: country ?? null,
      state: state ?? null,
      addressNumber: this.transport?.addressNumber ?? '',
      flat: this.transport?.flat ?? '',
      zipCode: this.transport?.zipCode ?? '',
    };
    this.transportForm.setValue(values);
  }

  returnTo() {
    if (this.property) {
      this.activeModal.close({ transport: this.transport });
    } else {
      this._router.navigate(['/entities/transports']);
    }
  }

  public getTransport(id: string) {
    this.loading = true;

    this._transportService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.transport = result.result;
          if (result.status == 200) this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public handleTransportOperation() {
    this.loading = true;
    this.transportForm.markAllAsTouched();
    if (this.transportForm.invalid) {
      this.loading = false;
      return;
    }
    this.transport = this.transportForm.value;
    switch (this.operation) {
      case 'add':
        this.saveTransport();
        break;
      case 'update':
        this.updateTransport();
        break;
      case 'delete':
        this.deleteTransport();
      default:
        break;
    }
  }

  public updateTransport() {
    this._transportService
      .update(this.transport)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.transport = result.result;
            this.returnTo();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public saveTransport() {
    this._transportService
      .save(this.transport)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.transport = result.result;
            this.returnTo();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deleteTransport() {
    this._transportService
      .delete(this.transport._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
