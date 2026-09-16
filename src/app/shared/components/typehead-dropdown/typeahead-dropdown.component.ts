import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdownModule,
  NgbTypeahead,
  NgbTypeaheadModule,
  NgbTypeaheadSelectItemEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, merge, of } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-typeahead-dropdown',
  templateUrl: './typeahead-dropdown.component.html',
  styleUrls: ['./typeahead-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, NgbTypeaheadModule, ReactiveFormsModule],
})
export class TypeaheadDropdownComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = '';
  @Input() control: FormControl;
  @Input() data: any[] = [];
  @Input() readonly: boolean = false;
  @Input() keyField: string = '_id';
  @Input() displayField: string = 'description';
  @Input() displayFields?: string[];
  @Input() limit: number = 10;
  @Input() showInvalidOnlyAfterSubmit: boolean = false;
  @Input() formSubmitted: boolean = false;
  @Input() service?: { getAll: (params: any) => Observable<any> };
  @Input() searchFields?: string[];
  @Input() match: Record<string, unknown> = { operationType: { $ne: 'D' } };
  @Input() projectFields?: string[];
  @Input() minSearchLength: number = 1;

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  @ViewChild('typeaheadInput', { static: true }) typeaheadInput: ElementRef<HTMLInputElement>;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  private controlSubscription: Subscription;
  private lastSelected: any = null;

  get isRemote(): boolean {
    return !!this.service;
  }

  ngOnInit(): void {
    this.lastSelected = this.isSelectedItem(this.control?.value) ? this.control.value : null;

    this.controlSubscription = this.control.valueChanges.subscribe((value) => {
      if (this.isSelectedItem(value)) {
        this.lastSelected = value;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.controlSubscription) {
      this.controlSubscription.unsubscribe();
    }
  }

  searchFn = (text$: Observable<string>): Observable<readonly any[]> => {
    const selectedLabel$ = text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((term) => this.shouldSearchTerm(term))
    );
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(selectedLabel$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) => this.normalizeTerm(term)),
      switchMap((term) => this.runSearch(term))
    );
  };

  resultFormatter = (item: any): string => {
    if (this.displayFields?.length) {
      return this.displayFields
        .map((field) => item?.[field])
        .filter((value) => value != null && value !== '')
        .join(' - ');
    }
    return item?.[this.displayField] || '';
  };

  onSelectItem(event: NgbTypeaheadSelectItemEvent): void {
    this.lastSelected = event.item;
  }

  onBlur(): void {
    setTimeout(() => this.syncInputWithSelection());
  }

  private shouldSearchTerm(term: string): boolean {
    const query = this.normalizeTerm(term).toLowerCase();
    const selectedLabel = this.resultFormatter(this.control?.value).trim().toLowerCase();
    if (!query) {
      return true;
    }
    return query !== selectedLabel;
  }

  private normalizeTerm(term: unknown): string {
    return (typeof term === 'string' ? term : '').trim();
  }

  private runSearch(term: string): Observable<any[]> {
    if (this.isRemote) {
      return this.runRemoteSearch(term);
    }
    return of(this.getLocalResults(term));
  }

  private runRemoteSearch(term: string): Observable<any[]> {
    const query = term.toLowerCase();
    if (query.length > 0 && query.length < this.minSearchLength) {
      return of([]);
    }

    const fields = this.searchFields?.length ? this.searchFields : [this.displayField];
    const match: Record<string, unknown> = { ...this.match };

    if (query.length >= this.minSearchLength) {
      match.$or = fields.map((field) => ({
        [field]: { $regex: term.trim(), $options: 'i' },
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
    this.projectFields?.forEach((field) => {
      project[field] = 1;
    });
    Object.keys(match).forEach((field) => {
      if (!field.startsWith('$')) {
        project[field] = 1;
      }
    });

    const max = Number(this.limit) > 0 ? Number(this.limit) : 10;

    return this.service!.getAll({
      project,
      match,
      sort: { [this.displayField]: 1 },
      limit: max,
    }).pipe(
      map((result) => this.unwrapResult(result)),
      catchError(() => of([]))
    );
  }

  private getLocalResults(term: string): any[] {
    const list = Array.isArray(this.data) ? this.data : [];
    const query = term.toLowerCase();
    const filtered = query
      ? list.filter((item) => item?.[this.displayField]?.toString().toLowerCase().includes(query))
      : list;
    const max = Number(this.limit) > 0 ? Number(this.limit) : 10;
    return filtered.slice(0, max);
  }

  private unwrapResult(result: any): any[] {
    if (Array.isArray(result)) {
      return result;
    }
    if (result?.status === 200) {
      return result.result ?? [];
    }
    return Array.isArray(result?.result) ? result.result : [];
  }

  private syncInputWithSelection(): void {
    const value = this.control?.value;
    if (this.isSelectedItem(value)) {
      this.lastSelected = value;
      return;
    }

    const typed = (this.typeaheadInput?.nativeElement?.value || '').trim();
    if (!typed) {
      this.lastSelected = null;
      this.control.setValue(null);
      return;
    }

    this.control.setValue(this.lastSelected);
    if (!this.lastSelected && this.typeaheadInput?.nativeElement) {
      this.typeaheadInput.nativeElement.value = '';
    }
  }

  private isSelectedItem(value: any): boolean {
    return !!value && typeof value === 'object' && value[this.keyField] != null;
  }
}
