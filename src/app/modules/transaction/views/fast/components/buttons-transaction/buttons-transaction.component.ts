import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * ============================================================================
 * BUTTONS TRANSACTION  (componente TONTO / presentacional)
 * ============================================================================
 * Botones de acción bajo la tabla:
 *   - Cobrar / Pagar / Finalizar (+ fastPayment) [F1/F2]
 *   - Cliente / Proveedor, Descuento, Anular
 *   - Stock/Producción: Total + Procesar
 *
 * Origen a migrar: add-sale-order.component.html  líneas 422-515
 *
 * Regla: NO tiene lógica de negocio. Solo botones que emiten eventos.
 *
 * @Input candidatos:
 *   transaction, transactionMovement, loading, quantity
 *
 * @Output candidatos:
 *   charge(fastPayment?)  → hoy openModal('charge', null, transaction.type.fastPayment)
 *   addClient()           → hoy openModal('add_client')
 *   applyDiscount()       → hoy openModal('apply_discount')
 *   cancel()              → hoy openModal('cancel')
 *   finish()              → add-sale-order:2646 (Stock/Producción → Procesar)
 * ============================================================================
 */
@Component({
  selector: 'app-buttons-transaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buttons-transaction.component.html',
  styleUrls: ['./buttons-transaction.component.scss'],
})
export class ButtonsTransactionComponent {
  @Input() transaction: any;
  @Input() transactionMovement: string;
  @Input() loading: boolean;

  @Output() charge = new EventEmitter<any>();
  @Output() addClient = new EventEmitter<void>();
  @Output() applyDiscount = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() finish = new EventEmitter<void>();
}
