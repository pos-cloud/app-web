import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse, MovementOfCash, PrinterPrintIn, PrintType, Transaction, TransactionState } from '@types';
import { Subject, Subscription } from 'rxjs';

import { CommonModule } from '@angular/common';
import { MovementOfArticleService } from '@core/services/movement-of-article.service';
import { MovementOfCancellationService } from '@core/services/movement-of-cancellation.service';
import { MovementOfCashService } from '@core/services/movement-of-cash.service';
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
  templateUrl: './view-transactions.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule, NgbModule, NgbNavModule],
})
export class ViewTransactionComponentNew implements OnInit {
  @Input() transactionId: string;
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
  transactionDestinations: Transaction[] = [];
  transactionOrigins: Transaction[] = [];
  roundNumber = new RoundNumberPipe();
  public activeTab: string = 'datos';

  private destroy$ = new Subject<void>();

  constructor(
    public _transactionService: TransactionService,
    public _movementOfArticleService: MovementOfArticleService,
    public _movementOfCashService: MovementOfCashService,
    public activeModal: NgbActiveModal,
    private _modalService: NgbModal,
    public _printService: PrintService,
    private _toast: ToastService,
    private _toastService: ToastService,
    private _movementOfCancellation: MovementOfCancellationService
  ) {}

  ngOnInit() {
    this.loading = true;

    if (this.transactionId) {
      this.getTransaction(this.transactionId);
    }
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

          this.loading = false;
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  getTransactionCancelations(transactionId: string): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this.loading = true;

      this._transactionService
        .getById(transactionId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (!result.result) {
              resolve(null);
            } else {
              this.loading = false;
              resolve(result.result);
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.loading = false;
            resolve(null);
          },
          complete() {
            this.loading = false;
            resolve(null);
          },
        });
    });
  }

  public getMovementsOfArticlesByTransaction(): void {
    this.loading = true;

    const data = {
      project: {
        transaction: 1,
        amount: 1,
        'category.description': 1,
        'make.description': 1,
        'article.posDescription': 1,
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
        'type.name': 1,
        'bank.name': 1,
        quota: 1,
        expirationDate: 1,
        amountPaid: 1,
        status: 1,
        observation: 1,
        commissionAmount: 1,
        administrativeExpenseAmount: 1,
        otherExpenseAmount: 1,
        capital: 1,
        interestAmount: 1,
        taxAmount: 1,
        operationType: 1,
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

  public getCancellationsOfMovements(transactionOrigin: boolean): void {
    this.loading = true;

    let match;
    if (transactionOrigin) {
      match = {
        transactionOrigin: { $oid: this.transactionId },
        operationType: { $ne: 'D' },
      };
    } else {
      match = {
        transactionDestination: { $oid: this.transactionId },
        operationType: { $ne: 'D' },
      };
    }
    let data = {
      project: {
        balance: 1,
        transactionOrigin: 1,
        transactionDestination: 1,
        operationType: 1,
      },
      match: match,
    };

    this._movementOfCancellation.getAll(data).subscribe(
      async (result) => {
        if (result && result.result && result.result.length > 0) {
          for (let index = 0; index < result.result.length; index++) {
            let transactionData;
            if (transactionOrigin) {
              transactionData = await this.getTransactionCancelations(result.result[index].transactionDestination);
            } else {
              transactionData = await this.getTransactionCancelations(result.result[index].transactionOrigin);
            }
            if (
              transactionData &&
              transactionData.state !== TransactionState.Open &&
              transactionData.state !== TransactionState.Pending
            ) {
              transactionData.balance = this.roundNumber.transform(result.result[index].balance);
              if (transactionOrigin) {
                this.transactionOrigins.push(transactionData);
              } else {
                this.transactionDestinations.push(transactionData);
              }
            } else {
              this.loading = false;
            }
          }
        } else {
          this._toastService.showToast({ message: 'No se encontraron transactiones relacionadas' });
        }
        this.loading = false;
      },
      (error) => {
        this._toastService.showToast(error);
      }
    );
  }

  async openModal(op: string, movement?: MovementOfArticle, transactionId?: string) {
    let modalRef;
    switch (op) {
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponentNew, {
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
      default:
        break;
    }
  }

  onTabChange(event: any): void {
    this.activeTab = event.nextId;
    if (event.nextId === 'canceladas' && !this.transactionDestinations.length) {
      this.getCancellationsOfMovements(false);
    }

    if (event.nextId === 'cancelatorias' && !this.transactionOrigins.length) {
      this.getCancellationsOfMovements(true);
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
}
