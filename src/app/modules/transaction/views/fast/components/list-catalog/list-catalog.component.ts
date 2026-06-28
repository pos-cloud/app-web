import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * ============================================================================
 * LIST CATALOG  (componente TONTO / presentacional)
 * ============================================================================
 * Columna derecha: input de filtro + toggle grid/lista + botón crear producto +
 * botón "Pendiente" + breadcrumb (Rubros) y los dos componentes existentes:
 *   <app-list-articles-pos>   (list pos articles)
 *   <app-list-categories-pos> (list pos categories)
 *
 * Origen a migrar: add-sale-order.component.html  líneas 517-626
 *
 * Regla: NO recalcula precios ni toca la transacción. Solo busca/filtra y
 * emite el artículo elegido hacia arriba (addItem) para que el contenedor lo
 * agregue. list-articles-pos / list-categories-pos ya existen y se reusan.
 *
 * @Input candidatos:
 *   transaction, transactionId, loading, browseViewMode,
 *   filterArticle, categorySelected, display
 *
 * @Output candidatos:
 *   addItem(event)            → add-sale-order:736
 *   selectCategory(category)  → showArticles() add-sale-order:3338
 *   showCategories()          → add-sale-order:3324
 *   filterArticles()          → add-sale-order:3285
 *   toggleBrowseViewMode()    → add-sale-order:391
 *   openAddArticle()          → hoy openModal('add-article')
 *   close()                   → "Pendiente" add-sale-order:2834
 * ============================================================================
 */
@Component({
  selector: 'app-list-catalog',
  standalone: true,
  imports: [
    CommonModule,
    // TODO: reusar los componentes existentes:
    // ListArticlesPosComponent,   (app/components/article/list-articles-pos)
    // ListCategoriesPosComponent, (app/components/category/list-categories-pos)
  ],
  templateUrl: './list-catalog.component.html',
  styleUrls: ['./list-catalog.component.scss'],
})
export class ListCatalogComponent {
  @Input() transaction: any;
  @Input() transactionId: string;
  @Input() loading: boolean;
  @Input() browseViewMode: 'grid' | 'list' = 'grid';

  @Output() addItem = new EventEmitter<any>();
  @Output() selectCategory = new EventEmitter<any>();
  // TODO: declarar el resto de @Input/@Output a medida que se migra el HTML.
}
