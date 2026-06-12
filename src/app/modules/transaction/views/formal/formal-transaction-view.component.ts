import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { RoundNumberPipe } from '@shared/pipes/round-number.pipe';
import {
  Article,
  Bank,
  CompanyType,
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
import { MovementOfArticleService } from 'app/core/services/movement-of-article.service';
import { MovementOfCashService } from 'app/core/services/movement-of-cash.service';
import { PaymentMethodService } from 'app/core/services/payment-method.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { SelectCompanyComponent } from 'app/modules/entities/company/select-company/select-company.component';
import { ConfirmationQuestionComponent } from 'app/shared/components/confirm/confirmation-question.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { NumericTextDirective } from 'app/shared/directives/numeric-text.directive';
import { combineLatest, finalize, Subject, takeUntil } from 'rxjs';
import { ApplyTaxesTransactionsComponent } from '../../components/apply-taxes-transactions/apply-taxes-transactions.components';
import { ProcessInvoiceUploadComponent } from './component/process-invoice-upload/process-invoice-upload.component';

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
    ProcessInvoiceUploadComponent,
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
  public vatPeriodDraft = '';
  public isEditingObservation: boolean = false;
  public observationDraft: string = '';
  public isEditingSubtotal: boolean = false;
  public subtotalDraft: number = 0;
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
  public editingField: string | null = null;

  private destroy$ = new Subject<void>();

  /** Tipo de transacción configurado para llevar impuestos por línea (maestro tipo comprobante). */
  public get requestTaxes(): boolean {
    return !!this.transaction?.type?.requestTaxes;
  }

  /** El tipo de comprobante exige líneas de artículos (`requestArticles`). */
  public get requestArticles(): boolean {
    return !!this.transaction?.type?.requestArticles;
  }

  /** El tipo de comprobante exige métodos de pago (`requestPaymentMethods`, default true). */
  public get requestPaymentMethods(): boolean {
    return this.transaction?.type?.requestPaymentMethods !== false;
  }

  public get paymentRequiresCheck(): boolean {
    return this.selectedPaymentMethod?.checkDetail === true;
  }

  /** Si el método de pago exige banco (configuración `allowBank`). */
  public get paymentRequiresBank(): boolean {
    return this.selectedPaymentMethod?.allowBank === true;
  }

  public get totalQuantity(): number {
    return this.movementsOfArticles.reduce((total, movement) => total + movement?.amount, 0);
  }

  public get totalPaid(): number {
    return this.movementsOfCash.reduce((total, movement) => total + movement?.amountPaid, 0);
  }

  /**
   * Monto sugerido al agregar un pago nuevo: saldo pendiente (total − pagos), redondeado como el resto de la vista.
   * `null` si no hay saldo pendiente (≥ 0,01); el usuario puede editar el valor en el formulario.
   */
  public get suggestedNewPaymentAmount(): number | null {
    if (!this.transaction) {
      return null;
    }
    const due = this.roundNumber.transform(this.transaction.totalPrice) as number;
    const paid = this.roundNumber.transform(this.totalPaid) as number;
    const remaining = this.roundNumber.transform(Math.max(0, due - paid)) as number;
    return remaining >= 0.01 ? remaining : null;
  }

  /** Transacción abierta y el tipo permite ver / usar el cierre desde la vista formal. */
  public get canShowFinalizeTransactionButton(): boolean {
    if (!this.transaction?.type || this.transaction.type.allowTransactionClose === false) {
      return false;
    }
    return this.transaction.state === TransactionState.Open;
  }

  /** Suma de `movementsOfCash` alcanza el total de la transacción (mismos redondeos que el resto de la vista). */
  public get paymentsCoverTransactionTotal(): boolean {
    if (!this.transaction) {
      return false;
    }
    if (!this.requestPaymentMethods) {
      return true;
    }
    const due = this.roundNumber.transform(this.transaction.totalPrice) as number;
    const paid = this.roundNumber.transform(this.totalPaid) as number;
    if (due === 0 && this.requestPaymentMethods === true) {
      return false;
    }
    return paid >= due;
  }

  public get addProductLineSalePrice(): number {
    if (!this.addProductForm) {
      return 0;
    }
    const quantity = Number(this.addProductForm.get('quantity')?.value) || 0;
    const basePrice = Number(this.addProductForm.get('basePrice')?.value) || 0;

    const rate = Math.min(100, Math.max(0, Number(this.addProductForm.get('discountRate')?.value) || 0));
    const gross = this.roundNumber.transform(quantity * basePrice) as number;
    const discountAmount = this.roundNumber.transform(gross * (rate / 100)) as number;

    return this.roundNumber.transform(gross + this.addProductLineTaxesTotal - discountAmount) as number;
  }

  public get addProductLineTaxesTotal(): number {
    const quantity = Number(this.addProductForm.get('quantity')?.value) || 0;
    const basePrice = Number(this.addProductForm.get('basePrice')?.value) || 0;
    const discountRate = Number(this.addProductForm.get('discountRate')?.value) || 0;

    const taxes = this.selectedArticle?.taxes || [];

    const gross = basePrice * quantity;
    const net = gross - (gross * discountRate) / 100;

    return taxes.reduce((total, tax) => {
      return total + ((this.roundNumber.transform(net * (tax.percentage / 100)) as number) || 0);
    }, 0);
  }

  public get taxesAmount(): number {
    const taxes = this.transaction?.taxes;
    if (taxes?.length) {
      return taxes.reduce((sum, row) => sum + Number(row?.taxAmount ?? 0), 0);
    }
    return 0;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private movementOfArticleService: MovementOfArticleService,
    private movementOfCashService: MovementOfCashService,
    private paymentMethodService: PaymentMethodService,
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

    combineLatest({
      articles: this.articleService.find({ query: { operationType: { $ne: 'D' } } }),
      paymentMethods: this.paymentMethodService.find({ query: { operationType: { $ne: 'D' } } }),
      banks: this.bankService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ articles, paymentMethods, banks }) => {
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
      basePrice: [null, [Validators.required, Validators.min(0)]],
      discountRate: [null, [Validators.min(0), Validators.max(100)]],
    });

    this.addProductForm
      .get('article')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((articleValue) => {
        this.selectedArticle =
          this.articles.find((article) => article._id.toString() === articleValue?._id?.toString()) || null;

        if (this.selectedArticle) {
          this.addProductForm.patchValue(
            {
              article: this.selectedArticle,
              basePrice: this.selectedArticle.basePrice,
              unitPrice: this.transaction.type.requestTaxes
                ? this.selectedArticle.costPrice
                : this.selectedArticle.basePrice,
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
      quota: [1],
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

  private syncPaymentCheckValidators(): void {
    const check = this.paymentRequiresCheck;
    const bankRequired = this.paymentRequiresBank;

    for (const name of ['comprobante', 'expirationDate', 'bank', 'titular', 'cuit'] as const) {
      const c = this.addPaymentForm.get(name);
      if (!c) {
        continue;
      }

      const validators: any[] = [];
      if (check && name === 'comprobante') {
        validators.push(Validators.required);
      }
      if (bankRequired && name === 'bank') {
        validators.push(Validators.required);
      }

      c.setValidators(validators);
      c.updateValueAndValidity({ emitEvent: false });
    }
  }

  private defaultCheckExpirationDateInput(): string {
    const sourceDate = this.transaction?.endDate ?? this.transaction?.startDate;

    return this.formatDateForInput(sourceDate ?? new Date());
  }

  private parseCheckExpirationForInput(value?: string | null): string {
    return value ? this.formatDateForInput(value) : '';
  }

  private serializeCheckExpirationDate(dateInput?: string): string {
    const date = dateInput ? new Date(`${dateInput}T00:00:00`) : new Date();

    return date.toISOString();
  }

  private formatDateForInput(value: string | Date): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
            this.vatPeriodDraft = this.transaction?.VATPeriod || '';
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

  public onVatPeriodBlur(): void {
    if (!this.transaction) {
      return;
    }
    const raw = (this.vatPeriodDraft || '').replace(/\D/g, '').slice(0, 6);
    const current = String(this.transaction.VATPeriod || '')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (raw === current) {
      this.vatPeriodDraft = current || '';
      return;
    }
    if (raw.length !== 6) {
      this.toastService.showToast({
        message: 'El período IVA debe tener 6 dígitos (AAAAMM).',
        type: 'info',
      });
      this.vatPeriodDraft = this.transaction.VATPeriod || '';
      return;
    }
    const month = parseInt(raw.slice(4, 6), 10);
    if (month < 1 || month > 12) {
      this.toastService.showToast({
        message: 'Mes inválido en el período IVA.',
        type: 'info',
      });
      this.vatPeriodDraft = this.transaction.VATPeriod || '';
      return;
    }
    this.transaction.VATPeriod = raw;
    this.updateTransaction();
  }

  public onTransactionDatePickerChange(value: string): void {
    this.transaction.endDate = value;
    this.transaction.expirationDate = this.transaction.endDate;
    this.updateTransaction();
  }

  public startEdit(field: string): void {
    this.editingField = field;
  }

  public cancelEdit(): void {
    this.editingField = null;
    this.isEditingDiscount = false;
    this.isEditingSubtotal = false;
    this.isEditingObservation = false;
  }

  public saveEdit(field: string): void {
    switch (field) {
      case 'letter':
        this.onLetterBlur();
        break;
      case 'origin':
        this.onOriginBlur();
        break;
      case 'number':
        this.onInvoiceNumberBlur();
        break;
    }

    this.editingField = null;
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
    this.updateTransaction();
  }

  public onOriginBlur(): void {
    this.transaction.origin = Math.max(0, Math.floor(Number(this.originDraft)));
    this.updateTransaction();
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
    this.updateTransaction();
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

  public saveObservation(): void {
    this.transaction.observation = (this.observationDraft || '').trim();
    this.updateTransaction();
    this.isEditingObservation = false;
  }

  public startEditDiscount(): void {
    this.isEditingSubtotal = false;
    this.discountPercentDraft = Number(this.transaction?.discountPercent ?? 0);
    this.discountAmountDraft = Number(this.transaction?.discountAmount ?? 0);
    this.isEditingDiscount = true;
  }

  public onDiscountDraftChange(type: 'percent' | 'amount', value: number | string | null): void {
    let percent = 0;
    let amount = 0;
    if (type === 'percent') {
      percent = Number(value) || 0;
      amount = this.transaction.subTotal * (percent / 100);
    } else {
      amount = Number(value) || 0;
      percent = (amount / this.transaction.subTotal) * 100;
    }

    this.discountPercentDraft = percent;
    this.discountAmountDraft = amount;
  }

  public openTaxesModal(): void {
    const modalRef = this.modal.open(ApplyTaxesTransactionsComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.transaction = this.transaction;
    modalRef.componentInstance.transactionTaxes = [...(this.transaction?.taxes || [])];

    modalRef.result.then(
      (taxes: Taxes[]) => {
        this.transaction.taxes = taxes || [];
        this.loading = true;

        this.updateTransaction();
      },
      () => {}
    );
  }

  public recalculateTaxes(): void {
    this.transaction.taxes = [...(this.transaction?.taxes || [])];
    this.transactionService.recalculateTaxes(this.transaction).subscribe({
      next: (response) => {
        this.toastService.showToast({
          message: response.message || 'Impuestos recalculados correctamente',
          type: 'success',
        });
      },
      error: (error) => {
        this.toastService.showToast({
          message: error?.message || 'Error al recalcular los impuestos',
          type: 'error',
        });
      },
      complete: () => {
        this.loadTransaction();
      },
    });
  }

  public saveDiscount(): void {
    const discountPercent = Number(this.discountPercentDraft);
    const discountAmount = Number(this.discountAmountDraft);

    if (discountPercent < 0 || discountPercent > 100 || isNaN(discountPercent)) {
      return this.toastService.showToast({
        message: 'Ingresá un porcentaje entre 0 y 100',
        type: 'info',
      });
    }

    if (discountAmount < 0 || isNaN(discountAmount)) {
      return this.toastService.showToast({
        message: 'Ingresá un monto de descuento válido',
        type: 'info',
      });
    }

    Object.assign(this.transaction, {
      discountPercent,
      discountAmount,
      basePrice: !this.transaction.type.requestArticles
        ? this.transaction.subTotal - discountAmount
        : this.transaction.basePrice,
      totalPrice: this.transaction.subTotal + this.taxesAmount - discountAmount,
    });

    this.updateTransaction();
    this.isEditingDiscount = false;
  }

  public saveSubtotal(): void {
    const subtotal = Number(this.subtotalDraft);
    if (isNaN(subtotal) || subtotal < 0) {
      this.toastService.showToast({
        message: 'Ingresá un subtotal válido',
        type: 'info',
      });
      return;
    }

    let discountAmount = Number(this.transaction.discountAmount ?? 0);
    const discountPercent = Number(this.transaction.discountPercent ?? 0);

    if (discountPercent > 0) {
      discountAmount = subtotal * (discountPercent / 100);
    }

    Object.assign(this.transaction, {
      subTotal: subtotal,
      basePrice: subtotal - discountAmount,
      discountAmount,
      totalPrice: subtotal + this.taxesAmount - discountAmount,
    });

    this.updateTransaction();
    this.isEditingSubtotal = false;
  }

  public startEditSubtotal(): void {
    this.isEditingDiscount = false;
    this.subtotalDraft = this.transaction.subTotal;
    this.isEditingSubtotal = true;
  }

  private async updateTransaction(): Promise<void> {
    this.loading = true;
    this.transactionService
      .update(this.transaction)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            if (this.transaction.type.requestTaxes && this.transaction.taxes && this.transaction.taxes.length > 0) {
              this.recalculateTaxes();
            }
            this.toastService.showToast({
              message: response.message || 'Transacción actualizada correctamente',
              type: 'success',
            });
          } else {
            this.toastService.showToast({
              message: response.message || 'Error al actualizar la transacción',
              type: 'error',
            });
            this.loadTransaction();
          }
        },
        error: (error) => {
          this.toastService.showToast({
            message: error || 'Error al actualizar la transacción',
            type: 'error',
          });
          this.loadTransaction();
        },
        complete: () => {
          this.loading = false;
          this.loadTransaction();
        },
      });
  }

  /** Pasa de Abierto a Cerrado (o al `finishState` del tipo de comprobante). */
  public finalizeOpenTransaction(): void {
    if (!this.canShowFinalizeTransactionButton) {
      return;
    }
    if (this.requestPaymentMethods && !this.paymentsCoverTransactionTotal) {
      this.toastService.showToast({
        message: 'La suma de los métodos de pago debe ser igual o mayor al total de la transacción para finalizarla.',
        type: 'info',
      });
      return;
    }

    const modalRef = this.modal.open(ConfirmationQuestionComponent, {
      size: 'lg',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.title = 'Finalizar transacción';
    modalRef.componentInstance.subtitle = '¿Deseás cerrar esta transacción? Quedará registrada como finalizada.';

    modalRef.result.then(async (confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.loading = true;

      try {
        const nextState = this.transaction.type?.finishState ?? TransactionState.Closed;

        this.transaction.state = nextState;
        this.transaction.endDate = new Date().toISOString();

        this.updateTransaction();
        this.goBack();
      } catch (error) {
      } finally {
        this.loading = false;
      }
    });
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
    if (!this.requestPaymentMethods) {
      return;
    }
    this.editingPaymentId = null;
    this.showAddPaymentForm = true;
    this.addPaymentForm.reset({
      paymentMethod: null,
      amount: this.suggestedNewPaymentAmount,
      comprobante: '',
      expirationDate: '',
      bank: null,
      titular: '',
      cuit: '',
      quota: 1,
    });
    this.selectedPaymentMethod = null;
    this.syncPaymentCheckValidators();
  }

  public addProduct(): void {
    if (!this.requestArticles) {
      return;
    }
    this.editingProductId = null;
    this.showAddProductForm = true;
    this.addProductForm.reset();
    this.addProductForm.patchValue({
      quantity: 1,
      unitPrice: null,
      basePrice: null,
      discountRate: null,
    });
  }

  public savePayment(): void {
    if (!this.requestPaymentMethods) {
      return;
    }
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

      const quotaFromForm = Number(this.addPaymentForm.get('quota')?.value);
      const movementToSave = {
        ...movementToUpdate,
        transaction: this.transaction,
        type: movementToUpdate.type,
        amountPaid: amount,
        quota:
          movementToUpdate.quota != null && !isNaN(Number(movementToUpdate.quota))
            ? Number(movementToUpdate.quota)
            : !isNaN(quotaFromForm) && quotaFromForm > 0
              ? quotaFromForm
              : 1,
        amountDiscount: movementToUpdate.amountDiscount ?? 0,
        balanceCanceled: movementToUpdate.balanceCanceled ?? 0,
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
    const quotaRaw = this.addPaymentForm.get('quota')?.value;
    const quotaNum = Number(quotaRaw);
    const quota = quotaRaw != null && quotaRaw !== '' && !isNaN(quotaNum) && quotaNum > 0 ? quotaNum : 1;

    const movement = {
      transaction: this.transaction,
      type: this.selectedPaymentMethod,
      amountPaid: amount,
      date: baseDate,
      expirationDate: baseDate,
      paymentChange: 0,
      statusCheck: StatusCheck.Closed,
      quota,
      amountDiscount: 0,
      balanceCanceled: 0,
    } as MovementOfCash;
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
    if (!this.requestArticles) {
      return;
    }
    let articleId = String(this.addProductForm.get('article')?.value?._id ?? '');
    this.selectedArticle = this.articles.find((article) => article._id.toString() === articleId?.toString()) || null;

    if (this.addProductForm.valid && this.selectedArticle) {
      let unitPrice = Number(this.addProductForm.get('unitPrice')?.value);
      let basePrice = Number(this.addProductForm.get('basePrice')?.value);
      let quantity = Number(this.addProductForm.get('quantity')?.value);
      let discountRate = Number(this.addProductForm.get('discountRate')?.value);

      if (this.editingProductId) {
        const movementToUpdate = this.movementsOfArticles.find((movement) => movement._id === this.editingProductId);
        if (!movementToUpdate) {
          this.toastService.showToast({
            message: 'No se encontró el producto para editar',
            type: 'error',
          });
          return;
        }

        const updatedMovement = {
          _id: movementToUpdate._id,
          transactionId: this.transaction._id,
          articleId: this.selectedArticle._id,
          quantity: quantity ?? movementToUpdate.amount,
          basePrice: basePrice ?? movementToUpdate.basePrice,
          discountRate: discountRate ?? movementToUpdate.discountRate,
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
        quantity: quantity,
        salePrice: unitPrice,
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
      quota: 1,
    });
    this.selectedPaymentMethod = null;
    this.editingPaymentId = null;
    this.syncPaymentCheckValidators();
  }

  public editProduct(movement: MovementOfArticle): void {
    if (!this.requestArticles) {
      return;
    }
    this.editingProductId = movement._id;
    this.showAddProductForm = false;

    const articleId = String((movement.article as any)?._id ?? movement.article ?? '');
    this.selectedArticle =
      this.articles.find((article) => article._id === articleId || article._id?.toString() === articleId) || null;

    this.addProductForm.patchValue({
      article: this.selectedArticle || movement.article || null,
      quantity: movement.amount || 1,
      unitPrice: this.roundNumber.transform(movement.unitPrice) as number,
      basePrice: this.roundNumber.transform(movement.basePrice) as number,
      discountRate: movement.discountRate ?? 0,
    });
  }

  public editPayment(movement: MovementOfCash): void {
    if (!this.requestPaymentMethods) {
      return;
    }
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
    if (!movement?._id || !this.requestArticles) {
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
    if (!movement?._id || !this.requestPaymentMethods) {
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
      return `Impuesto ${t.percentage}%`;
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
