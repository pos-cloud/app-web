import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Article } from 'app/components/article/article';

import { Category } from '@types';
import { PosLineService } from '../../services/pos-line.service';
import { PosArticlesDataService } from '../../services/pos-articles-data.service';
import { posArticleHasMeasure, posArticleHasVariants } from '../../utils/pos-article.utils';
import { PosArticleMeasureModalComponent } from '../pos-article-measure-modal/pos-article-measure-modal.component';
import { PosArticleVariantsModalComponent } from '../pos-article-variants-modal/pos-article-variants-modal.component';

/**
 * POS: grilla = rubros + productos por nivel (`categories/.../browse`).
 * Búsqueda con Enter = `articles/by-transaction`.
 */
@Component({
  selector: 'app-pos-articles',
  templateUrl: './pos-articles.component.html',
  styleUrls: ['./pos-articles.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PosArticlesComponent implements OnInit, AfterViewInit {
  private static readonly LABEL_MAX_LEN = 20;

  @ViewChild('searchInputRef') searchInputRef?: ElementRef<HTMLInputElement>;

  @Input() transactionId = '';
  @Output() pendingClick = new EventEmitter<void>();
  /** Línea creada vía `movements-of-articles/create` (el padre refresca movimientos). */
  @Output() lineAdded = new EventEmitter<void>();

  viewMode: 'grid' | 'list' = 'grid';
  loading = false;
  addingLine = false;
  searchInput = '';
  appliedSearch = '';

  categories: Category[] = [];
  articles: Article[] = [];
  categoryPath: Category[] = [];
  showPrices = false;
  transactionMovement = '';

  constructor(
    private _posArticlesData: PosArticlesDataService,
    private _posLineService: PosLineService,
    private _modalService: NgbModal
  ) {}

  ngOnInit(): void {
    if (!this.transactionId) return;
    this.loadBrowse();
  }

  ngAfterViewInit(): void {
    this.focusSearchInput();
  }

  get searchPlaceholder(): string {
    return 'Código, barcode, descripción o descripción POS… (Enter)';
  }

  get isArticleSearchActive(): boolean {
    return this.appliedSearch.trim().length > 0;
  }

  get showCategoriesInGrid(): boolean {
    return this.viewMode === 'grid' && !this.isArticleSearchActive;
  }

  get currentParentId(): string | undefined {
    const last = this.categoryPath[this.categoryPath.length - 1];
    return last?._id != null ? String(last._id) : undefined;
  }

  get breadcrumbLabel(): string {
    return this.categoryPath.map((c) => c.description).join(' / ');
  }

  get hasBrowseContent(): boolean {
    if (this.isArticleSearchActive || this.viewMode === 'list') {
      return this.articles.length > 0;
    }
    return this.categories.length > 0 || this.articles.length > 0;
  }

  toggleArticlesViewMode(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.setViewMode(this.viewMode === 'grid' ? 'list' : 'grid');
  }

  setViewMode(mode: 'grid' | 'list'): void {
    if (this.viewMode === mode) {
      this.focusSearchInput();
      return;
    }

    this.viewMode = mode;
    this.focusSearchInput();

    if (this.isArticleSearchActive) {
      return;
    }

    if (mode === 'list') {
      this.loadArticles();
      return;
    }

    this.loadBrowse();
  }

  onSearchInputChange(value: string): void {
    this.searchInput = value ?? '';
  }

  /** Enter: con texto → `articles/by-transaction?q=…`; vacío → vuelve al catálogo normal. */
  onSearchSubmit(event?: Event): void {
    event?.preventDefault();
    const q = this.searchInput.trim();
    this.appliedSearch = q;

    if (q.length > 0) {
      this.loadArticleSearch(q, () => this.tryAutoSelectFromSearch(q));
      return;
    }

    this.exitArticleSearch();
    this.focusSearchInput();
  }

  private exitArticleSearch(): void {
    if (this.viewMode === 'list') {
      this.loadArticles();
      return;
    }
    this.loadBrowse();
  }

  emitPending(event?: Event): void {
    event?.stopPropagation();
    this.pendingClick.emit();
  }

  /** Vista lista sin búsqueda: catálogo Final (hasta 200) por transacción. */
  loadArticles(): void {
    if (!this.transactionId) return;
    this.fetchArticlesByTransaction({});
  }

  onArticleClick(article: Article, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.selectArticle(article, { clearSearch: false });
  }

  /** Búsqueda POS: solo productos Final vía `GET articles/by-transaction/:id?q=…`. */
  private loadArticleSearch(q: string, onLoaded?: () => void): void {
    if (!this.transactionId || !q.trim()) return;
    this.fetchArticlesByTransaction({ q: q.trim() }, onLoaded);
  }

  private fetchArticlesByTransaction(opts: { q?: string }, onLoaded?: () => void): void {
    if (!this.transactionId) return;

    this.loading = true;
    this.categories = [];

    this._posArticlesData
      .getArticles({
        transactionId: this.transactionId,
        q: opts.q,
        limit: 200,
      })
      .subscribe({
        next: (result) => {
          this.articles = Array.isArray(result?.articles) ? result.articles : [];
          this.showPrices = !!result?.showPrices;
          this.transactionMovement = result?.transactionMovement ?? this.transactionMovement;
          this.loading = false;
          this.focusSearchInput();
          onLoaded?.();
        },
        error: () => {
          this.articles = [];
          this.loading = false;
          this.focusSearchInput();
          onLoaded?.();
        },
      });
  }

  private tryAutoSelectFromSearch(q: string): void {
    const term = q.trim();
    if (!term || this.articles.length === 0) {
      return;
    }

    if (this.articles.length === 1) {
      this.selectArticle(this.articles[0], { clearSearch: true });
      return;
    }

    const exact = this.articles.find(
      (a) =>
        (a.code && a.code === term) ||
        (a.barcode && a.barcode === term) ||
        (a.description && a.description.toUpperCase() === term.toUpperCase()) ||
        (a.posDescription && a.posDescription.toUpperCase() === term.toUpperCase())
    );

    if (exact) {
      this.selectArticle(exact, { clearSearch: true });
    }
  }

  private selectArticle(article: Article, opts?: { clearSearch?: boolean }): void {
    if (!article?._id || !this.transactionId || this.addingLine) return;

    if (opts?.clearSearch) {
      this.clearSearch();
    }

    if (posArticleHasVariants(article)) {
      this.openVariantsModal(article);
      return;
    }

    if (posArticleHasMeasure(article)) {
      this.openMeasureModal(article);
      return;
    }

    this.submitCreateLine({
      articleId: article._id,
      quantity: 1,
      salePrice: Number(article.salePrice) || 0,
    });
  }

  private openMeasureModal(article: Article): void {
    const ref = this._modalService.open(PosArticleMeasureModalComponent, {
      centered: true,
      backdrop: 'static',
      size: 'sm',
    });
    ref.componentInstance.article = article;
    ref.result.then(
      (result: { quantity: number; salePrice: number }) => {
        this.submitCreateLine({
          articleId: article._id,
          quantity: result.quantity,
          salePrice: result.salePrice,
        });
      },
      () => this.focusSearchInput()
    );
  }

  private openVariantsModal(article: Article): void {
    const ref = this._modalService.open(PosArticleVariantsModalComponent, {
      centered: true,
      backdrop: 'static',
    });
    ref.componentInstance.article = article;
    ref.result.then(
      (result: { articleId: string; quantity: number; salePrice: number }) => {
        this.submitCreateLine({
          articleId: result.articleId,
          quantity: result.quantity,
          salePrice: result.salePrice,
        });
      },
      () => this.focusSearchInput()
    );
  }

  private submitCreateLine(input: { articleId: string; quantity: number; salePrice: number }): void {
    if (!this.transactionId || this.addingLine) return;

    this.addingLine = true;
    this._posLineService
      .createLineWithFeedback({
        transactionId: this.transactionId,
        articleId: input.articleId,
        quantity: input.quantity,
        salePrice: input.salePrice,
      })
      .subscribe((ok) => {
        this.addingLine = false;
        if (ok) {
          this.lineAdded.emit();
        }
        this.focusSearchInput();
      });
  }

  loadBrowse(parentId?: string | null): void {
    if (!this.transactionId) return;

    if (this.isArticleSearchActive) {
      this.loadArticleSearch(this.appliedSearch);
      return;
    }

    this.loading = true;
    this.categories = [];
    this.articles = [];

    const resolvedParentId =
      parentId !== undefined && parentId !== null
        ? String(parentId).trim()
        : this.currentParentId ?? '';

    const payload: { transactionId: string; parentId?: string } = {
      transactionId: this.transactionId,
    };
    if (resolvedParentId) {
      payload.parentId = resolvedParentId;
    }

    this._posArticlesData.browse(payload).subscribe({
      next: (result) => {
        if (!result?.categories || !result?.articles) {
          this.categories = [];
          this.articles = [];
          this.loading = false;
          this.focusSearchInput();
          return;
        }
        this.categories = result.categories;
        this.articles = result.articles;
        this.showPrices = result.showPrices;
        this.transactionMovement = result.transactionMovement;
        this.loading = false;
        this.focusSearchInput();
      },
      error: () => {
        this.categories = [];
        this.articles = [];
        this.loading = false;
        this.focusSearchInput();
      },
    });
  }

  selectCategory(category: Category): void {
    const categoryId = category?._id != null ? String(category._id).trim() : '';
    if (!categoryId) return;

    this.categoryPath = [...this.categoryPath, category];
    this.clearSearch();
    this.loadBrowse(categoryId);
  }

  goBack(): void {
    if (this.categoryPath.length === 0) return;
    this.categoryPath = this.categoryPath.slice(0, -1);
    this.clearSearch();
    this.loadBrowse();
  }

  goToRoot(): void {
    if (this.categoryPath.length === 0) return;
    this.categoryPath = [];
    this.clearSearch();
    this.loadBrowse();
  }

  private clearSearch(): void {
    this.searchInput = '';
    this.appliedSearch = '';
  }

  /** POS: el lector/código siempre debe volver al buscador. */
  focusSearchInput(): void {
    const apply = (): void => {
      const el = this.searchInputRef?.nativeElement;
      if (!el || el.disabled) return;
      el.focus();
      const end = el.value?.length ?? 0;
      try {
        el.setSelectionRange(end, end);
      } catch {
        // inputs no editables en algunos navegadores
      }
    };

    setTimeout(apply);
    requestAnimationFrame(apply);
  }

  getCategoryLabel(category: Category): string {
    return PosArticlesComponent.truncateLabel(category?.description);
  }

  getArticleLabel(article: Article): string {
    return PosArticlesComponent.truncateLabel(article.posDescription || article.description);
  }

  private static truncateLabel(value: string | undefined | null): string {
    const text = String(value ?? '').trim();
    if (text.length <= PosArticlesComponent.LABEL_MAX_LEN) return text;
    return `${text.slice(0, PosArticlesComponent.LABEL_MAX_LEN)}…`;
  }

  getArticlePrice(article: Article): number | null {
    if (!this.showPrices) return null;
    if (this.transactionMovement === 'Venta') {
      return article.salePrice ?? null;
    }
    return article.costPrice ?? null;
  }

  imageError(event: Event): void {
    (event.target as HTMLImageElement).src = './../../../assets/img/default.jpg';
  }
}
