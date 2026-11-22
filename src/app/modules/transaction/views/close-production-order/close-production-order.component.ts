import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MovementOfArticleStatus, StockMovement, Transaction, TransactionState } from '@types';
import { ArticleStockService } from 'app/core/services/article-stock.service';
import { MovementOfArticleService } from 'app/core/services/movement-of-article.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { Transaction as TransactionModel } from 'app/components/transaction/transaction';
import { ToastService } from 'app/shared/components/toast/toast.service';
import * as moment from 'moment';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-close-production-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './close-production-order.component.html',
  styleUrls: ['./close-production-order.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CloseProductionOrderComponent implements OnInit, OnDestroy {
  public transaction: Transaction;
  public movements: MovementOfArticle[] = [];
  public reading = '';
  public loading = false;
  public readingLine = false;
  public finishing = false;

  @ViewChild('readingInput') readingInput?: ElementRef<HTMLInputElement>;

  private transactionId: string;
  private returnURL = '/pos/production';
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private movementOfArticleService: MovementOfArticleService,
    private articleStockService: ArticleStockService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.returnURL = this.route.snapshot.queryParams['returnURL'] || '/pos/production';
    this.transactionId = this.route.snapshot.params['id'];
    this.loadTransaction();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public get editable(): boolean {
    return this.transaction?.state === TransactionState.Open || this.transaction?.state === TransactionState.Pending;
  }

  public async read(): Promise<void> {
    const code = this.reading.trim();
    if (!this.editable || this.readingLine || !code) {
      return;
    }
    const op = Number(code);
    if (!Number.isFinite(op)) {
      this.toastService.showToast(null, 'danger', '', 'La lectura no es válida.');
      return;
    }

    this.readingLine = true;
    try {
      const found = await firstValueFrom(
        this.movementOfArticleService.getAll({
          project: {
            _id: 1,
            op: 1,
            read: 1,
            amount: 1,
            code: 1,
            description: 1,
            basePrice: 1,
            costPrice: 1,
            salePrice: 1,
            unitPrice: 1,
            'article._id': 1,
            'article.code': 1,
            'article.description': 1,
            'article.barcode': 1,
            operationType: 1,
          },
          match: { op, operationType: { $ne: 'D' } },
          limit: 1,
        })
      );
      const origin = Array.isArray(found?.result) ? found.result[0] : null;
      if (!origin?._id) {
        this.toastService.showToast(null, 'danger', '', 'No se encontró la lectura.');
        return;
      }
      const already = this.movements.filter((movement) => this.originId(movement) === String(origin._id)).length;
      if ((origin.read || 0) + already >= (origin.amount || 0)) {
        this.toastService.showToast(null, 'danger', '', 'El producto ya fue cerrado.');
        return;
      }

      const saved = await firstValueFrom(this.movementOfArticleService.save(this.buildMovement(origin, code)));
      if (saved?.status !== 200 || !saved.result) {
        this.toastService.showToast(saved);
        return;
      }
      saved.result.notes = code;
      this.movements = [saved.result, ...this.movements];
      this.reading = '';
      this.focusReading();
    } finally {
      this.readingLine = false;
    }
  }

  public async finish(): Promise<void> {
    if (this.finishing || this.readingLine) {
      return;
    }
    if (!this.editable) {
      this.toastService.showToast(null, 'info', '', 'Este cierre ya no se puede finalizar.');
      return;
    }
    if (!this.movements.length) {
      this.toastService.showToast(null, 'info', '', 'Pasá al menos una lectura antes de finalizar.');
      this.focusReading();
      return;
    }

    this.finishing = true;
    const previousState = this.transaction.state;
    const previousEndDate = this.transaction.endDate;
    try {
      if (this.transaction.type?.modifyStock) {
        const stockResult = await firstValueFrom(this.articleStockService.updateStockByTransaction(this.transaction));
        if (stockResult?.status !== 200) {
          this.toastService.showToast(stockResult);
          return;
        }
      }

      const updatedReads = await firstValueFrom(
        this.movementOfArticleService.updateMovementOfArticles(this.transaction._id)
      );
      if (updatedReads?.status !== 200) {
        this.toastService.showToast(updatedReads);
        return;
      }

      const balance = await firstValueFrom(
        this.transactionService.updateBalance(this.transaction as unknown as TransactionModel)
      );
      if (balance?.status !== 200) {
        this.toastService.showToast(balance);
        return;
      }

      const endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
      this.transaction.balance = balance.result?.balance;
      this.transaction.endDate = endDate;
      this.transaction.expirationDate = endDate;
      this.transaction.VATPeriod = moment(endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
      this.transaction.state = (this.transaction.type?.finishState as TransactionState) || TransactionState.Closed;

      const closed = await firstValueFrom(this.transactionService.update(this.transaction));
      if (closed?.status !== 200) {
        this.transaction.state = previousState;
        this.transaction.endDate = previousEndDate;
        this.toastService.showToast(closed);
        return;
      }
      this.transaction = closed.result || this.transaction;
      this.toastService.showToast(null, 'success', '', 'Cierre finalizado.');
      this.goBack();
    } catch (error) {
      this.transaction.state = previousState;
      this.transaction.endDate = previousEndDate;
      this.toastService.showToast(error);
    } finally {
      this.finishing = false;
    }
  }

  public goBack(): void {
    this.router.navigateByUrl(this.returnURL);
  }

  private loadTransaction(): void {
    this.loading = true;
    this.transactionService
      .getById(this.transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.status === 200 && result.result) {
            this.transaction = result.result;
            this.loadMovements();
          } else {
            this.toastService.showToast(null, 'danger', '', 'No se encontró el cierre.');
            this.goBack();
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toastService.showToast(null, 'danger', '', 'No se pudo cargar el cierre.');
          this.goBack();
        },
      });
  }

  private loadMovements(): void {
    this.movementOfArticleService
      .getMovementsOfArticlesByTransaction(this.transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.movements = result?.result || [];
          this.focusReading();
        },
        error: () => {
          this.toastService.showToast(null, 'danger', '', 'No se pudieron cargar las lecturas.');
        },
      });
  }

  private buildMovement(origin: MovementOfArticle, code: string): MovementOfArticle {
    const article = origin.article;
    const movement = new MovementOfArticle();
    movement.article = article;
    movement.code = origin.code || article?.code || '1';
    movement.description = origin.description || article?.description || '';
    movement.barcode = article?.barcode;
    movement.basePrice = Number(origin.basePrice) || 0;
    movement.costPrice = Number(origin.costPrice) || 0;
    movement.salePrice = Number(origin.salePrice) || 0;
    movement.unitPrice = Number(origin.unitPrice) || 0;
    movement.markupPrice = 0;
    movement.markupPriceWithoutVAT = 0;
    movement.transactionDiscountAmount = 0;
    movement.amount = 1;
    movement.read = 0;
    movement.printed = 0;
    movement.status = MovementOfArticleStatus.Ready;
    movement.modifyStock = !!this.transaction.type?.modifyStock;
    movement.stockMovement = this.transaction.type?.stockMovement || StockMovement.Inflows;
    movement.deposit = this.transaction.depositDestination;
    movement.transaction = this.transaction as unknown as TransactionModel;
    movement.movementOrigin = origin;
    movement.op = Date.now() + Math.floor(Math.random() * 100000);
    movement.notes = code;
    return movement;
  }

  private originId(movement: MovementOfArticle): string {
    const origin = movement.movementOrigin as unknown;
    if (!origin) {
      return '';
    }
    if (typeof origin === 'string') {
      return origin;
    }
    return String((origin as { _id?: string })._id || '');
  }

  private focusReading(): void {
    setTimeout(() => this.readingInput?.nativeElement.focus());
  }
}
