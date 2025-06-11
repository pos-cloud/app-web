import { CommonModule } from '@angular/common';
import { Component, forwardRef, HostListener, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectDropdownComponent),
      multi: true,
    },
  ],
})
export class MultiSelectDropdownComponent implements ControlValueAccessor, OnDestroy {
  @Input() data: any[] = [];
  @Input() placeholder: string = 'Seleccionar...';
  @Input() textField: string = 'name';
  @Input() allowSearch: boolean = true;
  @Input() multi: boolean = true;
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() noResultsText: string = 'No se encontraron resultados';

  uniqueId: string;
  selectedItems: any[] = [];
  isOpen = false;
  searchTerm = '';
  private destroy$ = new Subject<void>();

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const dropdownElement = document.querySelector(`#${this.uniqueId}`);
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  constructor() {
    this.uniqueId = `dropdown-${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.onTouched();
    }
  }

  hasSelection(): boolean {
    if (this.multi) {
      return (this.selectedItems as any[]).length > 0;
    }
    return this.selectedItems !== null && this.selectedItems !== undefined;
  }

  isSelected(item: any): boolean {
    if (this.multi) {
      return (this.selectedItems as any[]).includes(item._id);
    } else {
      return this.selectedItems === item._id;
    }
  }

  toggleSelection(item: any) {
    if (this.multi) {
      if (this.isSelected(item)) {
        this.selectedItems = (this.selectedItems as any[]).filter((id) => id !== item._id);
      } else {
        this.selectedItems = [...(this.selectedItems as any[]), item._id];
      }
    } else {
      this.selectedItems = item._id;
      this.isOpen = false;
    }

    this.onChange(this.selectedItems);
  }

  getSelectedItemsText(): string {
    if (this.multi) {
      const selectedCount = (this.selectedItems as any[]).length;
      if (selectedCount === 0) return this.placeholder;

      if (selectedCount === 1) {
        const selected = this.data.find((d) => d._id === this.selectedItems[0]);
        return selected ? selected[this.textField] : this.placeholder;
      }

      return `${selectedCount} item${selectedCount > 1 ? 's' : ''}`;
    } else {
      const selected = this.selectedItems ? this.data.find((d) => d._id === this.selectedItems) : null;
      return selected ? selected[this.textField] : this.placeholder;
    }
  }

  filteredItems() {
    if (!this.searchTerm) return this.data;

    const searchTermLower = this.searchTerm.toLowerCase();
    return this.data.filter((item) => item[this.textField].toLowerCase().includes(searchTermLower));
  }

  onSearchChange() {
    this.searchTerm = this.searchTerm;
  }

  /** Métodos de ControlValueAccessor **/
  writeValue(value: any): void {
    this.selectedItems = value ?? (this.multi ? [] : null);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}
}
