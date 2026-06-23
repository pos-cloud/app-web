import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-searchable-dropdown',
  templateUrl: './searchable-dropdown.component.html',
  styleUrls: ['./searchable-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SearchableDropdownComponent implements OnInit, OnDestroy, OnChanges {
  @Input() placeholder: string = '';
  @Input() control: FormControl;
  @Input() data: any[] = [];
  @Input() readonly: boolean = false;
  @Input() keyField: string = '_id';
  @Input() displayField: string = 'description';
  @Input() showInvalidOnlyAfterSubmit: boolean = false;
  @Input() formSubmitted: boolean = false;
  @Input() maxHeight: string = '300px';
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() service?: { getAll: (params: any) => Observable<any> };
  @Input() searchFields?: string[];
  @Input() match: Record<string, unknown> = { operationType: { $ne: 'D' } };
  @Input() minSearchLength: number = 2;
  @Input() initialLimit: number = 10;
  @Input() resultLimit: number = 20;

  isOpen = false;
  searching = false;
  searchTerm = '';
  filteredItems: any[] = [];
  emptyMessage = 'No se encontraron resultados';
  uniqueId = 'searchable-dropdown-' + Math.random().toString(36).substr(2, 9);

  private controlSubscription: Subscription;
  private searchSubscription: Subscription;
  private readonly searchTerm$ = new Subject<string>();

  get isRemote(): boolean {
    return !!this.service;
  }

  ngOnInit(): void {
    this.refreshLocalItems();
    this.controlSubscription = this.control.valueChanges.subscribe((value) => {
      if (value === '') {
        this.control.setValue(null, { emitEvent: false });
      }
    });

    this.searchSubscription = this.searchTerm$
      .pipe(
        debounceTime(300),
        switchMap((term) =>
          this.runSearch(term).pipe(finalize(() => (this.searching = false)))
        )
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !this.isRemote) {
      this.refreshLocalItems();
    }
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
    if (typeof value === 'object') {
      return value[this.displayField] || '';
    }
    const item = this.data.find((d) => d[this.keyField] === value);
    return item ? item[this.displayField] : '';
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
    if (typeof value === 'object') {
      return value[this.keyField] === item[this.keyField];
    }
    return value === item[this.keyField];
  }

  getItemDisplay(item: any): string {
    return item[this.displayField] || '';
  }

  getItemPadding(level: number): string {
    return `${(level || 0) * 20}px`;
  }

  trackByItem(_index: number, item: any): string {
    return item?.[this.keyField] ?? _index;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest(`#${this.uniqueId}`)) {
      this.closeDropdown();
    }
  }

  private requestSearch(term: string): void {
    if (this.isRemote) {
      this.searching = true;
      this.searchTerm$.next(term);
      return;
    }
    this.applyLocalSearch(term);
  }

  private runSearch(term: string): Observable<any[]> {
    const trimmed = term.trim();

    if (!this.isRemote) {
      return of(this.filterLocalItems(trimmed));
    }

    if (trimmed.length > 0 && trimmed.length < this.minSearchLength) {
      this.emptyMessage = `Escribí al menos ${this.minSearchLength} caracteres`;
      return of([]);
    }

    this.emptyMessage = 'No se encontraron resultados';
    const fields = this.searchFields?.length ? this.searchFields : [this.displayField];
    const match: Record<string, unknown> = { ...this.match };

    if (trimmed.length >= this.minSearchLength) {
      match.$or = fields.map((field) => ({
        [field]: { $regex: trimmed, $options: 'i' },
      }));
    }

    const project: Record<string, 1> = {
      [this.keyField]: 1,
      [this.displayField]: 1,
      operationType: 1,
    };
    fields.forEach((field) => {
      project[field] = 1;
    });

    return this.service!.getAll({
      project,
      match,
      sort: { [this.displayField]: 1 },
      limit: trimmed.length >= this.minSearchLength ? this.resultLimit : this.initialLimit,
    }).pipe(
      map((result) => (result?.status === 200 ? (result.result ?? []) : [])),
      catchError(() => of([])),
      switchMap((items) => of(this.ensureSelectedItemIncluded(items)))
    );
  }

  private refreshLocalItems(): void {
    if (!this.isRemote) {
      this.filteredItems = this.filterLocalItems(this.searchTerm.trim());
    }
  }

  private applyLocalSearch(term: string): void {
    this.emptyMessage = 'No se encontraron resultados';
    this.filteredItems = this.filterLocalItems(term.trim());
  }

  private filterLocalItems(term: string): any[] {
    let items = this.data;

    if (term) {
      const normalized = term.toLowerCase();
      items = this.data.filter((item) => item[this.displayField]?.toLowerCase().includes(normalized));
    }

    const limit = term ? this.resultLimit : this.initialLimit;
    return this.ensureSelectedItemIncluded(items.slice(0, limit));
  }

  private ensureSelectedItemIncluded(items: any[]): any[] {
    const value = this.control?.value;
    if (!value || typeof value !== 'object') {
      return items;
    }

    const exists = items.some((item) => item[this.keyField] === value[this.keyField]);
    if (exists) {
      return items;
    }

    return [value, ...items];
  }
}
