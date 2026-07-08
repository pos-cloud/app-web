import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse, MovementOfCash, PaymentMethod, PrinterPrintIn, PrintType, Transaction, TransactionState } from '@types';
import { Subject, Subscription } from 'rxjs';

import { CommonModule } from '@angular/common';
import { MovementOfArticleService } from '@core/services/movement-of-article.service';
import { MovementOfCancellationService } from '@core/services/movement-of-cancellation.service';
import { MovementOfCashService } from '@core/services/movement-of-cash.service';
import { PaymentMethodService } from '@core/services/payment-method.service';
import { PrintService } from '@core/services/print.service';
import { TransactionService } from '@core/services/transaction.service';
import { TranslateModule } from '@ngx-translate/core';
import { SelectPrinterComponent } from '@shared/components/select-printer/select-printer.component';
import { FocusDirective } from '@shared/directives/focus.directive';
import { PipesModule } from '@shared/pipes/pipes.module';
import { RoundNumberPipe } from '@shared/pipes/round-number.pipe';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { CompanyComponent } from 'app/modules/entities/company/crud/company.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import * as printJS from 'print-js';
import { takeUntil } from 'rxjs/operators';
import { ArticleComponent } from '../../../entities/article/crud/article.component';

@Component({
  selector: 'app-view-transaction',
  templateUrl: './view-transaction.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    NgbModule,
    NgbNavModule,
  ],
})
export class ViewTransactionComponent implements OnInit {
  @Input() transactionId: string;
  @Input() readonly: boolean = false;
  private subscription: Subscription = new Subscription();
  transaction: Transaction;
  loading = false;
  movementsOfArticles: MovementOfArticle[];
  areMovementsOfArticlesEmpty = true;
  movementsOfCashes: MovementOfCash[];
  areMovementsOfCashesEmpty = true;
  movementOfCancellations: Transaction[];
  currencyValue: [];
  showDetails = false;
  propertyTerm: string;
  modalData: any;
  isArcaModal = false;
  syncingFromArca = false;
  transactionDestinations: Transaction[] = [];
  transactionOrigins: Transaction[] = [];
  roundNumber = new RoundNumberPipe();
  public activeTab: string = 'datos';

  // Edición inline del medio de pago de un movimiento de caja
  public paymentMethods: PaymentMethod[] = [];
  public editingPaymentId: string | null = null;
  public selectedPaymentMethodId: string | null = null;
  public savingPayment = false;

  private destroy$ = new Subject<void>();
  @ViewChild('modalObj') modalObj!: TemplateRef<any>;

  constructor(
    public _transactionService: TransactionService,
    public _movementOfArticleService: MovementOfArticleService,
    public _movementOfCashService: MovementOfCashService,
    public activeModal: NgbActiveModal,
    private _modalService: NgbModal,
    public _printService: PrintService,
    private _toast: ToastService,
    private _toastService: ToastService,
    private _movementOfCancellation: MovementOfCancellationService,
    private _paymentMethodService: PaymentMethodService
  ) {}

  ngOnInit() {
    this.loading = true;

    if (this.transactionId) {
      this.getTransaction(this.transactionId);
    }

    this.loadPaymentMethods();
  }

