import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdownModule,
  NgbTypeahead,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, merge } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
} from 'rxjs/operators';

@Component({
  selector: 'app-typeahead-dropdown',
  templateUrl: './typeahead-dropdown.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgbDropdownModule,
    NgbTypeaheadModule,
    ReactiveFormsModule,
  ],
})
export class TypeaheadDropdownComponent {
  @Input() placeholder: string = ''; // Placeholder opcional
  @Input() control: FormControl; // Control del formulario
  @Input() data: any[] = []; // Lista de opciones para el dropdown
  @Input() readonly: boolean = false; // Deshabilitar el input si es necesario
  @Input() keyField: string = '_id'; // Campo clave del objeto (default: `_id`)
  @Input() displayField: string = 'description'; // Campo para mostrar en el dropdown (default: `description`)

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  // Función de búsqueda
  searchFn = (text$: Observable<string>): Observable<readonly any[]> => {
    const debouncedText$ = text$.pipe(
      debounceTime(200),
      distinctUntilChanged()
    );
    const clicksWithClosedPopup$ = this.click$.pipe(
      filter(() => !this.instance.isPopupOpen())
    );
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(
        (term) =>
          (term === ''
            ? this.data
            : this.data.filter(
                (item) =>
                  item[this.displayField]
                    ?.toLowerCase()
                    .includes(term.toLowerCase())
              )
          ).slice(0, 10) // Limitar resultados (opcional)
      )
    );
  };

  // Formatear resultados para mostrar en el input y en la lista de opciones
  resultFormatter = (item: any): string => item[this.displayField] || '';
}
