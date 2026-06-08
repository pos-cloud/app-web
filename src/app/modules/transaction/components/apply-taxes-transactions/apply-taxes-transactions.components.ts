import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Tax, TaxBase, TaxClassification, Taxes, TaxSource, Transaction } from '@types';
import { TaxService } from 'app/core/services/tax.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { NumericTextDirective } from 'app/shared/directives/numeric-text.directive';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { combineLatest, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-apply-taxes-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NumericTextDirective],
  templateUrl: './apply-taxes-transactions.components.html',
  providers: [NgbAlertConfig, TranslateMePipe],
})
export class ApplyTaxesTransactionsComponent implements OnInit {
  public transactionTax: Taxes;
  public transactionTaxes: Taxes[] = [];
  public taxes: Tax[] = [];
  public taxesForm: UntypedFormGroup;
  public focusEvent = new EventEmitter<boolean>();

  public roundNumber: RoundNumberPipe = new RoundNumberPipe();
  public editingTaxIndex: number | null = null;
  private editingTaxSnapshot: Taxes | null = null;
  private destroy$ = new Subject<void>();

  @Input() transaction: Transaction;
  @Input() filtersTaxClassification: TaxClassification[];

  constructor(
    public _taxService: TaxService,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {
    this.transactionTax = this.createEmptyTax();
    this.taxesForm = this._fb.group({
      tax: [this.transactionTax.tax, [Validators.required]],
      percentage: [this.transactionTax.percentage, []],
      taxAmount: [this.transactionTax.taxAmount, []],
      source: [this.transactionTax.source, []],
    });
  }

  async ngOnInit(): Promise<void> {
    if (!this.transactionTaxes?.length && this.transaction?.taxes?.length) {
      this.transactionTaxes = this.transaction.taxes.map((tax) => ({ ...tax }));
    }

    combineLatest({
      taxes: this._taxService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ taxes }) => {
          this.taxes = taxes ?? [];
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.syncTaxReferences();
        },
      });
  }

  public compareTax(a: Tax | null, b: Tax | null): boolean {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return String(a._id) === String(b._id);
  }

  private resolveTaxFromCatalog(tax: Tax | null | undefined): Tax | null {
    if (!tax) {
      return null;
    }
    return this.taxes.find((item) => String(item._id) === String(tax._id)) ?? tax;
  }

  private syncTaxReferences(): void {
    this.transactionTaxes = this.transactionTaxes.map((row) => ({
      ...row,
      tax: this.resolveTaxFromCatalog(row.tax),
    }));
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public trackByIndex(index: number): number {
    return index;
  }

  private createEmptyTax(): Taxes {
    return {
      _id: null,
      tax: null,
      percentage: 0,
      taxBase: 0,
      taxAmount: 0,
      source: TaxSource.Manual,
    };
  }

  public setValueForm(): void {
    const values = {
      tax: this.transactionTax?.tax ?? null,
      percentage: this.transactionTax?.percentage ?? 0,
      taxAmount: this.transactionTax?.taxAmount ?? 0,
      source: this.transactionTax?.source ?? TaxSource.Manual,
    };
    this.taxesForm.setValue(values);
  }

  private getTaxedAmount(): number {
    if (!this.transaction) {
      return 0;
    }
    return Number(this.roundNumber.transform(this.transaction.basePrice));
  }

  private applyTaxCalculation(target: Taxes, op: string): void {
    if (!target?.tax) {
      return;
    }

    const taxedAmount = this.getTaxedAmount();
    switch (op) {
      case 'tax':
        target.percentage = target.tax.percentage;
        target.taxAmount = target.tax.amount;
        if (target.percentage && target.percentage !== 0 && target.tax.taxBase === TaxBase.Neto) {
          target.taxBase = this.roundNumber.transform(taxedAmount);
          target.taxAmount = this.roundNumber.transform((target.taxBase * target.percentage) / 100);
        }
        break;
      case 'percentage':
        target.taxAmount = target.tax.amount;
        if (target.percentage && target.percentage !== 0 && target.tax.taxBase === TaxBase.Neto) {
          target.taxBase = this.roundNumber.transform(taxedAmount);
          target.taxAmount = this.roundNumber.transform((target.taxBase * target.percentage) / 100);
        }
        break;
      case 'taxAmount':
        if (target.tax.taxBase === TaxBase.Neto && target.taxBase) {
          target.percentage = this.roundNumber.transform((target.taxAmount * 100) / target.taxBase);
        } else if (target.percentage && target.percentage !== 0 && target.tax.taxBase === TaxBase.Neto) {
          target.taxBase = this.roundNumber.transform(taxedAmount);
          target.percentage = this.roundNumber.transform((target.taxAmount * 100) / target.taxBase);
        }
        break;
      default:
        break;
    }
  }

  private syncTargetFromForm(target: Taxes, op: string): void {
    target.tax = this.taxesForm.value.tax;

    if (op === 'percentage') {
      target.percentage = this.taxesForm.value.percentage;
    }

    if (op === 'taxAmount') {
      target.taxAmount = this.taxesForm.value.taxAmount;
    }
  }

  public changeTax(op: string, index?: number): void {
    const isRow = index !== undefined;
    const target = isRow ? this.transactionTaxes[index] : this.transactionTax;

    if (!isRow) {
      if (!this.taxesForm.value.tax) {
        return;
      }
      this.syncTargetFromForm(target, op);
    } else if (!target?.tax) {
      return;
    }
    this.applyTaxCalculation(target, op);
    if (!isRow) {
      this.setValueForm();
    }
  }

  public onRowPercentageChange(index: number, value: number): void {
    this.transactionTaxes[index].percentage = Number(value) || 0;
  }

  public onRowTaxAmountChange(index: number, value: number): void {
    this.transactionTaxes[index].taxAmount = Number(value) || 0;
  }

  public recalculateTaxes(): void {
    if (this.taxExists()) {
      return;
    }
    this.transactionTaxes = [...this.transactionTaxes, { ...this.transactionTax }];
    this.transactionTax = this.createEmptyTax();

    this.setValueForm();
  }

  public isEditingTax(index: number): boolean {
    return this.editingTaxIndex === index;
  }

  public startEditTax(index: number): void {
    if (this.editingTaxIndex !== null && this.editingTaxIndex !== index) {
      this.cancelEditTax();
    }
    const row = this.transactionTaxes[index];
    if (row.tax) {
      row.tax = this.resolveTaxFromCatalog(row.tax);
    }

    this.editingTaxIndex = index;
    this.editingTaxSnapshot = this.cloneTaxRow(row);
  }

  public cancelEditTax(): void {
    if (this.editingTaxIndex !== null && this.editingTaxSnapshot) {
      this.transactionTaxes[this.editingTaxIndex] = this.cloneTaxRow(this.editingTaxSnapshot);
      this.transactionTaxes = [...this.transactionTaxes];
    }
    this.editingTaxIndex = null;
    this.editingTaxSnapshot = null;
  }

  public saveEditTax(index: number): void {
    if (!this.transactionTaxes[index]?.tax) {
      this._toastService.showToast({
        type: 'info',
        message: 'Seleccioná un impuesto',
      });
      return;
    }

    this.changeTax('percentage', index);
    this.editingTaxIndex = null;
    this.editingTaxSnapshot = null;
  }

  private cloneTaxRow(row: Taxes): Taxes {
    return {
      ...row,
      tax: row.tax ? ({ ...row.tax } as Tax) : null,
    };
  }

  public deleteTransactionTax(_transactionTax: Taxes, index: number): void {
    if (this.editingTaxIndex === index) {
      this.editingTaxIndex = null;
      this.editingTaxSnapshot = null;
    } else if (this.editingTaxIndex !== null && index < this.editingTaxIndex) {
      this.editingTaxIndex--;
    }
    this.transactionTaxes.splice(index, 1);
    this.transactionTaxes = [...this.transactionTaxes];
  }

  public taxExists(): boolean {
    let exists: boolean = false;
    if (this.transactionTaxes && this.transactionTaxes.length > 0 && this.transactionTax?.tax) {
      for (const taxTransactionAux of this.transactionTaxes) {
        if (taxTransactionAux.tax?._id === this.transactionTax.tax._id) {
          exists = true;
          this._toastService.showToast({
            type: 'info',
            message:
              'El impuesto ' +
              this.transactionTax.tax.name +
              ' con porcentaje ' +
              this.transactionTax.percentage +
              ' ya existe',
          });
        }
      }
    }
    return exists;
  }
}
