import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, IdentificationType } from '@types';

import { CommonModule } from '@angular/common';
import { IdentificationTypeService } from '@core/services/identification-type.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-identification-type',
  templateUrl: './identification-type.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class IdentificationTypeComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public identificationType: IdentificationType;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public identificationTypeForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public _identificationTypeService: IdentificationTypeService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.identificationTypeForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const identificationType = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.identificationTypeForm.disable();
    if (identificationType) this.getIdentificationType(identificationType);
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
      _id: this.identificationType?._id ?? '',
      code: this.identificationType?.code ?? '',
      name: this.identificationType?.name ?? '',
    };
    this.identificationTypeForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/identification-type']);
  }

  onEnter() {
    if (this.identificationTypeForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleIdentificationTypeOperation();
    }
  }

  public getIdentificationType(id: string) {
    this.loading = true;

    this._identificationTypeService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.identificationType = result.result;
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

  public handleIdentificationTypeOperation() {
    this.loading = true;
    this.identificationTypeForm.markAllAsTouched();
    if (this.identificationTypeForm.invalid) {
      this.loading = false;
      return;
    }

    this.identificationType = this.identificationTypeForm.value;

    switch (this.operation) {
      case 'add':
        this.saveIdentificationType();
        break;
      case 'update':
        this.updateIdentificationType();
        break;
      case 'delete':
        this.deleteIdentificationType();
      default:
        break;
    }
  }

  public updateIdentificationType() {
    this._identificationTypeService
      .update(this.identificationType)
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

  public saveIdentificationType() {
    this._identificationTypeService
      .save(this.identificationType)
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

  public deleteIdentificationType() {
    this._identificationTypeService
      .delete(this.identificationType._id)
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
