import { AfterViewInit, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiResponse,
  MovementOfCash,
  PrinterPrintIn,
  PrintType,
  Transaction,
  TransactionState,
  User,
} from '@types';
import { Subject, Subscription } from 'rxjs';

import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { PrintService } from '@core/services/print.service';
import { TransactionService } from '@core/services/transaction.service';
import { TranslateModule } from '@ngx-translate/core';
import { SelectPrinterComponent } from '@shared/components/select-printer/select-printer.component';
import { FocusDirective } from '@shared/directives/focus.directive';
import { PipesModule } from '@shared/pipes/pipes.module';
import { RoundNumberPipe } from '@shared/pipes/round-number.pipe';
import { ArticleComponent } from 'app/components/article/crud/article.component';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { CompanyComponent } from 'app/modules/entities/company/crud/company.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import * as printJS from 'print-js';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    NgbModule,
    NgbNavModule,
  ],
})
export class ViewTransactionComponent implements OnInit, AfterViewInit {
  @Input() transactionId: string;
  @Input() readonly: boolean = false;
  private subscription: Subscription = new Subscription();
  transaction: Transaction;
  loading = true;
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
  loadingTabs = ['data', 'articles', 'taxes', 'paymentMethodEcommerce', 'delivery'];
  loadingFields: { label: string; col: string; area?: boolean }[] = [
    { label: 'client', col: 'col-md-4' },
    { label: 'balanceAccount', col: 'col-md-6' },
    { label: 'state', col: 'col-md-2' },
    { label: 'date', col: 'col-md-2' },
    { label: 'fixedOrigin', col: 'col-md-2' },
    { label: 'letter', col: 'col-md-1' },
    { label: 'number', col: 'col-md-3' },
    { label: 'transaction.cashBox.number', col: 'col-md-2' },
    { label: 'table.description', col: 'col-md-2' },
    { label: 'exemptImport', col: 'col-md-4' },
    { label: 'discount', col: 'col-md-4' },
    { label: 'importTotal', col: 'col-md-4' },
    { label: 'observation', col: 'col-md-12', area: true },
  ];

  public isSupport = false;

  private destroy$ = new Subject<void>();
  @ViewChild('modalObj') modalObj!: TemplateRef<any>;

  constructor(
    public _transactionService: TransactionService,
    public activeModal: NgbActiveModal,
    private _modalService: NgbModal,
    public _printService: PrintService,
    private _toast: ToastService,
    private _toastService: ToastService,
    private _authService: AuthService,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    const dialog = this.elementRef.nativeElement.closest('.modal-dialog') as HTMLElement | null;
    if (!dialog) return;
    dialog.style.maxWidth = '960px';
    dialog.style.width = '96vw';
  }

  ngOnInit() {
    if (this.transactionId) {
      this.getTransaction(this.transactionId);
    } else {
      this.loading = false;
    }

    this._authService
      .getIdentity.pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null) => {
        this.isSupport = user?.name?.toLowerCase() === 'soporte';
      });

  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getTransaction(transactionId: string): void {
    this.loading = true;

    this._transactionService
      .getView(transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          const view = result?.result ?? {};
          this.transaction = view.transaction;
          this.setMovementsOfArticles(view.movementsOfArticles ?? []);
          this.setMovementsOfCashes(view.movementsOfCashes ?? []);
          this.applyMovementsOfCancellations(view.movementsOfCancellations ?? []);
          this.loading = false;
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  private setMovementsOfArticles(movements: MovementOfArticle[]): void {
    if (movements?.length) {
      this.areMovementsOfArticlesEmpty = false;
      this.movementsOfArticles = movements;
    } else {
      this.areMovementsOfArticlesEmpty = true;
      this.movementsOfArticles = [];
    }
  }

  public get articlesTotals(): {
    amount: number;
    discountAmount: number;
    salePriceWithoutTaxes: number;
    salePrice: number;
    quantityForStock: number;
  } {
    const sum = (pick: (movement: MovementOfArticle) => number) =>
      this.roundNumber.transform(
        (this.movementsOfArticles ?? []).reduce((total, movement) => total + (Number(pick(movement)) || 0), 0)
      );

    return {
      amount: sum((movement) => movement.amount),
      discountAmount: sum((movement) => movement.discountAmount),
      salePriceWithoutTaxes: sum((movement) => movement.salePriceWithoutTaxes),
      salePrice: sum((movement) => movement.salePrice),
      quantityForStock: sum((movement) => movement.quantityForStock),
    };
  }

  private setMovementsOfCashes(movements: MovementOfCash[]): void {
    if (movements?.length) {
      this.areMovementsOfCashesEmpty = false;
      this.movementsOfCashes = movements;
    } else {
      this.areMovementsOfCashesEmpty = true;
      this.movementsOfCashes = [];
    }
  }

  private applyMovementsOfCancellations(cancellations: any[]): void {
    this.transactionOrigins = [];
    this.transactionDestinations = [];

    for (const data of cancellations ?? []) {
      const originId = data.transactionOrigin?._id;
      const destinationId = data.transactionDestination?._id;
      const currentId = this.transactionId;

      // Si la transacción que estoy viendo es la ORIGEN del movimiento (la cancelada),
      // la "otra" (destination) es la que cancela → mostrarla en Cancelatorias
      if (originId === currentId && data.transactionDestination) {
        const other = data.transactionDestination;
        if (other.state !== TransactionState.Open && other.state !== TransactionState.Pending) {
          this.transactionOrigins.push({
            ...other,
            balance: this.roundNumber.transform(data.balance ?? 0),
          });
        }
      }
      // Si la transacción que estoy viendo es la DESTINO del movimiento (la que cancela),
      // la "otra" (origin) es la cancelada → mostrarla en Transacciones canceladas
      if (destinationId === currentId && data.transactionOrigin) {
        const other = data.transactionOrigin;
        if (other.state !== TransactionState.Open && other.state !== TransactionState.Pending) {
          this.transactionDestinations.push({
            ...other,
            balance: this.roundNumber.transform(data.balance ?? 0),
          });
        }
      }
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
