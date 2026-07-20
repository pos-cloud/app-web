import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { ArticleService } from 'app/core/services/article.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-article-searchable-dropdown',
  templateUrl: './article-searchable-dropdown.component.html',
  styleUrls: ['./article-searchable-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ArticleSearchableDropdownComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Buscar por código, proveedor o descripción…';
  @Input() control: FormControl;
  @Input() readonly = false;
  @Input() showInvalidOnlyAfterSubmit = false;
  @Input() formSubmitted = false;
  @Input() maxHeight = '320px';
  @Input() searchPlaceholder = 'Escribí para buscar…';
  @Input() minSearchLength = 2;
  @Input() initialLimit = 10;
  @Input() resultLimit = 20;

  isOpen = false;
  searching = false;
  searchTerm = '';
  filteredItems: any[] = [];
  emptyMessage = 'No se encontraron resultados';
  uniqueId = 'article-searchable-dropdown-' + Math.random().toString(36).substr(2, 9);

  private readonly searchFields = ['code', 'codeProvider', 'description'];
  private controlSubscription: Subscription;
  private searchSubscription: Subscription;
  private readonly searchTerm$ = new Subject<string>();

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.controlSubscription = this.control.valueChanges.subscribe((value) => {
      if (value === '') {
        this.control.setValue(null, { emitEvent: false });
      }
    });

    this.searchSubscription = this.searchTerm$
      .pipe(
        debounceTime(300),
        switchMap((term) => this.runSearch(term).pipe(finalize(() => (this.searching = false))))
      )
      .subscribe({
        next: (items) => {
          this.filteredItems = items;
        },
        error: () => {
          this.filteredItems = [];
          this.searching = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.controlSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
    this.searchTerm$.complete();
  }

  get disabled(): boolean {
    return this.readonly || this.control?.disabled;
  }

  get isInvalid(): boolean {
    return this.control?.invalid && (this.showInvalidOnlyAfterSubmit ? this.formSubmitted : this.control?.touched);
  }

  getSelectedDisplayText(): string {
    const value = this.control?.value;
    if (!value) {
      return this.placeholder || '';
    }
    return this.formatArticleLabel(value);
  }

  hasSelection(): boolean {
    return !!this.control?.value;
  }

  toggleDropdown(): void {
    if (this.disabled) {
      return;
    }
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchTerm = '';
      this.control.markAsTouched();
      this.requestSearch('');
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.searchTerm = '';
    this.searching = false;
  }

  onSearchChange(): void {
    this.requestSearch(this.searchTerm);
  }

  selectItem(item: any): void {
    this.control.setValue(item);
    this.control.markAsTouched();
    this.closeDropdown();
  }

  isSelected(item: any): boolean {
    const value = this.control?.value;
    if (!value) {
      return false;
    }
    return value._id === item._id;
  }

  getItemPrimary(item: any): string {
    return item?.description || 'Sin descripción';
  }

  getItemCode(item: any): string {
    return item?.code || '—';
  }

  getItemCodeProvider(item: any): string {
    return item?.codeProvider || '—';
  }

  getItemMake(item: any): string {
    return item?.make?.description || item?.['make.description'] || '—';
  }

  trackByItem(_index: number, item: any): string {
    return item?._id ?? _index;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest(`#${this.uniqueId}`)) {
      this.closeDropdown();
    }
  }

  private formatArticleLabel(article: any): string {
    const description = article?.description || '';
    const code = article?.code ? `${article.code}` : '';
    if (code && description) {
      return `${code} — ${description}`;
    }
    return description || code || article?.codeProvider || '';
  }

  private requestSearch(term: string): void {
    this.searching = true;
    this.searchTerm$.next(term);
  }

  private runSearch(term: string): Observable<any[]> {
    const trimmed = term.trim();

    if (trimmed.length > 0 && trimmed.length < this.minSearchLength) {
      this.emptyMessage = `Escribí al menos ${this.minSearchLength} caracteres`;
      return of([]);
    }

    this.emptyMessage = 'No se encontraron resultados';

    const match: Record<string, unknown> = { operationType: { $ne: 'D' } };

    if (trimmed.length >= this.minSearchLength) {
      match.$or = this.searchFields.map((field) => ({
        [field]: { $regex: trimmed, $options: 'i' },
      }));
    }

    const project: Record<string, 1> = {
      _id: 1,
      code: 1,
      codeProvider: 1,
      description: 1,
      'make.description': 1,
      barcode: 1,
      basePrice: 1,
      costPrice: 1,
      taxes: 1,
      operationType: 1,
    };

    return this.articleService
      .getAll({
        project,
        match,
        sort: { description: 1 },
        limit: trimmed.length >= this.minSearchLength ? this.resultLimit : this.initialLimit,
      })
      .pipe(
        map((result) => (result?.status === 200 ? (result.result ?? []) : [])),
        catchError(() => of([])),
        switchMap((items) => of(this.ensureSelectedItemIncluded(items)))
      );
  }

  private ensureSelectedItemIncluded(items: any[]): any[] {
    const value = this.control?.value;
    if (!value || typeof value !== 'object') {
      return items;
    }

    const exists = items.some((item) => item._id === value._id);
    if (exists) {
      return items;
    }

    return [value, ...items];
  }
}
