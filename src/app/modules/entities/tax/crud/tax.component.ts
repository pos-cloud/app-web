import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AccountService } from '@core/services/account.service';
import { PrinterService } from '@core/services/printer.service';
import { TaxService } from '@core/services/tax.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { Account, ApiResponse, Printer, Tax, TaxBase, TaxClassification, TaxType } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
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
export class TaxComponent implements OnInit {
  public operation: string;

  public tax: Tax;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public taxForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public accounts: Account[];
  public printers: Printer[];
  public taxClassifications: TaxClassification[] = [
    TaxClassification.None,
    TaxClassification.Tax,
    TaxClassification.Withholding,
    TaxClassification.Perception,
  ];
  public taxTypes: TaxType[] = [TaxType.None, TaxType.National, TaxType.State, TaxType.City];
  public taxBases: TaxBase[] = [TaxBase.None, TaxBase.Neto];
  constructor(
    public _taxService: TaxService,
    public _accountService: AccountService,
    public _printerService: PrinterService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.taxForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      taxBase: ['', []],
      percentage: ['', []],
      amount: [0, []],
      classification: [null, [Validators.required]],
      type: ['', []],
      lastNumber: [0, []],
      debitAccount: [null, []],
      creditAccount: [null, []],
      printer: [null, []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const taxId = pathUrl[4];
    this.operation = pathUrl[3];

    if (this.operation === 'view' || this.operation === 'delete') this.taxForm.disable();
    this.loading = true;

    combineLatest({
      accounts: this._accountService.find({ query: { operationType: { $ne: 'D' } } }),
      printers: this._printerService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ accounts, printers }) => {
          this.accounts = accounts ?? [];
          this.printers = printers ?? [];

          if (taxId) {
            this.getTax(taxId);
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
    const debitAccount = this.accounts?.find((item) => item._id === this.tax?.debitAccount?.toString());
    const creditAccount = this.accounts?.find((item) => item._id === this.tax?.creditAccount?.toString());
    const printer = this.printers?.find((item) => item._id === this.tax?.printer?.toString());

    const values = {
      _id: this.tax?._id ?? '',
      name: this.tax?.name ?? '',
      code: this.tax?.code ?? 0,
      taxBase: this.tax?.taxBase ?? TaxBase.None,
      percentage: this.tax?.percentage ?? 0,
      amount: this.tax?.amount ?? 0,
      classification: this.tax?.classification ?? TaxClassification.None,
      type: this.tax?.type ?? TaxType.None,
      lastNumber: this.tax?.lastNumber ?? 0,
      debitAccount: debitAccount ?? null,
      creditAccount: creditAccount ?? null,
      printer: printer ?? null,
    };
    this.taxForm.setValue(values);
  }

  returnTo() {
    this._router.navigate(['/entities/taxes']);
  }

  public getTax(id: string) {
    this.loading = true;

    this._taxService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.tax = result.result;
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

  public handleTaxOperation() {
    this.loading = true;
    this.taxForm.markAllAsTouched();
    if (this.taxForm.invalid) {
      this.loading = false;
      return;
    }
    this.tax = this.taxForm.value;
    switch (this.operation) {
      case 'add':
        this.saveTax();
        break;
      case 'update':
        this.updateTax();
        break;
      case 'delete':
        this.deleteTax();
      default:
        break;
    }
  }

  public updateTax() {
    this._taxService
      .update(this.tax)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.tax = result.result;
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

  public saveTax() {
    this._taxService
      .save(this.tax)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.tax = result.result;
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

  public deleteTax() {
    this._taxService
      .delete(this.tax._id)
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
