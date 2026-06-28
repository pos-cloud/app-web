import { Injectable } from '@angular/core';

/**
 * ============================================================================
 * TRANSACTION PRICING SERVICE
 * ============================================================================
 * Toda la lógica de PRECIOS del POS. Es el bloque más pesado del add-sale-order
 * y NO debe vivir en el contenedor.
 *
 * Migrar desde add-sale-order.component.ts:
 *   - recalculateSalePrice (1298)        ← ~300 líneas, core de precios
 *   - recalculateCostPrice (1206)
 *   - updatePrices (1657)
 *   - getManualPricesMapForArticle (203) + cache manualPricesByArticleId
 *   - getIncreasePercentage (3392)
 *   - getPriceList (404)
 *   - changePriceList (3491)  ← la parte de cálculo; la UI/modal queda en el contenedor
 *
 * Estado relacionado a mover acá: priceList, newPriceList, increasePrice,
 *   lastIncreasePrice, manualPricesByArticleId, manualPricesInflightByArticleId,
 *   explicitNoPriceList.
 *
 * Depende de: PriceListService, PriceListArticleService, RoundNumberPipe.
 * ============================================================================
 */
@Injectable({ providedIn: 'root' })
export class TransactionPricingService {
  // TODO: migrar métodos de precios.
}
