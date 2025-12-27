import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IAttribute } from '@types';

@Component({
  selector: 'app-columns-config',
  templateUrl: './columns-config.component.html',
  styleUrls: ['./columns-config.component.scss'],
})
export class ColumnsConfigComponent {
  @Input() columns: IAttribute[] = [];
  @Output() columnsChange = new EventEmitter<IAttribute[]>();
  @Output() visibilityChange = new EventEmitter<void>();

  public searchTerm: string = '';

  get filteredColumns(): IAttribute[] {
    if (!this.searchTerm.trim()) {
      // Cuando no hay búsqueda, simplemente devolver las columnas en su orden actual
      // (que puede ser el orden guardado o el orden por visibilidad si no hay orden guardado)
      return this.columns;
    }
    const term = this.searchTerm.toLowerCase();
    return this.columns.filter((column) => column.name.toLowerCase().includes(term));
  }

  public drop(event: CdkDragDrop<IAttribute[]>): void {
    // Si hay búsqueda activa, no permitir reordenar (ya está deshabilitado en el template)
    if (this.searchTerm.trim()) {
      return;
    }

    // Crear una copia del array actual y reordenarlo según el drop
    const columnsCopy = [...this.columns];
    moveItemInArray(columnsCopy, event.previousIndex, event.currentIndex);

    // Emitir el cambio con el nuevo orden
    this.columnsChange.emit(columnsCopy);
  }

  public onVisibilityChange(): void {
    this.visibilityChange.emit();
  }

  public trackByColumn(index: number, column: IAttribute): string {
    return column.name;
  }
}
