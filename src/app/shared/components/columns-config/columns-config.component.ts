import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IAttribute } from '@types';
import { PipesModule } from 'app/shared/pipes/pipes.module';

@Component({
  selector: 'app-columns-config',
  templateUrl: './columns-config.component.html',
  styleUrls: ['./columns-config.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TranslateModule, PipesModule],
})
export class ColumnsConfigComponent {
  @Input() columns: IAttribute[] = [];
  @Output() columnsChange = new EventEmitter<IAttribute[]>();
  @Output() visibilityChange = new EventEmitter<void>();

  public searchTerm: string = '';

  constructor(private translateService: TranslateService) {}

  get filteredColumns(): IAttribute[] {
    if (!this.searchTerm.trim()) {
      // Cuando no hay búsqueda, simplemente devolver las columnas en su orden actual
      // (que puede ser el orden guardado o el orden por visibilidad si no hay orden guardado)
      return this.columns;
    }
    const term = this.searchTerm.toLowerCase();
    return this.columns.filter((column) => {
      // Buscar tanto en la clave de traducción como en el texto traducido
      const translatedName = this.translateService.instant(column.name)?.toLowerCase() || '';
      const columnName = column.name.toLowerCase();
      return columnName.includes(term) || translatedName.includes(term);
    });
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
