import { Injectable } from '@angular/core';

/**
 * ============================================================================
 * TRANSACTION PRINTING SERVICE
 * ============================================================================
 * Impresión y distribución de comandas (cocina / bar / voucher / mostrador).
 *
 * Migrar desde add-sale-order.component.ts:
 *   - print (2734)
 *   - distributeImpressions (3104)
 *   - getPrinters (2584)
 *   - countPrinters (3073)
 *   - updateMovementOfArticlePrintedBar (2956)
 *   - updateMovementOfArticlePrintedKitchen (2993)
 *   - updateMovementOfArticlePrintedVoucher (3030)
 *
 * Estado relacionado: printers, printersAux, printerSelected, printSelected,
 *   kitchen/bar/voucher ArticlesToPrint + *Printed, typeOfOperationToPrint.
 *
 * Depende de: PrinterService, Print, PrintTransactionType/Print components (modales).
 * ============================================================================
 */
@Injectable({ providedIn: 'root' })
export class TransactionPrintingService {
  // TODO: migrar métodos de impresión.
}
