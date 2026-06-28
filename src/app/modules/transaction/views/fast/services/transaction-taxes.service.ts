import { Injectable } from '@angular/core';

/**
 * ============================================================================
 * TRANSACTION TAXES SERVICE
 * ============================================================================
 * Lógica de IMPUESTOS y totales derivados.
 *
 * Migrar desde add-sale-order.component.ts:
 *   - updateTaxes (1780)
 *   - addTransactionTaxes (1652)
 *   - cálculo de totalTaxesAmount / totalTaxesBase (los muestra la tabla de totales)
 *   - filtersTaxClassification (estado de apoyo)
 *
 * Depende de: Taxes, TaxClassification, RoundNumberPipe.
 * ============================================================================
 */
@Injectable({ providedIn: 'root' })
export class TransactionTaxesService {
  // TODO: migrar métodos de impuestos.
}
