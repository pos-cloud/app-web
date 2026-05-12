import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RoundNumberPipe } from '@shared/pipes/round-number.pipe';
import {
  Article,
  Bank,
  CompanyType,
  Currency,
  MovementOfArticle,
  MovementOfCash,
  PaymentMethod,
  StatusCheck,
  Taxes,
  Transaction,
  TransactionState,
} from '@types';
import { ArticleService } from 'app/core/services/article.service';
import { BankService } from 'app/core/services/bank.service';
import { CurrencyService } from 'app/core/services/currency.service';
import { MovementOfArticleService } from 'app/core/services/movement-of-article.service';
import { MovementOfCashService } from 'app/core/services/movement-of-cash.service';
import { PaymentMethodService } from 'app/core/services/payment-method.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { SelectCompanyComponent } from 'app/modules/entities/company/select-company/select-company.component';
import { ConfirmationQuestionComponent } from 'app/shared/components/confirm/confirmation-question.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { UploadFileComponent } from 'app/shared/components/upload-file/upload-file.component';
import { NumericTextDirective } from 'app/shared/directives/numeric-text.directive';
import * as moment from 'moment';
import { combineLatest, finalize, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-formal-transaction-view',
  standalone: true,
  imports: [
    CommonModule,
    NgbNavModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    TypeaheadDropdownComponent,
    UploadFileComponent,
    DateTimePickerComponent,
    NumericTextDirective,
  ],
  templateUrl: './formal-transaction-view.component.html',
  styleUrls: ['./formal-transaction-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FormalTransactionViewComponent implements OnInit {
  public transaction: Transaction;
  /** URL del último archivo subido desde el encabezado (imagen/PDF). */
  public formalDocumentUrl: string | null = null;
  public transactionId: string | null = null;
  public movementsOfArticles: MovementOfArticle[] = [];
  public movementsOfCash: MovementOfCash[] = [];
  public loading: boolean = false;
  public activeTab: string = 'products';

  // Propiedades para agregar producto
  public showAddProductForm: boolean = false;
  public addProductForm: FormGroup;
  public articles: Article[] = [];
  public articlesWithCompleteProviderData: Article[] = [];
  public selectedArticle: any = null;
  public editingProductId: string | null = null;
  public showAddPaymentForm: boolean = false;
  public addPaymentForm: FormGroup;
  public paymentMethods: PaymentMethod[] = [];
  public banks: Bank[] = [];
  public selectedPaymentMethod: PaymentMethod | null = null;
  public editingPaymentId: string | null = null;
  public currencies: Currency[] = [];
  public currencyControl: FormControl = new FormControl(null);
  public isEditingObservation: boolean = false;
  public observationDraft: string = '';
  public isEditingTotal: boolean = false;
  public totalDraft: number = 0;
  public isEditingDiscount: boolean = false;
  public discountPercentDraft: number = 0;
  public discountAmountDraft: number = 0;
  public isEditingLetter: boolean = false;
  public isEditingOrigin: boolean = false;
  public isEditingInvoiceNumber: boolean = false;
  public letterDraft: string = '';
  public originDraft: number = 0;
  public numberDraft: number = 1;
  public letterOptions: string[] = ['A', 'B', 'C', 'M', 'R', 'E', 'X', 'Z', 'T', 'D'];
  public transactionEndDateDraft: string = new Date().toISOString();
  public roundNumber: RoundNumberPipe = new RoundNumberPipe();

  private destroy$ = new Subject<void>();

  /** Tipo de transacción configurado para llevar impuestos por línea (maestro tipo comprobante). */
  public get requestTaxes(): boolean {
    return !!this.transaction?.type?.requestTaxes;
  }

  /** Si el comprobante es electrónico. */
  public get isElectronicTransaction(): boolean {
    return !!this.transaction?.type?.electronics;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private movementOfArticleService: MovementOfArticleService,
    private movementOfCashService: MovementOfCashService,
    private paymentMethodService: PaymentMethodService,
    private currencyService: CurrencyService,
    private modal: NgbModal,
    private toastService: ToastService,
    private fb: FormBuilder,
    private articleService: ArticleService,
    private bankService: BankService,
    private _toastService: ToastService
  ) {
    this.initAddProductForm();
    this.initAddPaymentForm();
  }

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id');

    this.currencyControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.onCurrencyControlChange(value);
    });

    combineLatest({
      currencies: this.currencyService.find({ query: { operationType: { $ne: 'D' } } }),
      articles: this.articleService.find({ query: { operationType: { $ne: 'D' } } }),
      paymentMethods: this.paymentMethodService.find({ query: { operationType: { $ne: 'D' } } }),
      banks: this.bankService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ currencies, articles, paymentMethods, banks }) => {
          this.currencies = currencies || [];
          this.articles = articles || [];
          this.articlesWithCompleteProviderData = articles.filter((article) => article.codeProvider) || [];
          this.paymentMethods = paymentMethods || [];
          this.banks = banks || [];
          if (this.transactionId) {
            this.loadTransaction();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
  }

  private initAddProductForm(): void {
    this.addProductForm = this.fb.group({
      article: [null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [null, [Validators.required, Validators.min(0)]],
      discountRate: [null, [Validators.min(0), Validators.max(100)]],
    });

    this.addProductForm
      .get('article')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((articleValue) => {
        this.selectedArticle =
          this.articles.find((article) => article._id.toString() === articleValue?._id?.toString()) || null;

        if (this.selectedArticle) {
          // Normaliza el control al registro de `articles` (ngbTypeahead guarda el objeto elegido, no el _id).
          this.addProductForm.patchValue(
            {
              article: this.selectedArticle,
              unitPrice: this.selectedArticle.basePrice ?? null,
            },
            { emitEvent: false }
          );
        }
      });
  }

  private initAddPaymentForm(): void {
    this.addPaymentForm = this.fb.group({
      paymentMethod: [null, [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      comprobante: [''],
      expirationDate: [''],
      bank: [null],
      titular: [''],
      cuit: [''],
    });
    this.addPaymentForm
      .get('paymentMethod')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.selectedPaymentMethod =
          this.paymentMethods.find((method) => method._id.toString() === value?._id?.toString()) || null;
        this.syncPaymentCheckValidators();

        if (this.paymentRequiresCheck && !this.editingPaymentId) {
          const exp = this.addPaymentForm.get('expirationDate');
          if (exp && !exp.value) {
            exp.patchValue(this.defaultCheckExpirationDateInput(), { emitEvent: false });
          }
        }
      });

    this.syncPaymentCheckValidators();
  }

  public get paymentRequiresCheck(): boolean {
    return this.selectedPaymentMethod?.checkDetail === true;
  }

  /** Si el método de pago exige banco (configuración `allowBank`). */
  public get paymentRequiresBank(): boolean {
    return this.selectedPaymentMethod?.allowBank === true;
  }

  private syncPaymentCheckValidators(): void {
    const check = this.paymentRequiresCheck;

    for (const name of ['comprobante', 'expirationDate', 'bank', 'titular', 'cuit'] as const) {
      const c = this.addPaymentForm.get(name);
      if (!c) {
        continue;
      }

      const validators: any[] = [];
      if (check && name === 'comprobante') {
        validators.push(Validators.required);
      }

      c.setValidators(validators);
      c.updateValueAndValidity({ emitEvent: false });
    }
  }

  private defaultCheckExpirationDateInput(): string {
    const src = this.transaction?.endDate || this.transaction?.startDate;
    return src ? moment(src).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
  }

  private parseCheckExpirationForInput(iso: string | undefined | null): string {
    if (!iso) {
      return '';
    }
    return moment(iso).format('YYYY-MM-DD');
  }

  private serializeCheckExpirationDate(dateInput: string): string {
    if (!dateInput) {
      return moment().format('YYYY-MM-DDTHH:mm:ssZ');
    }
    return moment(dateInput, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
  }

  /** Datos extra del método de pago: cheque (`checkDetail`) y/o banco (`allowBank`), como en add-movement-of-cash. */
  private applyPaymentMethodDetailsToMovement(movement: MovementOfCash): void {
    const pm = this.selectedPaymentMethod;
    if (!pm) {
      return;
    }

    if (pm.allowBank) {
      movement.bank = (this.addPaymentForm.get('bank')?.value as Bank) ?? undefined;
    } else {
      movement.bank = undefined;
    }

    if (pm.checkDetail) {
      movement.number = String(this.addPaymentForm.get('comprobante')?.value ?? '').trim();
      movement.expirationDate = this.serializeCheckExpirationDate(
        String(this.addPaymentForm.get('expirationDate')?.value ?? '')
      );
      movement.titular = String(this.addPaymentForm.get('titular')?.value ?? '').trim();
      movement.CUIT = String(this.addPaymentForm.get('cuit')?.value ?? '').replace(/\D/g, '');
      movement.bank = (this.addPaymentForm.get('bank')?.value as Bank) ?? undefined;
    }
  }
  private refresh(): void {
    this.loadTransaction();
  }

  private loadTransaction(): void {
    this.loading = true;

    this.transactionService
      .getById(this.transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result && result && result.status === 200) {
            this.transaction = result.result;
            this.transactionEndDateDraft =
              this.transaction?.endDate || this.transaction?.startDate || this.transactionEndDateDraft;
            this.syncCurrencyControlFromTransaction();
            this.getMovementsOfArticlesByTransaction();
            this.getMovementsOfCashesByTransaction();
          } else {
            this.loading = false;
            this.toastService.showToast({
              message: 'No se encontró la transacción',
              type: 'error',
            });
            this.router.navigate(['/']);
          }
        },
        error: () => {
          this.loading = false;
          this.toastService.showToast({
            message: 'Error al cargar la transacción',
            type: 'error',
          });
          this.router.navigate(['/']);
        },
      });
  }

  private getMovementsOfArticlesByTransaction(): void {
    this.loading = true;
    this.movementOfArticleService
      .getMovementsOfArticlesByTransaction(this.transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.movementsOfArticles = result?.result || [];
          // const totalsChanged = this.applyTransactionTotalsFromLines();
          // if (totalsChanged) {
          //   this.syncTransactionTotalsSilently();
          // }
        },
        error: () => {
          this.loading = false;
          this.toastService.showToast({
            message: 'Error al cargar movimientos de artículos',
            type: 'error',
          });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private getMovementsOfCashesByTransaction(): void {
    this.loading = true;
    const data = {
      project: {
        transaction: 1,
        number: 1,
        expirationDate: 1,
        titular: 1,
        CUIT: 1,
        'type.name': 1,
        'type._id': 1,
        'bank.name': 1,
        'bank._id': 1,
        operationType: 1,
        amountPaid: 1,
        date: 1,
      },
      match: { transaction: { $oid: this.transactionId }, operationType: { $ne: 'D' } },
    };
    this.movementOfCashService
      .getAll(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.movementsOfCash = result?.result || [];
        },
        error: () => {
          this.loading = false;
          this.toastService.showToast({
            message: 'Error al cargar movimientos de caja',
            type: 'error',
          });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  /** El typeahead guarda el objeto elegido; al cargar la transacción usamos el mismo formato para el texto visible. */
  private syncCurrencyControlFromTransaction(): void {
    const raw = this.transaction?.currency as Currency | string | undefined;
    if (raw == null) {
      this.currencyControl.setValue(null, { emitEvent: false });
      return;
    }
    const id = typeof raw === 'string' ? raw : raw._id;
    if (!id) {
      this.currencyControl.setValue(null, { emitEvent: false });
      return;
    }
    const fromList = this.currencies.find((c) => String(c._id) === String(id));
    const embedded = typeof raw === 'object' ? raw : null;
    this.currencyControl.setValue(fromList ?? embedded, { emitEvent: false });
  }

  private currencyIdFromControlValue(value: unknown): string | null {
    if (value == null || value === '') {
      return null;
    }
    if (typeof value === 'object' && '_id' in (value as object)) {
      const id = (value as Currency)._id;
      return id != null ? String(id) : null;
    }
    return String(value);
  }

  private onCurrencyControlChange(value: unknown): void {
    const valueId = this.currencyIdFromControlValue(value);
    const currency = (valueId ? this.currencies.find((c) => String(c._id) === valueId) : null) || null;
    if (!currency?._id) {
      return;
    }
    const currentId = this.currencyIdFromControlValue(this.transaction.currency);
    if (String(currency._id) === currentId) {
      return;
    }
    this.transaction.currency = { _id: currency._id } as Currency;
    const quotation = currency?.quotation;
    if (quotation != null && !isNaN(Number(quotation))) {
      this.transaction.quotation = Number(quotation);
    }
    this.updateTransaction('Moneda actualizada correctamente', 'Error al actualizar la moneda');
  }

  public onTransactionDatePickerChange(value: string): void {
    this.transaction.endDate = value;
    this.transaction.expirationDate = this.transaction.endDate;
    this.updateTransaction('Fecha actualizada correctamente', 'Error al actualizar la fecha');
  }

  public onLetterBlur(): void {
    const normalized = (this.letterDraft || '').trim().toUpperCase();
    const current = (this.transaction?.letter || '').trim().toUpperCase();
    if (normalized === current) {
      return;
    }
    if (!normalized) {
      this.letterDraft = current;
      return;
    }
    const allowed = this.letterOptions;
    if (!allowed.includes(normalized)) {
      this.toastService.showToast({
        message: `Letra no válida. Permitidas: ${allowed.join(', ')}`,
        type: 'info',
      });
      this.letterDraft = current;
      return;
    }
    this.transaction.letter = normalized;
    this.updateTransaction('Letra actualizada correctamente', 'Error al actualizar la letra');
  }

  public startEditLetter(): void {
    this.isEditingLetter = true;
    this.letterDraft = (this.transaction?.letter || '').trim().toUpperCase();
  }

  public cancelEditLetter(): void {
    this.isEditingLetter = false;
    this.letterDraft = (this.transaction?.letter || '').trim().toUpperCase();
  }

  public saveLetter(): void {
    this.onLetterBlur();
    this.isEditingLetter = false;
  }

  public onOriginBlur(): void {
    this.transaction.origin = Math.max(0, Math.floor(Number(this.originDraft)));
    this.updateTransaction('Punto de venta actualizado correctamente', 'Error al actualizar el punto de venta');
  }

  public startEditOrigin(): void {
    this.isEditingOrigin = true;
    this.originDraft = this.transaction?.origin ?? 0;
  }

  public cancelEditOrigin(): void {
    this.isEditingOrigin = false;
    this.originDraft = this.transaction?.origin ?? 0;
  }

  public saveOrigin(): void {
    this.onOriginBlur();
    this.isEditingOrigin = false;
  }

  public onInvoiceNumberBlur(): void {
    const n = Math.floor(Number(this.numberDraft));
    const current = Math.floor(Number(this.transaction?.number ?? 1));
    if (isNaN(n) || n < 1) {
      this.numberDraft = current;
      return;
    }
    if (n === current) {
      return;
    }
    this.transaction.number = n;
    this.updateTransaction('Número de factura actualizado correctamente', 'Error al actualizar el número de factura');
  }

  public startEditInvoiceNumber(): void {
    this.isEditingInvoiceNumber = true;
    this.numberDraft = this.transaction?.number ?? 1;
  }

  public cancelEditInvoiceNumber(): void {
    this.isEditingInvoiceNumber = false;
    this.numberDraft = this.transaction?.number ?? 1;
  }

  public saveInvoiceNumber(): void {
    this.onInvoiceNumberBlur();
    this.isEditingInvoiceNumber = false;
  }

  public changeCompany(): void {
    const modalRef = this.modal.open(SelectCompanyComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.type = CompanyType.Provider;
    modalRef.result.then(
      (result) => {
        if (result.company) {
          this.transaction.company = result.company;
          // Actualizar transacción en el servidor
          this.transactionService.update(this.transaction).subscribe({
            next: (response) => {
              if (response.status === 200) {
                this.toastService.showToast({
                  message: 'Cliente actualizado correctamente',
                  type: 'success',
                });
                // Recargar la transacción para asegurar sincronización
                this.loadTransaction();
              } else {
                this.toastService.showToast({
                  message: response.message || 'Error al actualizar el cliente',
                  type: 'error',
                });
                // Revertir el cambio local si falla
                this.loadTransaction();
              }
            },
            error: (error) => {
              this.toastService.showToast({
                message: 'Error al actualizar el cliente',
                type: 'error',
              });
              // Revertir el cambio local si falla
              this.loadTransaction();
            },
          });
        }
      },
      (reason) => {
        // Modal cerrado sin selección
      }
    );
  }

  public startEditObservation(): void {
    this.observationDraft = this.transaction?.observation || '';
    this.isEditingObservation = true;
  }

  public cancelEdit(): void {
    this.isEditingObservation = false;
    this.observationDraft = '';

    this.isEditingTotal = false;
    this.totalDraft = 0;

    this.isEditingDiscount = false;
    this.discountPercentDraft = 0;
    this.discountAmountDraft = 0;
  }

  public saveObservation(): void {
    this.transaction.observation = (this.observationDraft || '').trim();
    this.updateTransaction('Observación actualizada correctamente', 'Error al actualizar la observación');
    this.isEditingObservation = false;
  }

  public startEditDiscount(): void {
    this.isEditingTotal = false;
    this.discountPercentDraft = Number(this.transaction?.discountPercent ?? 0);
    this.discountAmountDraft = Number(this.transaction?.discountAmount ?? 0);
    this.isEditingDiscount = true;
  }

  /** Base sobre la que aplica el descuento de cabecera (= subtotal antes del descuento). */
  public get discountBaseBeforeHeader(): number {
    return this.linesSubtotal;
  }

  /** Subtotal real de líneas (sin descuento de cabecera). */
  private get linesSubtotal(): number {
    return (
      (this.roundNumber.transform(
        this.movementsOfArticles.reduce((sum, movement) => sum + Number(movement.salePrice || 0), 0)
      ) as number) || 0
    );
  }

  /** Al cambiar el %, calcula el monto sobre el subtotal. */
  public onDiscountPercentDraftChange(value: number | string | null): void {
    const base = this.discountBaseBeforeHeader;
    const pct = Math.min(100, Math.max(0, Number(value) || 0));
    this.discountPercentDraft = this.roundNumber.transform(pct) as number;
    this.discountAmountDraft = base > 0 ? (this.roundNumber.transform((base * pct) / 100) as number) : 0;
  }

  /** Al cambiar el monto, calcula el % sobre el subtotal. */
  public onDiscountAmountDraftChange(value: number | string | null): void {
    const base = this.discountBaseBeforeHeader;
    let amt = Math.max(0, Number(value) || 0);
    if (base > 0 && amt > base) {
      amt = base;
    }
    this.discountAmountDraft = this.roundNumber.transform(amt) as number;
    this.discountPercentDraft = base > 0 ? (this.roundNumber.transform((amt / base) * 100) as number) : 0;
  }

  public saveDiscount(): void {
    const base = this.discountBaseBeforeHeader;
    const pctDraft = Number(this.discountPercentDraft);
    const amtDraft = Number(this.discountAmountDraft);
    const amt = this.roundNumber.transform(Math.min(base, Math.max(0, amtDraft || 0))) as number;
    const pct = base > 0 ? (this.roundNumber.transform((amt / base) * 100) as number) || 0 : 0;
    if (isNaN(pctDraft) || pctDraft < 0 || pctDraft > 100) {
      this.toastService.showToast({
        message: 'Ingresá un porcentaje entre 0 y 100',
        type: 'info',
      });
      return;
    }
    if (isNaN(amtDraft) || amtDraft < 0) {
      this.toastService.showToast({
        message: 'Ingresá un monto de descuento válido',
        type: 'info',
      });
      return;
    }

    this.transaction.discountPercent = pct;
    this.transaction.discountAmount = amt;
    /** Total neto coherente con el subtotal: base (líneas + desc. cabecera anterior) − nuevo descuento. */
    this.transaction.totalPrice = this.roundNumber.transform(Math.max(0, base - amt));
    this.updateTransaction('Descuento actualizado correctamente', 'Error al actualizar el descuento');
    this.isEditingDiscount = false;
  }

  public startEditTotal(): void {
    this.isEditingDiscount = false;
    this.totalDraft = Number(this.transaction?.totalPrice || 0);
    this.isEditingTotal = true;
  }

  public saveTotal(): void {
    const total = Number(this.totalDraft);
    const base = this.linesSubtotal;
    if (isNaN(total) || total < 0) {
      this.toastService.showToast({
        message: 'Ingresá un total válido',
        type: 'info',
      });
      return;
    }

    const discountAmount = this.roundNumber.transform(Math.max(0, base - total)) as number;
    const discountPercent = base > 0 ? (this.roundNumber.transform((discountAmount / base) * 100) as number) || 0 : 0;
    this.transaction.discountAmount = discountAmount;
    this.transaction.discountPercent = discountPercent;
    this.transaction.totalPrice = this.roundNumber.transform(total) as number;
    this.updateTransaction('Total actualizado correctamente', 'Error al actualizar el total');
    this.isEditingTotal = false;
  }

  private updateTransaction(
    successMessage: string,
    errorMessage: string,
    onSuccess?: () => void
  ): void {
    this.transactionService.update(this.transaction).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.toastService.showToast({
            message: successMessage,
            type: 'success',
          });
          if (onSuccess) {
            onSuccess();
          } else {
            this.loadTransaction();
          }
        } else {
          this.toastService.showToast({
            message: response.message || errorMessage,
            type: 'error',
          });
          this.loadTransaction();
        }
      },
      error: () => {
        this.toastService.showToast({
          message: errorMessage,
          type: 'error',
        });
        this.loadTransaction();
      },
    });
  }

  public get subtotal(): number {
    return this.linesSubtotal;
  }

  public get totalTaxesAmount(): number {
    return this.movementsOfArticles.reduce((total, movement) => {
      if (movement.taxes && movement.taxes.length > 0) {
        return total + movement.taxes.reduce((taxTotal, tax) => taxTotal + (tax.taxAmount || 0), 0);
      }
      return total;
    }, 0);
  }

  public get totalTaxesBase(): number {
    return this.movementsOfArticles.reduce((total, movement) => {
      if (movement.taxes && movement.taxes.length > 0) {
        return total + movement.taxes.reduce((taxTotal, tax) => taxTotal + (tax.taxBase || 0), 0);
      }
      return total;
    }, 0);
  }

  /** Impuestos / base para el pie: totales de cabecera si vienen en la transacción, si no desde líneas. */
  public get footerTaxAmount(): number {
    const taxes = this.transaction?.taxes;
    if (taxes?.length) {
      return taxes.reduce((sum, row) => sum + Number(row?.taxAmount ?? 0), 0);
    }
    return this.totalTaxesAmount;
  }

  public get footerTaxBase(): number {
    const taxes = this.transaction?.taxes;
    if (taxes?.length) {
      return taxes?.reduce((sum, row) => sum + Number(row?.taxBase ?? 0), 0);
    }
    return this.totalTaxesBase;
  }

  public get totalQuantity(): number {
    return this.movementsOfArticles.reduce((total, movement) => total + movement?.amount, 0);
  }

  public get totalPaid(): number {
    return this.movementsOfCash.reduce((total, movement) => total + movement?.amountPaid, 0);
  }

  public get balance(): number {
    return this.transaction?.totalPrice - this.totalPaid;
  }

  /** Transacción en estado abierto y el tipo permite cerrarla desde la vista formal. */
  public get canFinalizeTransaction(): boolean {
    if (!this.transaction?.type || this.transaction.type.allowTransactionClose === false) {
      return false;
    }
    return this.transaction.state === TransactionState.Open;
  }

  /** Pasa de Abierto a Cerrado (o al `finishState` del tipo de comprobante). */
  public finalizeOpenTransaction(): void {
    if (!this.canFinalizeTransaction) {
      return;
    }

    const modalRef = this.modal.open(ConfirmationQuestionComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.title = 'Finalizar transacción';
    modalRef.componentInstance.subtitle =
      '¿Deseás cerrar esta transacción? Quedará registrada como finalizada.';

    modalRef.result
      .then((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }
        const nextState = this.transaction.type?.finishState ?? TransactionState.Closed;
        this.transaction.state = nextState;
        this.updateTransaction(
          'Transacción finalizada correctamente',
          'No se pudo finalizar la transacción',
          () => this.router.navigateByUrl('/pos/mostrador/compra')
        );
      })
      .catch(() => {});
  }

  public getStateText(): string {
    switch (this.transaction?.state) {
      case TransactionState.Open:
        return 'ABIERTO';
      case TransactionState.Closed:
        return 'FINALIZADA';
      case TransactionState.Canceled:
        return 'CANCELADA';
      default:
        return typeof this.transaction?.state === 'string' ? this.transaction?.state : 'ABIERTO';
    }
  }

  public getStateClass(): string {
    switch (this.transaction?.state) {
      case TransactionState.Open:
        return 'badge-warning';
      case TransactionState.Closed:
        return 'badge-success';
      case TransactionState.Canceled:
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  /** Importe final de línea tras aplicar descuento %. */
  public get addProductLineSalePrice(): number {
    if (!this.addProductForm) {
      return 0;
    }
    const quantity = Number(this.addProductForm.get('quantity')?.value) || 0;
    const unitPrice = Number(this.addProductForm.get('unitPrice')?.value) || 0;
    const rate = Math.min(100, Math.max(0, Number(this.addProductForm.get('discountRate')?.value) || 0));
    const gross = this.roundNumber.transform(quantity * unitPrice) as number;
    const discountAmount = this.roundNumber.transform(gross * (rate / 100)) as number;
    return this.roundNumber.transform(gross - discountAmount) as number;
  }

  private computeProductLineFromForm(): {
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    discountRate: number;
    salePrice: number;
    taxes: Taxes[];
  } {
    const article = this.addProductForm.get('article')?.value as Article;

    const quantity = Number(this.addProductForm.get('quantity')?.value) || 0;
    const formUnitPrice = Number(this.addProductForm.get('unitPrice')?.value) || 0;

    let discountRate = Number(this.addProductForm.get('discountRate')?.value) || 0;
    discountRate = Math.min(100, Math.max(0, discountRate));

    const requestTaxes = this.transaction.type.requestTaxes;
    // Precio unitario final
    const unitPrice = this.roundNumber.transform(
      requestTaxes ? (formUnitPrice === article.basePrice ? article.salePrice : formUnitPrice) : formUnitPrice
    );
    // Subtotal antes del descuento
    const subtotal = this.roundNumber.transform(unitPrice * quantity);
    // Descuento total
    const discountAmount = this.roundNumber.transform(subtotal * (discountRate / 100));

    // Total final
    const salePrice = this.roundNumber.transform(subtotal - discountAmount);

    const taxes: Taxes[] = [];
    if (requestTaxes) {
      for (const tax of article.taxes) {
        const taxAux: Taxes = {
          _id: tax._id,
          percentage: tax.percentage,
          tax: tax.tax,
          taxBase: this.roundNumber.transform(salePrice / (1 + tax.percentage / 100), 2),
          taxAmount: this.roundNumber.transform(salePrice - salePrice / (1 + tax.percentage / 100), 2),
        };
        taxes.push(taxAux);
      }
    }

    return {
      quantity,
      unitPrice,
      discountAmount,
      discountRate,
      salePrice,
      taxes,
    };
  }

  public onInvoiceUpload(e: { urls: string[]; invoice: unknown | null }): void {
    const inv = e.invoice as Record<string, unknown> | null;
    const firstUrl = e.urls?.[0];

    if (!inv && firstUrl == null) {
      this.toastService.showToast(null, 'danger', '', 'No se pudo procesar el archivo');
      return;
    }

    this.formalDocumentUrl = (inv?.['documentUrl'] ??
      inv?.['url'] ??
      inv?.['fileUrl'] ??
      firstUrl ??
      this.formalDocumentUrl) as string | null;

    this.syncTransactionFromTextract(inv ?? firstUrl);
  }

  private syncTransactionFromTextract(textract: unknown): void {
    const transactionId = this.transaction._id;
    if (!transactionId) {
      return;
    }

    this.transactionService
      .transactionByTextract(textract, transactionId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadTransaction())
      )
      .subscribe({
        next: (res) => {
          if (res.status && res.status >= 400) {
            this.toastService.showToast(null, 'danger', '', 'Error al sincronizar la transacción');
            return;
          }
          this.toastService.showToast(null, 'success', '', 'Factura aplicada correctamente');
        },
      });
  }

  public cancelAddProduct(): void {
    this.showAddProductForm = false;
    this.addProductForm.reset();
    this.selectedArticle = null;
    this.editingProductId = null;
  }

  public addPayment(): void {
    this.editingPaymentId = null;
    this.showAddPaymentForm = true;
    this.addPaymentForm.reset({
      paymentMethod: null,
      amount: null,
      comprobante: '',
      expirationDate: '',
      bank: null,
      titular: '',
      cuit: '',
    });
    this.selectedPaymentMethod = null;
    this.syncPaymentCheckValidators();
  }

  public addProduct(): void {
    this.editingProductId = null;
    this.showAddProductForm = true;
    this.addProductForm.reset();
    this.addProductForm.patchValue({
      quantity: 1,
      unitPrice: null,
      discountRate: null,
    });
  }

  public savePayment(): void {
    const rawAmount = this.addPaymentForm.get('amount')?.value;
    const amount = Number(rawAmount);
    if (rawAmount == null || rawAmount === '' || isNaN(amount) || amount < 0.01) {
      this.addPaymentForm.get('amount')?.markAsTouched();
      this.toastService.showToast({
        message: 'Ingresá un monto válido',
        type: 'info',
      });
      return;
    }

    if (this.editingPaymentId) {
      const movementToUpdate = this.movementsOfCash.find((movement) => movement._id === this.editingPaymentId);
      if (!movementToUpdate) {
        this.toastService.showToast({
          message: 'No se encontró el pago para editar',
          type: 'error',
        });
        return;
      }

      this.selectedPaymentMethod =
        this.paymentMethods.find(
          (method) => method._id.toString() === this.addPaymentForm.get('paymentMethod')?.value?._id?.toString()
        ) ||
        this.paymentMethods.find((method) => method._id.toString() === movementToUpdate.type?._id?.toString()) ||
        null;

      if (!this.addPaymentForm.valid) {
        this.addPaymentForm.markAllAsTouched();
        this.toastService.showToast({
          message: 'Completá los datos del método de pago',
          type: 'info',
        });
        return;
      }

      const movementToSave = {
        ...movementToUpdate,
        transaction: this.transaction,
        type: movementToUpdate.type,
        amountPaid: amount,
      } as MovementOfCash;

      if (this.paymentRequiresCheck || this.paymentRequiresBank) {
        this.applyPaymentMethodDetailsToMovement(movementToSave);
      }

      this.movementOfCashService.update(movementToSave).subscribe({
        next: (response) => {
          if (response?.status === 200) {
            this.toastService.showToast({
              message: 'Pago actualizado exitosamente',
              type: 'success',
            });
            this.showAddPaymentForm = false;
            this.editingPaymentId = null;
          } else {
            this.toastService.showToast({
              message: response?.message || 'Error al actualizar el pago',
              type: 'error',
            });
          }
        },
        error: () => {
          this.toastService.showToast({
            message: 'Error al actualizar el pago',
            type: 'error',
          });
        },
        complete: () => {
          this.refresh();
        },
      });
      return;
    }

    this.selectedPaymentMethod =
      this.paymentMethods.find(
        (method) => method._id.toString() === this.addPaymentForm.get('paymentMethod')?.value?._id?.toString()
      ) || null;

    if (!this.addPaymentForm.valid || !this.selectedPaymentMethod) {
      this.addPaymentForm.markAllAsTouched();
      this.toastService.showToast({
        message: 'Seleccioná un método de pago válido para continuar',
        type: 'info',
      });
      return;
    }

    const baseDate = this.transaction.endDate || this.transaction.startDate || new Date().toISOString();
    let movement: MovementOfCash;
    movement = {
      ...movement,
      transaction: this.transaction,
      type: this.selectedPaymentMethod,
      amountPaid: amount,
      date: baseDate,
      expirationDate: baseDate,
      paymentChange: 0,
      statusCheck: StatusCheck.Closed,
    };
    if (this.paymentRequiresCheck || this.paymentRequiresBank) {
      this.applyPaymentMethodDetailsToMovement(movement);
    }

    this.movementOfCashService.save(movement).subscribe({
      next: (response) => {
        if (response?.status === 200) {
          this.toastService.showToast({
            message: 'Pago agregado exitosamente',
            type: 'success',
          });
          this.showAddPaymentForm = false;
          this.editingPaymentId = null;
        } else {
          this.toastService.showToast({
            message: response?.message || 'Error al agregar el pago',
            type: 'error',
          });
        }
      },
      error: () => {
        this.toastService.showToast({
          message: 'Error al agregar el pago',
          type: 'error',
        });
      },
      complete: () => {
        this.refresh();
      },
    });
  }

  public saveProduct(): void {
    let articleId = String(this.addProductForm.get('article')?.value?._id ?? '');
    this.selectedArticle = this.articles.find((article) => article._id.toString() === articleId?.toString()) || null;

    if (this.addProductForm.valid && this.selectedArticle) {
      const line = this.computeProductLineFromForm();

      if (this.editingProductId) {
        const movementToUpdate = this.movementsOfArticles.find((movement) => movement._id === this.editingProductId);
        if (!movementToUpdate) {
          this.toastService.showToast({
            message: 'No se encontró el producto para editar',
            type: 'error',
          });
          return;
        }

        const updatedMovement: MovementOfArticle = {
          ...movementToUpdate,
          transaction: this.transaction,
          article: this.selectedArticle as any,
          amount: line.quantity,
          unitPrice: line.unitPrice,
          salePrice: line.salePrice,
          discountAmount: line.discountAmount,
          discountRate: line.discountRate,
          taxes: line.taxes,
        };

        this.movementOfArticleService.update(updatedMovement).subscribe({
          next: (result) => {
            if (result?.status === 200 || result?.result) {
              this.toastService.showToast({
                message: 'Producto actualizado exitosamente',
                type: 'success',
              });
              this.showAddProductForm = false;
              this.editingProductId = null;
              this.refresh();
            }
          },
          error: () => {
            this.toastService.showToast({
              message: 'Error al actualizar producto',
              type: 'error',
            });
          },
        });
        return;
      }

      const movementData: Record<string, unknown> = {
        transactionId: this.transaction?._id,
        articleId: this.selectedArticle._id,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        salePrice: line.salePrice,
        recalculateParent: false,
      };

      this.movementOfArticleService.createMovementOfArticle(movementData).subscribe({
        next: (result) => {
          if (result?.result) {
            this.toastService.showToast({
              message: 'Producto agregado exitosamente',
              type: 'success',
            });
            this.showAddProductForm = false;
            this.editingProductId = null;
            this.refresh();
          }
        },
        error: () => {
          this.toastService.showToast({
            message: 'Error al agregar producto',
            type: 'error',
          });
        },
      });
    } else {
      this.addProductForm.markAllAsTouched();
      this.toastService.showToast({
        message: 'Seleccioná un artículo válido para continuar',
        type: 'info',
      });
    }
  }

  public cancelAddPayment(): void {
    this.showAddPaymentForm = false;
    this.addPaymentForm.reset({
      paymentMethod: null,
      amount: null,
      comprobante: '',
      expirationDate: '',
      bank: null,
      titular: '',
      cuit: '',
    });
    this.selectedPaymentMethod = null;
    this.editingPaymentId = null;
    this.syncPaymentCheckValidators();
  }

  public cancelTransaction(): void {
    // TODO: Implementar cancelación de transacción
    this.toastService.showToast('Función de cancelar transacción en desarrollo');
  }

  public editProduct(movement: MovementOfArticle): void {
    this.editingProductId = movement._id;
    this.showAddProductForm = false;

    const articleId = String((movement.article as any)?._id ?? movement.article ?? '');
    this.selectedArticle =
      this.articles.find((article) => article._id === articleId || article._id?.toString() === articleId) || null;

    this.addProductForm.patchValue({
      article: this.selectedArticle || movement.article || null,
      quantity: movement.amount || 1,
      unitPrice: this.roundNumber.transform(movement.unitPrice) as number,
      discountRate: movement.discountRate ?? 0,
    });
  }

  public editPayment(movement: MovementOfCash): void {
    this.editingPaymentId = movement._id;
    this.showAddPaymentForm = true;
    this.selectedPaymentMethod =
      this.paymentMethods.find((method) => method._id.toString() === movement.type?._id?.toString()) ||
      this.paymentMethods.find((method) => method._id.toString() === movement.type._id.toString()) ||
      null;

    let bankVal = (movement.bank as Bank | null) || null;
    if (bankVal?._id) {
      bankVal = this.banks.find((b) => b._id?.toString() === bankVal!._id?.toString()) || bankVal;
    }

    this.addPaymentForm.patchValue({
      paymentMethod: this.selectedPaymentMethod || movement.type || null,
      amount: movement.amountPaid || 0,
      comprobante: movement.number || '',
      expirationDate: this.parseCheckExpirationForInput(movement.expirationDate),
      bank: bankVal,
      titular: movement.titular || '',
      cuit: movement.CUIT ? String(movement.CUIT).replace(/\D/g, '') : '',
    });
    this.syncPaymentCheckValidators();
  }

  public deleteProduct(movement: MovementOfArticle): void {
    if (!movement?._id) {
      return;
    }

    const modalRef = this.modal.open(ConfirmationQuestionComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.title = 'Eliminar producto';
    modalRef.componentInstance.subtitle = '¿Seguro que deseas eliminar este producto de la transacción?';

    modalRef.result
      .then((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.movementOfArticleService.delete(movement._id).subscribe({
          next: (response) => {
            if (response?.status === 200) {
              this.toastService.showToast({
                message: 'Producto eliminado correctamente',
                type: 'success',
              });
              this.refresh();
            } else {
              this.toastService.showToast({
                message: response?.message || 'No se pudo eliminar el producto',
                type: 'error',
              });
            }
          },
          error: () => {
            this.toastService.showToast({
              message: 'Error al eliminar el producto',
              type: 'error',
            });
          },
        });
      })
      .catch(() => {});
  }

  public deletePayment(movement: MovementOfCash): void {
    if (!movement?._id) {
      return;
    }

    const modalRef = this.modal.open(ConfirmationQuestionComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.title = 'Eliminar método de pago';
    modalRef.componentInstance.subtitle = '¿Seguro que deseas eliminar este método de pago?';

    modalRef.result
      .then((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.movementOfCashService.delete(movement._id).subscribe({
          next: (response) => {
            if (response?.status === 200) {
              this.toastService.showToast({
                message: 'Pago eliminado correctamente',
                type: 'success',
              });
              this.refresh();
            } else {
              this.toastService.showToast({
                message: response?.message || 'No se pudo eliminar el pago',
                type: 'error',
              });
            }
          },
          error: () => {
            this.toastService.showToast({
              message: 'Error al eliminar el pago',
              type: 'error',
            });
          },
        });
      })
      .catch(() => {});
  }
  public goBack(): void {
    this.router.navigateByUrl('/pos/mostrador/compra');
  }

  public formatMovementTaxLabel(t: Taxes): string {
    const name = t?.tax?.name || t?.tax?.code || 'Impuesto';
    if (t?.percentage) {
      return `${name} ${t.percentage}%`;
    }
    return name;
  }

  public trackByMovementId(_index: number, movement: MovementOfArticle): string {
    return movement?._id || String(_index);
  }

  public trackByPaymentId(_index: number, movement: MovementOfCash): string {
    return movement?._id || String(_index);
  }
}
