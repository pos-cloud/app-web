import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Branch, Deposit } from '@types';

import { CommonModule } from '@angular/common';
import { BranchService } from '@core/services/branch.service';
import { DepositService } from '@core/services/deposit.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
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
export class DepositComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public deposit: Deposit;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public depositForm: UntypedFormGroup;
  public branches: Branch[];
  private destroy$ = new Subject<void>();

  constructor(
    public _depositService: DepositService,
    public _branchService: BranchService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.depositForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      capacity: ['', []],
      default: ['', []],
      branch: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.depositForm.disable();
    const depositId = pathUrl[4];
    this.operation = pathUrl[3];
    this.loading = true;
    combineLatest({
      branches: this._branchService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ branches }) => {
          this.branches = branches ?? [];

          if (depositId) {
            if (depositId) this.getDeposit(depositId);
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
    const branch = this.branches?.find((item) => item._id === this.deposit?.branch?.toString());

    const values = {
      _id: this.deposit?._id ?? '',
      name: this.deposit?.name ?? '',
      capacity: this.deposit?.capacity ?? '',
      default: this.deposit?.default ?? '',
      branch: branch ?? null,
    };
    this.depositForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/deposit']);
  }

  onEnter() {
    if (this.depositForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleDepositOperation();
    }
  }

  public getDeposit(id: string) {
    this.loading = true;

    this._depositService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.deposit = result.result;
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

  public handleDepositOperation() {
    this.loading = true;
    this.depositForm.markAllAsTouched();
    if (this.depositForm.invalid) {
      this.loading = false;
      return;
    }

    this.deposit = this.depositForm.value;

    switch (this.operation) {
      case 'add':
        this.saveDeposit();
        break;
      case 'update':
        this.updateDeposit();
        break;
      case 'delete':
        this.deleteDeposit();
      default:
        break;
    }
  }

  public updateDeposit() {
    this._depositService
      .update(this.deposit)
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

  public saveDeposit() {
    this._depositService
      .save(this.deposit)
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

  public deleteDeposit() {
    this._depositService
      .delete(this.deposit._id)
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
