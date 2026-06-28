import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * ============================================================================
 * LIST MOVEMENT OF TRANSACTION  (componente TONTO / presentacional)
 * ============================================================================
 * Columna izquierda: tabla de items del pedido (movementsOfArticles) + bloque
 * de totales (Productos, Subtotal, Descuento, Neto Gravado, Impuestos, Exento,
 * M3, Peso, TOTAL).
 *
 * Origen a migrar: add-sale-order.component.html  líneas 196-421
 *
 * Regla: NO tiene lógica de negocio. Recibe la lista ya calculada y los totales;
 * solo renderiza y avisa clicks.
 *
 * @Input candidatos:
 *   movementsOfArticles, transaction, transactionMovement, loading,
 *   areMovementsOfArticlesEmpty, quantity,
 *   totalTaxesAmount, totalTaxesBase, m3, weight
 *
 * @Output candidatos:
 *   openMovement(movementOfArticle)  → hoy openModal('movement_of_article', mov)
 *   openChangeTaxes()                → hoy openModal('change-taxes')
 * ============================================================================
 */
@Component({
  selector: 'app-list-movement-of-transaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-movement-of-transaction.component.html',
  styleUrls: ['./list-movement-of-transaction.component.scss'],
})
export class ListMovementOfTransactionComponent {
  @Input() movementsOfArticles: any[] = [];
  @Input() transaction: any;
  @Input() loading: boolean;

  @Output() openMovement = new EventEmitter<any>();
  // TODO: declarar el resto de @Input/@Output a medida que se migra el HTML.
}
