import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';

/**
 * ============================================================================
 * FAST TRANSACTION VIEW  (migración de `add-sale-order.component.ts`)
 * ============================================================================
 *
 * Este componente es el ORQUESTADOR ("cerebro") del POS rápido.
 * NO debe convertirse en un nuevo archivo de 3000 líneas: su trabajo es
 * cargar la transacción, mantener el estado y conectar los 4 componentes
 * tontos vía @Input/@Output. La lógica pesada se delega a services.
 *
 * Layout del HTML (ver fast-transaction.component.html):
 *   <app-header-transaction>            ← arriba   (origen HTML: 1-186)
 *   <app-list-movement-of-transaction>  ← izquierda (origen HTML: 196-421)
 *   <app-buttons-transaction>           ← abajo izq (origen HTML: 422-515)
 *   <app-list-catalog>                  ← derecha   (origen HTML: 517-626)
 *   + ng-template modales               ← (origen HTML: 630-742)
 *
 * --------------------------------------------------------------------------
 * QUÉ MIGRAR ACÁ (orquestación / estado) desde add-sale-order.component.ts:
 * --------------------------------------------------------------------------
 *  - Ciclo de vida y carga:        ngOnInit (285), initComponent (305),
 *                                  processParams (276), initVariables (261),
 *                                  ngAfterViewInit (374)
 *  - Estado transacción:           getTransaction (518), updateTransaction (531),
 *                                  getMovementsOfTransaction (671),
 *                                  getMovementsOfArticles (992), updateQuantity (709)
 *  - Alta de items:                addItem (736)  ← (@Output del catálogo)
 *  - openModal switch (1979-2531): ir reemplazándolo por @Output de cada
 *                                  componente; lo que quede (modales reales)
 *                                  vive acá con los ng-template.
 *  - Navegación / cierre:          finish (2646), close (2834), backFinal (2888)
 *  - Atajos teclado:               handleKeyboardEvent (3578)
 *
 * --------------------------------------------------------------------------
 * QUÉ NO MIGRAR ACÁ → extraer a services/ (siguiente etapa):
 * --------------------------------------------------------------------------
 *  - PRICING  → transaction-pricing.service:
 *      recalculateSalePrice (1298), recalculateCostPrice (1206),
 *      updatePrices (1657), getManualPricesMapForArticle (203),
 *      getIncreasePercentage (3392), getPriceList (404), changePriceList (3491)
 *  - TAXES    → transaction-taxes.service:
 *      updateTaxes (1780), addTransactionTaxes (1652)  + totales
 *  - PRINTING → transaction-printing.service:
 *      print (2734), distributeImpressions (3104), getPrinters (2584),
 *      countPrinters (3073), updateMovementOfArticlePrinted* (2956/2993/3030)
 *  - STOCK/VALIDACIÓN → transaction-stock.service:
 *      hasStock (1128), getArticleStock (1174), isValidMovementOfArticle (1082),
 *      areValidMovementOfArticle (2607), getStructure (875), getUtilization (933)
 *  - CANCELACIONES → ya hay services; orquestar getMovementsOfCancellations (458),
 *      saveMovementsOfCancellations (553), cancelledTransactions (3555)
 * ============================================================================
 */
@Component({
  selector: 'app-fast-transaction',
  standalone: true,
  imports: [
    CommonModule,
    // TODO: importar acá los 4 componentes tontos a medida que se migren:
    // HeaderTransactionComponent,
    // ListMovementOfTransactionComponent,
    // ButtonsTransactionComponent,
    // ListCatalogComponent,
  ],
  templateUrl: './fast-transaction.component.html',
  styleUrls: ['./fast-transaction.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FastTransactionComponent {
  // TODO: mover acá el estado mínimo (transaction, movementsOfArticles, loading, etc.)
}
