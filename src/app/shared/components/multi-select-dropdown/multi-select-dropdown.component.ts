import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class MultiSelectDropdownComponent {
  @Input() data: any[] = [];
  @Input() placeholder: string = '-';
  @Input() textField: string = 'name';
  @Input() allowSearch: boolean = true;

  uniqueId: string;
  selectedItems: any[] = [];
  isOpen = false;
  searchTerm = '';

  @Input() set ngModel(value: any[]) {
    this.selectedItems = value || [];
  }

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

  // Función para alternar la selección
  toggleSelection(item: any) {
    if (this.isSelected(item)) {
      this.selectedItems = this.selectedItems.filter((id) => id !== item._id); // Eliminar _id
    } else {
      this.selectedItems.push(item._id); // Añadir _id
    }
  }

  // Función para obtener los elementos seleccionados como texto
  getSelectedItemsText(): string {
    const selectedCount = this.selectedItems.length; // Contamos la cantidad de elementos seleccionados
    return selectedCount > 0
      ? `${selectedCount} elemento${selectedCount > 1 ? 's' : ''} seleccionado${selectedCount > 1 ? 's' : ''}`
      : this.placeholder;
  }

  // Filtrar los elementos basados en la búsqueda
  filteredItems() {
    return this.searchTerm
      ? this.data.filter((item) => item[this.textField].toLowerCase().includes(this.searchTerm.toLowerCase()))
      : this.data;
  }

  // Emitir cambios de búsqueda (con debounce si es necesario)
  onSearchChange() {
    // Aquí podrías agregar lógica de debounce si lo necesitas.
  }
}
