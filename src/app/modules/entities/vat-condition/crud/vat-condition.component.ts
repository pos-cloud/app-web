import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VATConditionService } from '@core/services/vat-condition.service';
import { TranslateModule } from '@ngx-translate/core';

import { ApiResponse, VATCondition } from '@types';

import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-vat-condition',
  templateUrl: 'vat-condition.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class VatConditionComponent implements OnInit {
  public operation: string;
  public vatCondition: VATCondition;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public vatConditionForm: UntypedFormGroup;
  public letters: string[] = ['', 'A', 'B', 'C', 'E', 'M', 'R', 'T', 'X'];

  private destroy$ = new Subject<void>();

  constructor(
    public _vatConditionService: VATConditionService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.vatConditionForm = this._fb.group({
      _id: ["", []],
      code: ["", [Validators.required]],
      description: ["", [Validators.required]],
      transactionLetter: ["", [Validators.required]],
      discriminate: [false, [Validators.required]],
      observation: ["", []],
    });
  }

  async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const vatCondition = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.vatConditionForm.disable();

    if (vatCondition) this.getVatCondition(vatCondition);
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
      _id: this.vatCondition?._id ?? '',
      code:  this.vatCondition?.code ?? '',
      description:  this.vatCondition?.description ?? '',
      transactionLetter:  this.vatCondition?.transactionLetter ?? 'C',
      discriminate:  this.vatCondition?.discriminate ?? false,
      observation:  this.vatCondition?.observation ?? '',
    };

    this.vatConditionForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/vat-condition']);
  }

  public getVatCondition(cashBoxTypeId: string) {
    this.loading = true;

    this._vatConditionService
      .getById(cashBoxTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.vatCondition = result.result;
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

  public handleVatConditionOperation() {
    this.loading = true;
    this.vatConditionForm.markAllAsTouched();
    if (this.vatConditionForm.invalid) {
      this.loading = false;
      return;
    }

    this.vatCondition = this.vatConditionForm.value;

    switch (this.operation) {
      case 'add':
        this.saveVatCondition();
        break;
      case 'update':
        this.updateVatCondition();
        break;
      case 'delete':
        this.deleteVatCondition();
        break;
      default:
        break;
    }
  }

  public updateVatCondition() {
    this._vatConditionService
      .update(this.vatCondition)
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

  public saveVatCondition() {
    this._vatConditionService
      .save(this.vatCondition)
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

  public deleteVatCondition() {
    this._vatConditionService
      .delete(this.vatCondition._id)
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
