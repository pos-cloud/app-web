import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, UseOfCFDI } from '@types';

import { CommonModule } from '@angular/common';
import { UseOfCFDIService } from '@core/services/use-of-CFDI.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-uses-of-cfdi',
  templateUrl: './uses-of-cfdi.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class UsesOfCFDIComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public usesOfCfdi: UseOfCFDI;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public usesOfCfdiForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public _usesOfCFDIService: UseOfCFDIService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.usesOfCfdiForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required]],
      code: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const usesOfCfdi = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.usesOfCfdiForm.disable();
    if (usesOfCfdi) this.getUsesOFCfdi(usesOfCfdi);
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
      _id: this.usesOfCfdi?._id ?? '',
      description: this.usesOfCfdi?.description ?? '',
      code: this.usesOfCfdi?.code ?? '',
    };
    this.usesOfCfdiForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/uses-of-cfdi']);
  }

  onEnter() {
    if (this.usesOfCfdiForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleUsesOfCfdiOperation();
    }
  }

  public getUsesOFCfdi(id: string) {
    this.loading = true;

    this._usesOfCFDIService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.usesOfCfdi = result.result;
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

  public handleUsesOfCfdiOperation() {
    this.loading = true;
    this.usesOfCfdiForm.markAllAsTouched();
    if (this.usesOfCfdiForm.invalid) {
      this.loading = false;
      return;
    }

    this.usesOfCfdi = this.usesOfCfdiForm.value;

    switch (this.operation) {
      case 'add':
        this.saveUsesOFCfdi();
        break;
      case 'update':
        this.updateUsesOFCfdi();
        break;
      case 'delete':
        this.deleteUsesOFCfdi();
      default:
        break;
    }
  }

  public updateUsesOFCfdi() {
    this._usesOfCFDIService
      .update(this.usesOfCfdi)
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

  public saveUsesOFCfdi() {
    this._usesOfCFDIService
      .save(this.usesOfCfdi)
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

  public deleteUsesOFCfdi() {
    this._usesOfCFDIService
      .delete(this.usesOfCfdi._id)
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
