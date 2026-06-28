import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * ============================================================================
 * HEADER TRANSACTION  (componente TONTO / presentacional)
 * ============================================================================
 * Barra superior del POS: mesa, tipo+número, empleado, lista de precio,
 * cliente/proveedor, comensales, fechas, promoción, cotización, opcional AFIP,
 * método de envío, transporte, CFDI (MX), cancelaciones, importar artículos.
 *
 * Origen a migrar: add-sale-order.component.html  líneas 1-186
 *
 * Regla: NO tiene lógica de negocio. Solo muestra datos (@Input) y avisa
 * acciones al contenedor (@Output). Toda la lógica vive en fast-transaction.
 *
 * @Input candidatos:
 *   transaction, transactionMovement, posType, userCountry,
 *   usesOfCFDI, relationTypes, showButtonCancelation, showButtonInformCancellation
 *
 * @Output candidatos (hoy son openModal('...') / métodos en add-sale-order):
 *   openModal(op: string)         → change-table, change-employee, current-account,
 *                                    change-quotation, change-optional-afip,
 *                                    change-shipment-method, list-cancellations, uploadFile
 *   editObservation()             → add-sale-order:3427
 *   changeDate()                  → 3461
 *   applyBusinessRule()           → 3537
 *   changeTransport()             → 3444
 *   changePriceList()             → 3491
 *   changeUseOfCFDI(value)        → 490
 *   updateTransaction()           → 531 (relationType)
 *   cancelledTransactions()       → 3555
 * ============================================================================
 */
@Component({
  selector: 'app-header-transaction',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header-transaction.component.html',
  styleUrls: ['./header-transaction.component.scss'],
})
export class HeaderTransactionComponent {
  @Input() transaction: any;
  @Input() transactionMovement: string;

  @Output() openModal = new EventEmitter<string>();
  // TODO: declarar el resto de @Input/@Output a medida que se migra el HTML.
}
