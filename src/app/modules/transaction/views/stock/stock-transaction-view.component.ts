import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { MovementOfArticle, StockMovement, Transaction, TransactionMovement, TransactionState } from '@types';
import { ArticleService } from 'app/core/services/article.service';
import { ArticleStockService } from 'app/core/services/article-stock.service';
import { MovementOfArticleService } from 'app/core/services/movement-of-article.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { ConfirmationQuestionComponent } from 'app/shared/components/confirm/confirmation-question.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { NumericTextDirective } from 'app/shared/directives/numeric-text.directive';
import { catchError, debounceTime, firstValueFrom, map, of, Subject, switchMap, takeUntil } from 'rxjs';

interface DepositCard {
  label: string;
  name: string;
}

@Component({
  selector: 'app-stock-transaction-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTooltipModule, NumericTextDirective],
  templateUrl: './stock-transaction-view.component.html',
  styleUrls: ['./stock-transaction-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StockTransactionViewComponent implements OnInit, OnDestroy {
  public transaction: Transaction;
  public movements: MovementOfArticle[] = [];
  public loading = false;
  public savingLine = false;
  public processing = false;
  public searchTerm = '';
  public articleMatches: any[] = [];
  public observationDraft = '';
  public quantityDrafts: Record<string, string> = {};

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  private transactionId: string;
  private returnURL = '/pos/stock';
  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();
  private loadingCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private movementOfArticleService: MovementOfArticleService,
    private articleService: ArticleService,
    private articleStockService: ArticleStockService,
    private toastService: ToastService,
    private modal: NgbModal
  ) {}

  ngOnInit(): void {
    this.returnURL = this.route.snapshot.queryParams['returnURL'] || '/pos/stock';
    this.transactionId = this.route.snapshot.params['id'];
    this.search$
      .pipe(
        debounceTime(250),
        switchMap((term) => this.searchArticles(term)),
        takeUntil(this.destroy$)
      )
      .subscribe((items) => {
        this.articleMatches = items;
      });
    this.loadTransaction();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public get editable(): boolean {
    return this.transaction?.state === TransactionState.Open || this.transaction?.state === TransactionState.Pending;
  }

  public get isTransfer(): boolean {
    return this.transaction?.type?.stockMovement === StockMovement.Transfer;
  }

  public get kindLabel(): string {
    return this.transaction?.type?.stockMovement || 'Stock';
  }

  public get kindClass(): string {
    switch (this.transaction?.type?.stockMovement) {
      case StockMovement.Inflows:
        return 'is-in';
      case StockMovement.Outflows:
        return 'is-out';
      case StockMovement.Transfer:
        return 'is-transfer';
      case StockMovement.Inventory:
        return 'is-count';
      default:
        return 'is-count';
    }
  }

  public get depositCards(): DepositCard[] {
    const origin = this.transaction?.depositOrigin?.name;
    const destination = this.transaction?.depositDestination?.name;
    const kind = this.transaction?.type?.stockMovement;

    if (kind === StockMovement.Transfer) {
      return [
        { label: 'Sale de', name: origin || 'Sin depósito' },
        { label: 'Entra a', name: destination || 'Sin depósito' },
      ];
    }
    if (kind === StockMovement.Outflows) {
      return [{ label: 'Sale de', name: origin || destination || 'Sin depósito' }];
    }
    if (kind === StockMovement.Inventory) {
      return [{ label: 'Depósito', name: destination || origin || 'Sin depósito' }];
    }
    return [{ label: 'Entra a', name: destination || origin || 'Sin depósito' }];
  }

  public get totalUnits(): number {
    return this.movements.reduce((total, movement) => total + (Number(movement.amount) || 0), 0);
  }

  public trackByMovementId(_index: number, movement: MovementOfArticle): string {
    return movement._id;
  }

  public goBack(): void {
    this.router.navigateByUrl(this.returnURL);
  }

  public onSearchInput(): void {
    const term = this.searchTerm.trim();
    if (!term || term.startsWith('*')) {
      this.articleMatches = [];
      return;
    }
    this.search$.next(term);
  }

  public async onSearchSubmit(): Promise<void> {
    if (!this.editable || this.savingLine) {
      return;
    }
    const term = this.searchTerm.trim();
    if (!term) {
      return;
    }
    if (term.startsWith('*')) {
      this.applyLastQuantity(term.slice(1));
      return;
    }

    const matches = await firstValueFrom(this.searchArticles(term));
    const exact = matches.filter((article) => this.isExactArticle(article, term));
    if (exact.length === 1) {
      await this.addArticle(exact[0]);
      return;
    }
    this.articleMatches = matches;
    if (!matches.length) {
      this.toastService.showToast(null, 'info', '', 'No encontré ese artículo.');
    }
  }

  public async addArticle(article: { _id: string }): Promise<void> {
    if (!this.editable || this.savingLine || !article?._id || !this.transaction) {
      return;
    }
    this.savingLine = true;
    try {
      const articleResult = await firstValueFrom(this.articleService.getArticle(article._id));
      const fullArticle = articleResult?.article;
      if (!fullArticle) {
        this.toastService.showToast(null, 'danger', '', articleResult?.message || 'No se pudo obtener el artículo.');
        return;
      }

      const stockMovement = this.transaction.type?.stockMovement;
      const deposit =
        stockMovement === StockMovement.Transfer
          ? this.transaction.depositOrigin
          : this.transaction.depositDestination || this.transaction.depositOrigin;

      const movement = {
        code: fullArticle.code,
        codeSAT: fullArticle.codeSAT,
        description: fullArticle.description || fullArticle.posDescription,
        observation: fullArticle.observation,
        barcode: fullArticle.barcode,
        basePrice: 0,
        costPrice: 0,
        unitPrice: 0,
        markupPercentage: 0,
        markupPriceWithoutVAT: 0,
        markupPrice: 0,
        discountRate: 0,
        discountAmount: 0,
        transactionDiscountAmount: 0,
        salePrice: 0,
        amount: 1,
        status: 'Listo',
        article: fullArticle,
        transaction: this.transaction,
        taxes: fullArticle.taxes || [],
        make: fullArticle.make,
        category: fullArticle.category,
        modifyStock: !!this.transaction.type?.modifyStock,
        stockMovement,
        deposit,
        recalculateParent: false,
        printed: 0,
        read: 0,
      } as unknown as Parameters<MovementOfArticleService['saveMovementOfArticle']>[0];

      const result = await firstValueFrom(this.movementOfArticleService.saveMovementOfArticle(movement));
      if (!result?.movementOfArticle && !result?.result) {
        this.toastService.showToast(null, 'danger', '', result?.message || 'No se pudo agregar el artículo.');
        return;
      }
      this.searchTerm = '';
      this.articleMatches = [];
      this.loadMovements(true);
    } finally {
      this.savingLine = false;
    }
  }

  private applyLastQuantity(raw: string): void {
    const last = this.movements[this.movements.length - 1];
    const quantity = this.parseQuantity(raw);
    if (!last) {
      this.toastService.showToast(null, 'info', '', 'No hay un artículo para cambiarle la cantidad.');
      return;
    }
    if (quantity === null || quantity <= 0) {
      this.toastService.showToast(null, 'info', '', 'La cantidad tiene que ser mayor a cero.');
      return;
    }
    this.quantityDrafts[last._id] = this.formatQuantity(quantity);
    this.saveQuantity(last, quantity);
    this.searchTerm = '';
    this.articleMatches = [];
    this.focusSearch();
  }

  private searchArticles(term: string) {
    const trimmed = term.trim();
    if (!trimmed || trimmed.startsWith('*')) {
      return of([]);
    }
    const match = {
      operationType: { $ne: 'D' },
      $or: ['code', 'barcode', 'description', 'codeProvider'].map((field) => ({
        [field]: { $regex: trimmed, $options: 'i' },
      })),
    };
    return this.articleService
      .getAll({
        project: { _id: 1, code: 1, barcode: 1, description: 1, codeProvider: 1, posDescription: 1 },
        match,
        sort: { description: 1 },
        limit: 8,
      })
      .pipe(
        map((result) => (result?.status === 200 ? (result.result ?? []) : [])),
        catchError(() => of([]))
      );
  }

  private isExactArticle(article: any, term: string): boolean {
    const value = term.trim().toLowerCase();
    return [article?.code, article?.barcode, article?.description, article?.posDescription, article?.codeProvider].some(
      (field) => field && String(field).trim().toLowerCase() === value
    );
  }

  private focusSearch(): void {
    setTimeout(() => this.searchInput?.nativeElement?.focus());
  }

  public stepQuantity(movement: MovementOfArticle, delta: number): void {
    if (!this.editable || !movement?._id) {
      return;
    }
    const current = this.parseQuantity(this.quantityDrafts[movement._id]) ?? (Number(movement.amount) || 0);
    const next = current + delta;
    if (next <= 0) {
      return;
    }
    this.quantityDrafts[movement._id] = this.formatQuantity(next);
    this.saveQuantity(movement, next);
  }

  public onQuantityBlur(movement: MovementOfArticle): void {
    if (!this.editable || !movement?._id) {
      return;
    }
    const quantity = this.parseQuantity(this.quantityDrafts[movement._id]);
    if (quantity === null || quantity <= 0) {
      this.quantityDrafts[movement._id] = this.formatQuantity(Number(movement.amount) || 0);
      this.toastService.showToast(null, 'info', '', 'La cantidad tiene que ser mayor a cero.');
      return;
    }
    this.saveQuantity(movement, quantity);
  }

  private saveQuantity(movement: MovementOfArticle, quantity: number): void {
    if (quantity === Number(movement.amount)) {
      return;
    }

    const previous = movement.amount;
    movement.amount = quantity;
    const payload = { ...movement, amount: quantity } as unknown as Parameters<
      MovementOfArticleService['updateMovementOfArticle']
    >[0];
    this.movementOfArticleService.updateMovementOfArticle(payload).subscribe({
      next: (response) => {
        const saved = response?.movementOfArticle || response?.status === 200;
        if (!saved) {
          movement.amount = previous;
          this.quantityDrafts[movement._id] = this.formatQuantity(Number(previous) || 0);
          this.toastService.showToast(null, 'danger', '', response?.message || 'No se pudo actualizar la cantidad.');
        }
      },
      error: () => {
        movement.amount = previous;
        this.quantityDrafts[movement._id] = this.formatQuantity(Number(previous) || 0);
        this.toastService.showToast(null, 'danger', '', 'No se pudo actualizar la cantidad.');
      },
    });
  }

  public deleteLine(movement: MovementOfArticle): void {
    if (!this.editable || !movement?._id) {
      return;
    }
    const modalRef = this.modal.open(ConfirmationQuestionComponent, {
      size: 'md',
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.title = 'Quitar artículo';
    modalRef.componentInstance.subtitle = 'Se saca de este movimiento. El stock no se toca hasta procesar.';
    modalRef.result
      .then((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }
        this.movementOfArticleService.delete(movement._id).subscribe({
          next: (response) => {
            if (response?.status === 200) {
              this.loadMovements();
              return;
            }
            this.toastService.showToast(null, 'danger', '', response?.message || 'No se pudo quitar el artículo.');
          },
          error: () => {
            this.toastService.showToast(null, 'danger', '', 'No se pudo quitar el artículo.');
          },
        });
      })
      .catch(() => {});
  }

  public saveObservation(): void {
    if (!this.editable || !this.transaction) {
      return;
    }
    const next = (this.observationDraft || '').trim();
    const current = (this.transaction.observation || '').trim();
    if (next === current) {
      return;
    }
    this.transaction.observation = next;
    this.transactionService.update(this.transaction).subscribe({
      next: (response) => {
        if (response?.status !== 200) {
          this.toastService.showToast(null, 'danger', '', response?.message || 'No se pudo guardar la nota.');
        }
      },
    });
  }

  public async process(): Promise<void> {
    if (!this.editable || this.processing) {
      return;
    }
    if (!this.movements.length) {
      this.toastService.showToast(null, 'info', '', 'Agregá al menos un artículo antes de procesar.');
      this.focusSearch();
      return;
    }
    if (this.transaction?.type?.transactionMovement !== TransactionMovement.Stock) {
      this.toastService.showToast(null, 'danger', '', 'Este comprobante no es de stock.');
      return;
    }

    this.processing = true;
    const previousState = this.transaction.state;
    const previousEndDate = this.transaction.endDate;
    try {
      if (this.transaction.type?.modifyStock) {
        const stockResult = await firstValueFrom(this.articleStockService.updateStockByTransaction(this.transaction));
        if (stockResult?.status !== 200) {
          const message =
            stockResult?.error?.message ||
            stockResult?.message ||
            'No se pudo actualizar el stock. El movimiento sigue abierto.';
          this.toastService.showToast(null, 'danger', '', message);
          return;
        }
      }

      this.transaction.state = this.transaction.type?.finishState || TransactionState.Closed;
      this.transaction.endDate = new Date().toISOString();
      const updated = await firstValueFrom(this.transactionService.update(this.transaction));
      if (updated?.status !== 200) {
        this.transaction.state = previousState;
        this.transaction.endDate = previousEndDate;
        this.toastService.showToast(
          null,
          'danger',
          '',
          updated?.error?.message || updated?.message || 'No se pudo cerrar el movimiento.'
        );
        return;
      }
      this.toastService.showToast(null, 'success', '', 'Stock procesado.');
      this.goBack();
    } finally {
      this.processing = false;
    }
  }

  private loadTransaction(): void {
    this.beginLoading();
    this.transactionService
      .getById(this.transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.status === 200 && result.result) {
            this.transaction = result.result;
            this.observationDraft = this.transaction.observation || '';
            this.loadMovements();
          } else {
            this.toastService.showToast(null, 'danger', '', 'No se encontró el movimiento.');
            this.goBack();
          }
          this.endLoading();
        },
        error: () => {
          this.endLoading();
          this.toastService.showToast(null, 'danger', '', 'No se pudo cargar el movimiento.');
          this.goBack();
        },
      });
  }

  private loadMovements(focusSearch = false): void {
    this.beginLoading();
    this.movementOfArticleService
      .getMovementsOfArticlesByTransaction(this.transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.movements = result?.result || [];
          const drafts: Record<string, string> = {};
          for (const movement of this.movements) {
            drafts[movement._id] = String(movement.amount ?? '');
          }
          this.quantityDrafts = drafts;
        },
        error: () => {
          this.toastService.showToast(null, 'danger', '', 'No se pudieron cargar los artículos.');
        },
        complete: () => {
          this.endLoading();
          if (focusSearch) {
            setTimeout(() => this.focusSearch());
          }
        },
      });
  }

  private parseQuantity(value: string): number | null {
    if (value === undefined || value === null || String(value).trim() === '') {
      return null;
    }
    const quantity = Number(String(value).replace(',', '.'));
    return Number.isFinite(quantity) ? quantity : null;
  }

  private formatQuantity(value: number): string {
    return Number.isInteger(value) ? String(value) : String(Math.round(value * 1000) / 1000);
  }

  private beginLoading(): void {
    this.loadingCount += 1;
    this.loading = true;
  }

  private endLoading(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    this.loading = this.loadingCount > 0;
  }
}
