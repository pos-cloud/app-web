import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class MultiSelectDropdownComponent {
  @Input() data: any[] = [];
  @Input() placeholder: string = 'Selecciona elementos';
  @Input() textField: string = 'name'; // Lo que se mostrará en el dropdown (ej. 'descripcion' o 'name')
  @Input() allowSearch: boolean = true;

  selectedItems: any[] = [];
  isOpen = false;
  searchTerm = '';

  @Input() set ngModel(value: any[]) {
    // Cuando el ngModel cambia, se asegura de que solo estamos guardando los _id en selectedItems
    this.selectedItems = value || [];
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  // Función para verificar si un ítem está seleccionado
  isSelected(item: any): boolean {
    return this.selectedItems.includes(item._id); // Comparamos por _id
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
    const selectedItems = this.data.filter((item) => this.selectedItems.includes(item._id));
    return selectedItems.map((item) => item[this.textField]).join(', ');
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
