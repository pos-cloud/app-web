import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Tax, TaxBase, TaxClassification, Taxes, Transaction } from '@types';
import { TaxService } from 'app/core/services/tax.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { TransactionService } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-apply-taxes-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-taxes-transactions.components.html',
  providers: [NgbAlertConfig, TranslateMePipe],
})
export class ApplyTaxesTransactionsComponent implements OnInit {
  public transactionTax: Taxes;
  public transactionTaxes: Taxes[] = [];
  public taxes: Tax[] = [];
  public taxesForm: UntypedFormGroup;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber: RoundNumberPipe = new RoundNumberPipe();
  private destroy$ = new Subject<void>();

  @Input() transaction: Transaction;
  @Input() filtersTaxClassification: TaxClassification[];

  public formErrors = {
    tax: '',
    percentage: '',
    taxAmount: '',
  };

  public validationMessages = {
    tax: { required: 'Este campo es requerido.' },
    percentage: {},
    taxAmount: {},
  };

  constructor(
    public _taxService: TaxService,
    public _transactionService: TransactionService,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {
    this.transactionTax = this.createEmptyTax();

    this.taxesForm = this._fb.group({
      tax: [this.transactionTax.tax, [Validators.required]],
      percentage: [this.transactionTax.percentage, []],
      taxAmount: [this.transactionTax.taxAmount, []],
    });
  }

  async ngOnInit(): Promise<void> {
    if (!this.transactionTaxes?.length && this.transaction?.taxes?.length) {
      this.transactionTaxes = [...this.transaction.taxes];
    }

    await this.getTaxes().then((taxes) => {
      if (taxes) {
        this.taxes = taxes;
      }
    });
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  private createEmptyTax(): Taxes {
    return {
      _id: null,
      tax: null,
      percentage: 0,
      taxBase: 0,
      taxAmount: 0,
    };
  }

  public setValueForm(): void {
    const values = {
      tax: this.transactionTax?.tax ?? null,
      percentage: this.transactionTax?.percentage ?? 0,
      taxAmount: this.transactionTax?.taxAmount ?? 0,
    };

    this.taxesForm.setValue(values);
  }

  public getTaxes(): Promise<Tax[]> {
    return new Promise<Tax[]>((resolve) => {
      this._taxService
        .getAll({
          match: {
            classification: { $in: this.filtersTaxClassification },
            operationType: { $ne: 'D' },
          },
        })
        .subscribe({
          next: (result) => {
            resolve(result.result ?? []);
          },
          error: (error) => {
            this._toastService.showToast(error);
            resolve([]);
          },
        });
    });
  }

  public changeTax(op: string): void {
    if (this.taxesForm.value.tax) {
      let taxedAmount = 0;
      if (this.transaction) {
        taxedAmount = Number(this.roundNumber.transform(this.transaction.basePrice));
      }

      switch (op) {
        case 'tax':
          this.transactionTax.tax = this.taxesForm.value.tax;
          this.transactionTax.percentage = this.transactionTax.tax.percentage;
          this.transactionTax.taxAmount = this.transactionTax.tax.amount;
          if (this.transactionTax.percentage && this.transactionTax.percentage !== 0) {
            if (this.transactionTax.tax.taxBase === TaxBase.Neto) {
              this.transactionTax.taxBase = this.roundNumber.transform(taxedAmount);
              this.transactionTax.taxAmount = this.roundNumber.transform(
                (this.transactionTax.taxBase * this.transactionTax.percentage) / 100
              );
            }
          }
          break;
        case 'percentage':
          this.transactionTax.tax = this.taxesForm.value.tax;
          this.transactionTax.percentage = this.taxesForm.value.percentage;
          this.transactionTax.taxAmount = this.transactionTax.tax.amount;
          if (this.transactionTax.percentage && this.transactionTax.percentage !== 0) {
            if (this.transactionTax.tax.taxBase === TaxBase.Neto) {
              this.transactionTax.taxBase = this.roundNumber.transform(taxedAmount);
              this.transactionTax.taxAmount = this.roundNumber.transform(
                (this.transactionTax.taxBase * this.transactionTax.percentage) / 100
              );
            }
          }
          break;
        case 'taxAmount':
          this.transactionTax.tax = this.taxesForm.value.tax;
          this.transactionTax.taxAmount = this.taxesForm.value.taxAmount;
          if (this.transactionTax.percentage && this.transactionTax.percentage !== 0) {
            if (this.transactionTax.tax.taxBase === TaxBase.Neto) {
              this.transactionTax.taxBase = this.roundNumber.transform(taxedAmount);
              this.taxesForm.value.percentage = this.roundNumber.transform(
                (this.transactionTax.taxAmount * 100) / this.transactionTax.taxBase
              );
              this.transactionTax.percentage = this.taxesForm.value.percentage;
            }
          }
          break;
        default:
          break;
      }
      this.setValueForm();
    }
  }

  private updateTransaction() {
    return this._transactionService.update(this.transaction);
  }

  public recalculateTaxes(): void {
    if (this.taxExists()) {
      return;
    }

    this.loading = true;

    this.transactionTaxes = [...this.transactionTaxes, { ...this.transactionTax }];

    this.transaction.taxes = [...this.transactionTaxes];

    this.updateTransaction()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((response) => {
          if (response.status !== 200) {
            throw new Error(response.message || 'Error al actualizar la transacción');
          }

          return this._transactionService.recalculateTaxes(this.transaction);
        })
      )
      .subscribe({
        next: () => {},
        error: (error) => {
          this.loading = false;

          this._toastService.showToast({
            type: 'error',
            message: error?.message || 'Error al actualizar o recalcular la transacción',
          });
        },
        complete: () => {
          this.loading = false;

          this.transactionTax = this.createEmptyTax();
          this.setValueForm();

          this._toastService.showToast({
            type: 'success',
            message: 'Impuestos recalculados correctamente',
          });
        },
      });
  }

  public deleteTransactionTax(_transactionTax: Taxes, index: number): void {
    this.loading = true;

    this.transactionTaxes.splice(index, 1);
    this.transaction.taxes = [...this.transactionTaxes];

    this.updateTransaction()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((response) => {
          if (response.status !== 200) {
            throw new Error(response.message || 'Error al actualizar la transacción');
          }

          return this._transactionService.recalculateTaxes(this.transaction);
        })
      )
      .subscribe({
        next: () => {},
        error: (error) => {
          this.loading = false;

          this._toastService.showToast({
            type: 'error',
            message: error?.message || 'Error al actualizar o recalcular la transacción',
          });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public taxExists(): boolean {
    let exists: boolean = false;

    if (this.transactionTaxes && this.transactionTaxes.length > 0) {
      for (let taxTransactionAux of this.transactionTaxes) {
        if (taxTransactionAux.tax._id === this.transactionTax.tax._id) {
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

  public accept(): void {
    this.activeModal.close(this.transactionTaxes);
  }

  public dismiss(): void {
    this.activeModal.dismiss();
  }
}
