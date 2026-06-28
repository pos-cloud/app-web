import { Injectable } from '@angular/core';

/**
 * ============================================================================
 * TRANSACTION STOCK SERVICE
 * ============================================================================
 * Validación de stock, estructura (combos/recetas) y reglas de movimiento.
 *
 * Migrar desde add-sale-order.component.ts:
 *   - hasStock (1128)
 *   - getArticleStock (1174)
 *   - isValidMovementOfArticle (1082)
 *   - areValidMovementOfArticle (2607)
 *   - getStructure (875)
 *   - getUtilization (933)
 *   - getVariantsByArticleChild (2622)
 *   - updateStockByTransaction (2766)
 *
 * Depende de: ArticleStockService, StructureService, VariantService,
 *   MovementOfArticleService.
 * ============================================================================
 */
@Injectable({ providedIn: 'root' })
export class TransactionStockService {
  // TODO: migrar métodos de stock/validación.
}
