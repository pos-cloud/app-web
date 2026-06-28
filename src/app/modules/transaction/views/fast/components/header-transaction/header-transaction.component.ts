import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Transaction } from '@types';
import { PipesModule } from 'app/shared/pipes/pipes.module';

/**
 * ============================================================================
 * HEADER TRANSACTION  (componente TONTO / presentacional)
 * ============================================================================
 * Barra superior del POS: mesa, tipo+número, empleado, lista de precio,
 * cliente/proveedor, comensales, fechas, promoción, cotización, opcional AFIP,
 * método de envío, transporte, CFDI (MX), cancelaciones, importar artículos.
 *
 * Origen: add-sale-order.component.html  líneas 2-186
 *
 * Regla: NO tiene lógica de negocio. Solo muestra datos (@Input) y avisa
 * acciones al contenedor (@Output). La lógica vive en el contenedor
 * (add-sale-order hoy, fast-transaction en el futuro).
 *
 * ============================================================================
 */
@Component({
  selector: 'app-header-transaction',
  standalone: true,
  imports: [CommonModule, PipesModule],
  templateUrl: './header-transaction.component.html',
  styleUrls: ['./header-transaction.component.scss'],
})
export class HeaderTransactionComponent {
  @Input() transaction: Transaction;
  @Input() showButtonCancelation: boolean;
  @Input() showButtonInformCancellation: boolean;

  /** Derivado de transaction.type (antes era un @Input que copiaba este mismo valor). */
  get transactionMovement(): string {
    return '' + (this.transaction?.type?.transactionMovement ?? '');
  }

  /** op: change-table | change-employee | current-account | change-quotation |
   *  change-optional-afip | change-shipment-method | list-cancellations | uploadFile */
  @Output() openModal = new EventEmitter<string>();
  @Output() editObservation = new EventEmitter<void>();
  @Output() changeDate = new EventEmitter<void>();
  @Output() applyBusinessRule = new EventEmitter<void>();
  @Output() changePriceList = new EventEmitter<void>();
  @Output() changeTransport = new EventEmitter<void>();
  @Output() cancelledTransactions = new EventEmitter<void>();
}
