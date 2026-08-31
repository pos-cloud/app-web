import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdownModule,
  NgbTypeahead,
  NgbTypeaheadModule,
  NgbTypeaheadSelectItemEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, merge } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-typeahead-dropdown',
  templateUrl: './typeahead-dropdown.component.html',
  styleUrls: ['./typeahead-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, NgbTypeaheadModule, ReactiveFormsModule],
})
export class TypeaheadDropdownComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = ''; // Placeholder opcional
  @Input() control: FormControl; // Control del formulario
  @Input() data: any[] = []; // Lista de opciones para el dropdown
  @Input() readonly: boolean = false; // Deshabilitar el input si es necesario
  @Input() keyField: string = '_id'; // Campo clave del objeto (default: `_id`)
  @Input() displayField: string = 'description'; // Campo para mostrar en el dropdown (default: `description`)
  /** Si true, solo muestra borde rojo cuando formSubmitted es true (no al salir del campo) */
  @Input() showInvalidOnlyAfterSubmit: boolean = false;
  @Input() formSubmitted: boolean = false;

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;
  @ViewChild('typeaheadInput', { static: true }) typeaheadInput: ElementRef<HTMLInputElement>;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  private controlSubscription: Subscription;
  /** Último ítem elegido de la lista; el texto escrito no cuenta como valor. */
  private lastSelected: any = null;

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
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        term === ''
          ? this.data
          : this.data.filter((item) => item[this.displayField]?.toLowerCase().includes(term.toLowerCase()))
      )
    );
  };

  resultFormatter = (item: any): string => item?.[this.displayField] || '';

  onSelectItem(event: NgbTypeaheadSelectItemEvent): void {
    this.lastSelected = event.item;
  }

  onBlur(): void {
    // Esperar a que el click en una opción dispare selectItem antes de validar.
    setTimeout(() => this.syncInputWithSelection());
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

    // Texto escrito sin elegir un ítem: no se guarda, se restaura la última selección o se limpia.
    this.control.setValue(this.lastSelected);
    if (!this.lastSelected && this.typeaheadInput?.nativeElement) {
      this.typeaheadInput.nativeElement.value = '';
    }
  }

  private isSelectedItem(value: any): boolean {
    return !!value && typeof value === 'object' && value[this.keyField] != null;
  }
}
