import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';

import { Article } from 'app/components/article/article';

import { Category } from '@types';
import { PosArticlesDataService } from '../../services/pos-articles-data.service';

/**
 * POS: rubros + catálogo según `transactionId` (lógica resuelta en la API).
 */
@Component({
  selector: 'app-pos-articles',
  templateUrl: './pos-articles.component.html',
  styleUrls: ['./pos-articles.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PosArticlesComponent implements OnInit {
  @Input() transactionId = '';
  @Output() pendingClick = new EventEmitter<void>();

  viewMode: 'grid' | 'list' = 'grid';
  loading = false;

  categories: Category[] = [];
  articles: Article[] = [];

  constructor(private _posArticlesData: PosArticlesDataService) {}

  ngOnInit(): void {
    if (!this.transactionId) return;
    this.viewMode = 'grid';
    this.fetchCategories();
  }

  toggleArticlesViewMode(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.setViewMode(this.viewMode === 'grid' ? 'list' : 'grid');
  }

  setViewMode(mode: 'grid' | 'list'): void {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    if (mode === 'grid') {
      this.backToCategories();
      return;
    }
    this.fetchArticleCatalog();
  }

  emitPending(event?: Event): void {
    event?.stopPropagation();
    this.pendingClick.emit();
  }

  /** Rubros raíz — mismo criterio de visibilidad venta/compra. */
  fetchCategories(): void {
    if (!this.transactionId) return;

    this.loading = true;
    this.categories = [];

    this._posArticlesData.getCategoriesByTransaction(this.transactionId).subscribe({
      next: (rows) => {
        this.categories = rows ?? [];
        this.loading = false;
      },
      error: () => {
        this.categories = [];
        this.loading = false;
      },
    });
  }

  /**
   * Catálogo POS (vista lista).
   * - Con `categoryId`: carga artículos de ese rubro.
   * - Sin argumentos: carga el catálogo general (primeros 10).
   */
  fetchArticleCatalog(categoryId?: string | null): void {
    if (!this.transactionId) return;

    this.loading = true;
    this.articles = [];

    const payload: { transactionId: string; categoryId?: string; q?: string; limit: number; skip: number } = {
      transactionId: this.transactionId,
      limit: 10,
      skip: 0,
    };
    const id = categoryId != null && String(categoryId).trim() !== '' ? String(categoryId).trim() : '';
    if (id) {
      payload.categoryId = id;
    }

    this._posArticlesData.getArticles(payload).subscribe({
      next: ({ articles }) => {
        this.articles = articles ?? [];
        this.loading = false;
      },
      error: () => {
        this.articles = [];
        this.loading = false;
      },
    });
  }

  backToCategories(): void {
    this.articles = [];
    this.viewMode = 'grid';
    this.fetchCategories();
  }

  imageError(event: Event): void {
    (event.target as HTMLImageElement).src = './../../../assets/img/default.jpg';
  }
}
