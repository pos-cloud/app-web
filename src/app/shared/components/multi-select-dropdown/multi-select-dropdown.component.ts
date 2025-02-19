import { CommonModule } from '@angular/common';
import { Component, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

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
export class MultiSelectDropdownComponent implements ControlValueAccessor {
  @Input() data: any[] = [];
  @Input() placeholder: string = '-';
  @Input() textField: string = 'name';
  @Input() allowSearch: boolean = true;

  uniqueId: string;
  selectedItems: any[] = [];
  isOpen = false;
  searchTerm = '';

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

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  isSelected(item: any): boolean {
    return this.selectedItems.includes(item._id);
  }

  toggleSelection(item: any) {
    if (this.isSelected(item)) {
      this.selectedItems = this.selectedItems.filter((id) => id !== item._id);
    } else {
      this.selectedItems.push(item._id);
    }
    this.onChange(this.selectedItems); // Notificar cambios
  }

  getSelectedItemsText(): string {
    const selectedCount = this.selectedItems.length;
    return selectedCount > 0
      ? `${selectedCount} elemento${selectedCount > 1 ? 's' : ''} seleccionado${selectedCount > 1 ? 's' : ''}`
      : this.placeholder;
  }

  filteredItems() {
    return this.searchTerm
      ? this.data.filter((item) => item[this.textField].toLowerCase().includes(this.searchTerm.toLowerCase()))
      : this.data;
  }

  onSearchChange() {}

  /** Métodos de ControlValueAccessor **/
  writeValue(value: any): void {
    this.selectedItems = value || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}
}