  private loadPaymentMethods(): void {
    this._paymentMethodService
      .getAll({
        project: {
          _id: 1,
          name: 1,
          order: 1,
          isCurrentAccount: 1,
          allowBank: 1,
          checkDetail: 1,
          checkPerson: 1,
          allowToFinance: 1,
          allowCurrencyValue: 1,
          operationType: 1,
        },
        match: { operationType: { $ne: 'D' } },
        sort: { order: 1 },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.paymentMethods = result?.status === 200 ? result.result : [];
        },
        error: (error) => this._toastService.showToast(error),
      });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getTransaction(transactionId: string): void {
    this.loading = true;

    this._transactionService
      .getById(transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.transaction = result.result;
          this.getMovementsOfArticlesByTransaction();
          this.getMovementsOfCashesByTransaction();
          this.getMovementsOfCancellations();

          this.loading = false;
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }
  public getMovementsOfArticlesByTransaction(): void {
    this.loading = true;

    const data = {
      project: {
        transaction: 1,
        amount: 1,
        quantityForStock: 1,
        'category.description': 1,
        'make.description': 1,
        'article.posDescription': 1,
        'article._id': 1,
        'deposit.name': 1,
        code: 1,
        description: 1,
        notes: 1,
        unitPrice: 1,
        discountRate: 1,
        discountAmount: 1,
        salePrice: 1,
        op: 1,
        read: 1,
        operationType: 1,
      },
      match: {
        transaction: { $oid: this.transaction._id },
        operationType: { $ne: 'D' },
      },
    };

    this._movementOfArticleService
      .getAll(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.result.length) {
            this.areMovementsOfArticlesEmpty = false;
            this.movementsOfArticles = result.result;
          } else {
            this.areMovementsOfArticlesEmpty = true;
          }
        },
        error: (error) => {
          this.areMovementsOfArticlesEmpty = true;
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public getMovementsOfCashesByTransaction(): void {
    this.loading = true;

    const data = {
      project: {
        transaction: 1,
        number: 1,
        'type._id': 1,
        'type.name': 1,
        'bank.name': 1,
        quota: 1,
        expirationDate: 1,
        amountPaid: 1,
        status: 1,
        observation: 1,
        operationType: 1,
        movement: 1,
      },
      match: {
        transaction: { $oid: this.transaction._id },
        operationType: { $ne: 'D' },
      },
    };
    this._movementOfCashService
      .getAll(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.result.length) {
            this.areMovementsOfCashesEmpty = false;
            this.movementsOfCashes = result.result;
          } else {
            this.areMovementsOfCashesEmpty = true;
          }
        },
        error: (error) => {
          this.areMovementsOfCashesEmpty = true;
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public getMovementsOfCancellations(): void {
    this.loading = true;
    this.transactionOrigins = [];
    this.transactionDestinations = [];
    this._movementOfCancellation
      .getAll({
        project: {
          _id: 1,
          'transactionDestination.operationType': 1,
          'transactionDestination._id': 1,
          'transactionDestination.endDate': 1,
          'transactionDestination.type.name': 1,
          'transactionDestination.origin': 1,
          'transactionDestination.letter': 1,
          'transactionDestination.number': 1,
          'transactionDestination.totalPrice': 1,
          'transactionDestination.state': 1,
          'transactionOrigin.operationType': 1,
          'transactionOrigin._id': 1,
          'transactionOrigin.endDate': 1,
          'transactionOrigin.type.name': 1,
          'transactionOrigin.origin': 1,
          'transactionOrigin.letter': 1,
          'transactionOrigin.number': 1,
          'transactionOrigin.totalPrice': 1,
          'transactionOrigin.state': 1,
        },
        match: {
          $or: [
            { 'transactionDestination._id': { $oid: this.transactionId } },
            { 'transactionOrigin._id': { $oid: this.transactionId } },
          ],
          operationType: { $ne: 'D' },
        },
      })
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.result.length) {
            for (let data of result.result) {
              const originId = data.transactionOrigin?._id;
              const destinationId = data.transactionDestination?._id;
              const currentId = this.transactionId;

              // Si la transacción que estoy viendo es la ORIGEN del movimiento (la cancelada),
              // la "otra" (destination) es la que cancela → mostrarla en Cancelatorias
              if (originId === currentId && data.transactionDestination) {
                const other = data.transactionDestination;
                if (other.state !== TransactionState.Open && other.state !== TransactionState.Pending) {
                  this.transactionOrigins.push(other);
                }
              }
              // Si la transacción que estoy viendo es la DESTINO del movimiento (la que cancela),
              // la "otra" (origin) es la cancelada → mostrarla en Transacciones canceladas
              if (destinationId === currentId && data.transactionOrigin) {
                const other = data.transactionOrigin;
                if (other.state !== TransactionState.Open && other.state !== TransactionState.Pending) {
                  this.transactionDestinations.push(other);
                }
              }
            }
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public startEditPayment(movementOfCash: MovementOfCash): void {
    this.editingPaymentId = movementOfCash._id;
    this.selectedPaymentMethodId = movementOfCash.type?._id ?? null;
  }

  public cancelEditPayment(): void {
    this.editingPaymentId = null;
    this.selectedPaymentMethodId = null;
  }

  public savePaymentMethod(movementOfCash: MovementOfCash): void {
    const newMethod = this.paymentMethods.find((pm) => pm._id === this.selectedPaymentMethodId);

    if (!newMethod) {
      this._toastService.showToast({ message: 'Seleccioná un medio de pago válido' });
      return;
    }

    if (newMethod._id === movementOfCash.type?._id) {
      this.cancelEditPayment();
      return;
    }

    this.savingPayment = true;

    // Traemos el movimiento completo para no perder campos no proyectados al actualizar
    this._movementOfCashService
      .getById(movementOfCash._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result?.status !== 200 || !result.result) {
            this.savingPayment = false;
            this._toastService.showToast(result);
            return;
          }

          const fullMovement: MovementOfCash = result.result;
          fullMovement.type = newMethod;
          this.applyPaymentMethodConstraints(fullMovement, newMethod);

          this._movementOfCashService
            .update(fullMovement)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (updateResult: ApiResponse) => {
                this.savingPayment = false;
                if (updateResult?.status === 200) {
                  this._toastService.showToast({ message: 'Medio de pago actualizado', type: 'success' });
                  this.cancelEditPayment();
                  this.getMovementsOfCashesByTransaction();
                } else {
                  this._toastService.showToast(updateResult);
                }
              },
              error: (error) => {
                this.savingPayment = false;
                this._toastService.showToast(error);
              },
            });
        },
        error: (error) => {
          this.savingPayment = false;
          this._toastService.showToast(error);
        },
      });
  }

  // Limpia los datos que el nuevo medio de pago no admite
  private applyPaymentMethodConstraints(movementOfCash: MovementOfCash, paymentMethod: PaymentMethod): void {
    if (!paymentMethod.allowBank) {
      movementOfCash.bank = null;
    }
    if (!paymentMethod.checkDetail) {
      movementOfCash.statusCheck = null;
    }
    if (!paymentMethod.checkPerson) {
      movementOfCash.titular = '';
      movementOfCash.CUIT = '';
    }
    if (!paymentMethod.allowToFinance) {
      movementOfCash.quota = 1;
    }
    if (!paymentMethod.allowCurrencyValue) {
      movementOfCash.currencyValues = [];
    }
  }

  async openModal(op: string, movement?: MovementOfArticle, transactionId?: string, objData?: any) {
    let modalRef;
    switch (op) {
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transactionId;
        break;
      case 'view-article':
        modalRef = this._modalService.open(ArticleComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.property = {
          articleId: movement.article._id,
          operation: 'view',
        };
        break;
      case 'view-company':
        modalRef = this._modalService.open(CompanyComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.property = {
          companyId: this.transaction.company._id,
          operation: 'view',
          type: '',
        };

        break;

      case 'print-label':
        modalRef = this._modalService.open(SelectPrinterComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.typePrinter = PrinterPrintIn.Label;
        modalRef.result.then(
          (result) => {
            if (result.data) {
              const datalabel = {
                quantity: movement.amount,
                articleId: movement.article._id,
                printerId: result.data._id,
              };
              this.toPrint(PrintType.Article, datalabel);
            }
          },
          (reason) => {}
        );
        break;
      case 'modalObj':
        if (!objData) return;
        this.modalData = objData;
        this.isArcaModal = this.isArcaResponse(objData);

        this._modalService.open(this.modalObj, {
          size: 'l',
          backdrop: 'static',
        });
        break;
      default:
        break;
    }
  }

  public toPrint(type: PrintType, data: {}): void {
    this.loading = true;

    this._printService
      .toPrint(type, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toast.showToast({ message: 'Error al generar el PDF' });
            return;
          }
          if (result instanceof Blob) {
            try {
              const blobUrl = URL.createObjectURL(result);
              printJS(blobUrl);
            } catch (e) {
              this._toast.showToast({ message: 'Error al generar el PDF' });
            }
          } else {
            this._toast.showToast(result);
          }
        },
        error: (error) => {
          this._toast.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private isArcaResponse(obj: any): boolean {
    return !!(obj?.FeCabResp && obj?.FeDetResp);
  }

  public hasFeArObj(): boolean {
    return !!this.transaction?.feArObj;
  }

  public syncFromArca(modal?: { close: () => void }): void {
    if (!this.transaction?._id || this.syncingFromArca) return;

    this.syncingFromArca = true;

    this._transactionService
      .syncTransactionFromArca(this.transaction._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.syncingFromArca = false;
          if (result?.status === 200) {
            this.transaction = { ...this.transaction, ...result.result };
            this._toastService.showToast({ message: 'Transacción alineada con ARCA', type: 'success' });
            modal?.close();
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => {
          this.syncingFromArca = false;
          this._toastService.showToast(error);
        },
      });
  }

  public syncFromArcaDirect(): void {
    this.syncFromArca();
  }
}
