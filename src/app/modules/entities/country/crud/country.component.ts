import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ApiResponse, Country } from '@types';

import { CountryService } from 'app/core/services/country.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class CountryComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public country: Country;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public countryForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public _countryService: CountryService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.countryForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      callingCodes: ['', []],
      timezones: ['', []],
      flag: ['', []],
      alpha2Code: ['', []],
      alpha3Code: ['', []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const countryId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.countryForm.disable();
    if (countryId) this.getCountry(countryId);
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
    const values = {
      _id: this.country._id ?? '',
      code: this.country.code ?? '',
      name: this.country.name ?? '',
      callingCodes: this.country.callingCodes ?? '',
      timezones: this.country.timezones ?? '',
      flag: this.country.flag ?? '',
      alpha2Code: this.country.alpha2Code ?? '',
      alpha3Code: this.country.alpha3Code ?? '',
    };
    this.countryForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/countries']);
  }

  public getCountry(id: string) {
    this.loading = true;

    this._countryService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.country = result.result;
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

  public handleCountryOperation() {
    this.loading = true;
    this.countryForm.markAllAsTouched();
    if (this.countryForm.invalid) {
      this.loading = false;
      return;
    }

    this.country = this.countryForm.value;

    switch (this.operation) {
      case 'add':
        this.saveCountry();
        break;
      case 'update':
        this.updateCountry();
        break;
      case 'delete':
        this.deleteCountry();
        break;
      default:
        break;
    }
  }

  public updateCountry() {
    this._countryService
      .update(this.country)
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

  public saveCountry() {
    this._countryService
      .save(this.country)
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

  public deleteCountry() {
    this._countryService
      .delete(this.country._id)
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
