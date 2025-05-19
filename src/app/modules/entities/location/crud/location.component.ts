import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Deposit, Location } from '@types';

import { CommonModule } from '@angular/common';
import { DepositService } from '@core/services/deposit.service';
import { LocationService } from '@core/services/location.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
  ],
})
export class LocationComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public location: Location;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public locationForm: UntypedFormGroup;
  public deposits: Deposit[];
  private destroy$ = new Subject<void>();

  constructor(
    public _locationService: LocationService,
    public _depositService: DepositService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.locationForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required]],
      positionX: ['', [Validators.required]],
      positionY: ['', [Validators.required]],
      positionZ: ['', [Validators.required]],
      deposit: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.locationForm.disable();
    const locationId = pathUrl[4];
    this.operation = pathUrl[3];
    this.loading = true;
    combineLatest({
      deposits: this._depositService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ deposits }) => {
          this.deposits = deposits ?? [];

          if (locationId) {
            if (locationId) this.getLocation(locationId);
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
    const deposit = this.deposits?.find((item) => item._id === this.location?.deposit?.toString());

    const values = {
      _id: this.location?._id ?? '',
      description: this.location?.description ?? '',
      positionX: this.location?.positionX ?? '',
      positionY: this.location?.positionY ?? '',
      positionZ: this.location?.positionZ ?? '',
      deposit: deposit ?? null,
    };
    this.locationForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/location']);
  }

  onEnter() {
    if (this.locationForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleLocationOperation();
    }
  }

  public getLocation(id: string) {
    this.loading = true;

    this._locationService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.location = result.result;
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

  public handleLocationOperation() {
    this.loading = true;
    this.locationForm.markAllAsTouched();
    if (this.locationForm.invalid) {
      this.loading = false;
      return;
    }

    this.location = this.locationForm.value;

    switch (this.operation) {
      case 'add':
        this.saveLocation();
        break;
      case 'update':
        this.updateLocation();
        break;
      case 'delete':
        this.deleteLocation();
      default:
        break;
    }
  }

  public updateLocation() {
    this._locationService
      .update(this.location)
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

  public saveLocation() {
    this._locationService
      .save(this.location)
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

  public deleteLocation() {
    this._locationService
      .delete(this.location._id)
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
