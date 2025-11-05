import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { CountryService } from '@core/services/country.service';
import { StateService } from '@core/services/state.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ApiResponse, Country, State } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
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
export class StateComponent implements OnInit {
  public operation: string;

  public state: State;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public stateForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public countries: Country[];

  constructor(
    public _stateService: StateService,
    public _countryService: CountryService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.stateForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      country: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const stateId = pathUrl[4];
    this.operation = pathUrl[3];

    if (this.operation === 'view' || this.operation === 'delete') this.stateForm.disable();
    this.loading = true;

    combineLatest({
      countries: this._countryService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ countries }) => {
          this.countries = countries ?? [];

          if (stateId) {
            this.getState(stateId);
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
    const country = this.countries?.find((item) => item._id === this.state?.country?.toString());

    const values = {
      _id: this.state?._id ?? '',
      name: this.state?.name ?? '',
      code: this.state?.code ?? 0,
      country: country ?? null,
    };
    this.stateForm.setValue(values);
  }

  returnTo() {
    this._router.navigate(['/entities/states']);
  }

  public getState(id: string) {
    this.loading = true;

    this._stateService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.state = result.result;
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

  public handleStateOperation() {
    this.loading = true;
    this.stateForm.markAllAsTouched();
    if (this.stateForm.invalid) {
      this.loading = false;
      return;
    }
    this.state = this.stateForm.value;
    switch (this.operation) {
      case 'add':
        this.saveState();
        break;
      case 'update':
        this.updateState();
        break;
      case 'delete':
        this.deleteState();
      default:
        break;
    }
  }

  public updateState() {
    this._stateService
      .update(this.state)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.state = result.result;
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

  public saveState() {
    this._stateService
      .save(this.state)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.state = result.result;
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

  public deleteState() {
    this._stateService
      .delete(this.state._id)
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
