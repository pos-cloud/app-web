import { Routes } from '@angular/router';
import { NotificationGuard } from '@core/guards/notification.guard';
import { LoginComponent } from './auth/login/login.component';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { ListArticleStocksComponent } from './components/article-stock/list-article-stocks/list-article-stocks.component';
import { ListArticlesComponent } from './components/article/list-articles/list-articles.component';
import { ListCancellationTypeComponent } from './components/cancellation-type/list-cancellation-types/list-cancellation-types.component';
import { ListCashBoxComponent } from './components/cash-box/list-cash-box/list-cash-box.component';
import { ListCashBoxesComponent } from './components/cash-box/list-cash-boxes/list-cash-boxes.component';
import { ListCategoriesComponent } from './components/category/list-categories/list-categories.component';
import { ConfigComponent } from './components/config/config.component';
import { CurrentAccountComponent } from './components/current-account/current-account.component';
import { ListEmailTemplatesComponent } from './components/email-template/list-email-templates/list-email-templates.component';
import { ExportCitiComponent } from './components/export/export-citi/export-citi.component';
import { ExportIvaComponent } from './components/export/export-iva/export-iva.component';
import { ListHistoriesComponent } from './components/history/list-history/list-histories.component';
import { KardexCheckComponent } from './components/kardex-check/kardex-check.component';
import { MenuComponent } from './components/menu/menu.component';
import { ListMovementsOfArticlesComponent } from './components/movement-of-article/list-movements-of-articles/list-movements-of-articles.component';
import { ListMovementsOfCancellationsComponent } from './components/movement-of-cancellation/list-movements-of-cancellations/list-movements-of-cancellations.component';
import { ListChecksComponent } from './components/movement-of-cash/list-checks/list-checks.component';
import { ListMovementOfCashesComponent } from './components/movement-of-cash/list-movements-of-cashes/list-movements-of-cashes.component';
import { ListOriginsComponent } from './components/origin/list-origins/list-origins.component';
import { ListPaymentMethodsComponent } from './components/payment-method/list-payment-methods/list-payment-methods.component';
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';
import { PosClientViewComponent } from './components/pos-client-view/pos-client-view.component';
import { PosKitchenComponent } from './components/pos-kitchen/pos-kitchen.component';
import { PosPackingComponent } from './components/pos-packing/pos-packing.component';
import { ListPriceListsComponent } from './components/price-list/list-price-lists/list-price-lists.component';
import { CurrentAccountDetailsComponent } from './components/print/current-account-details/current-account-details.component';
import { ReportBestSellingArticleComponent } from './components/report-best-selling-article/report-best-selling-article.component';
import { ReportSalesByCategoryComponent } from './components/report-sales-by-category/report-sales-by-category.component';
import { ReportSalesByClientComponent } from './components/report-sales-by-client/report-sales-by-client.component';
import { ReportSalesByEmployeeComponent } from './components/report-sales-by-employee/report-sales-by-employee.component';
import { ReportSalesByMakeComponent } from './components/report-sales-by-make/report-sales-by-make.component';
import { ReportSalesByPaymentMethodComponent } from './components/report-sales-by-payment-method/report-sales-by-payment-method.component';
import { ReportTransactionTypeComponent } from './components/report-transaction-type/report-transaction-type.component';
import { ListStatesComponent } from './components/state/list-states/list-states.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ListTaxesComponent } from './components/tax/list-taxes/list-taxes.component';
import { ListTransactionsComponent } from './components/transaction/list-transactions/list-transactions.component';
import { ListUsersComponent } from './components/user/list-users/list-users.component';
import { ListVATConditionsComponent } from './components/vat-condition/list-vat-conditions/list-vat-conditions.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LicenseGuard } from './core/guards/license.guard';
import { HomeComponent } from './layout/home/home.component';

export const _routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard, LicenseGuard, NotificationGuard],
  },
  {
    path: 'inicio',
    component: HomeComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'histories',
    component: ListHistoriesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/venta/statistics',
    component: StatisticsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'cheque',
    component: KardexCheckComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/venta/productos-mas-vendidos',
    component: ReportBestSellingArticleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'admin/venta/ventas-por-metodo-de-pago',
    component: ReportSalesByPaymentMethodComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'admin/venta/ventas-por-empleado',
    component: ReportSalesByEmployeeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'admin/venta/marcas-mas-vendidas',
    component: ReportSalesByMakeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'admin/venta/ventas-por-cliente',
    component: ReportSalesByClientComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'admin/venta/rubros-mas-vendidos',
    component: ReportSalesByCategoryComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'admin/compra/statistics',
    component: StatisticsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/compra/productos-mas-comprados',
    component: ReportBestSellingArticleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/compras/compras-por-empleado',
    component: ReportSalesByEmployeeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/compra/compras-por-metodo-de-pago',
    component: ReportSalesByPaymentMethodComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/compra/marcas-mas-compradas',
    component: ReportSalesByMakeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/compra/compras-por-proveedor',
    component: ReportSalesByClientComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/compra/rubros-mas-comprados',
    component: ReportSalesByCategoryComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/cajas',
    component: ListCashBoxesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' },
  },
  {
    path: 'admin/variantes',
    component: ListArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/variantes/:id',
    component: ListArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/states',
    component: ListStatesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/price-list',
    component: ListPriceListsComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/ventas',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'admin/compras',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/stock',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' },
  },
  {
    path: 'admin/fondos',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' },
  },
  {
    path: 'admin/production',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    //data: { module: 'config.modules.production' }
  },

  {
    path: 'admin/produccion/movimientos-de-productos',
    component: ListMovementsOfArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    //data: { module: 'config.modules.production' }
  },
  {
    path: 'admin/condiciones-de-iva',
    component: ListVATConditionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/categories',
    component: ListCategoriesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/usuarios',
    component: ListUsersComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/usuarios-web',
    component: ListUsersComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.app' },
  },
  {
    path: 'admin/metodos-de-pago',
    component: ListPaymentMethodsComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/configuraciones',
    component: ConfigComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/cuentas-corrientes',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'report/venta/movimientos-de-cancellaciones',
    component: ListMovementsOfCancellationsComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'report/compra/movimientos-de-cancellaciones',
    component: ListMovementsOfCancellationsComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'report/list-box/:cashBoxId',
    component: ListCashBoxComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' },
  },
  {
    path: 'admin/export-citi',
    component: ExportCitiComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/export-iva',
    component: ExportIvaComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/stock-de-productos',
    component: ListArticleStocksComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' },
  },
  {
    path: 'admin/impuestos',
    component: ListTaxesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/puntos-de-venta',
    component: ListOriginsComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/tipos-de-cancelaciones',
    component: ListCancellationTypeComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'report/cartera-de-cheques',
    component: ListChecksComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' },
  },
  {
    path: 'admin/venta/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'admin/compra/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/fondos/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' },
  },
  {
    path: 'admin/venta/movimientos-de-productos',
    component: ListMovementsOfArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'admin/compra/movimientos-de-productos',
    component: ListMovementsOfArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'admin/stock/movimientos-de-productos',
    component: ListMovementsOfArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' },
  },
  {
    path: 'admin/template-emails',
    component: ListEmailTemplatesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'pos/resto/salones/:id/mesas',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' },
  },
  {
    path: 'pos/resto/salones/:id/mesas/:id/editar-transaccion',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' },
  },
  {
    path: 'report/compra/compras-por-tipo-de-transacción',
    component: ReportTransactionTypeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'report/venta/ventas-por-tipo-de-transacción',
    component: ReportTransactionTypeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'report/fondo/fondos-por-tipo-de-transacción',
    component: ReportTransactionTypeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' },
  },
  {
    path: 'report/current-account',
    component: CurrentAccountDetailsComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'pos',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'pos/mostrador/venta',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.counter' },
  },
  {
    path: 'pos/mostrador/compra',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' },
  },
  {
    path: 'pos/mostrador/fondo',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' },
  },
  {
    path: 'pos/mostrador/stock',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' },
  },
  {
    path: 'pos/mostrador/production',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.production' },
  },
  {
    path: 'pos/mostrador/editar-transaccion',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'pos/delivery',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.delivery' },
  },
  {
    path: 'pos/retiro-de-pedidos',
    component: PosClientViewComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'pos/armado-de-pedidos',
    component: PosPackingComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'pos/delivery/editar-transaccion',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.delivery' },
  },
  {
    path: 'pos/resto',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' },
  },
  {
    path: 'pos/resto/editar-transaccion',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' },
  },
  {
    path: 'pos/lector-de-vouchers',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' },
  },
  {
    path: 'pos/cocina',
    component: PosKitchenComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.production.kitchen' },
  },
  {
    path: 'menu/:database',
    component: MenuComponent,
  },
  // MODULES ROUTES
  {
    path: 'entities',
    canActivate: [AuthGuard, LicenseGuard],
    loadChildren: () => import('./modules/entities/entities.routes').then((m) => m.ENTITIES_ROUTES),
  },
  {
    path: 'reports',
    canActivate: [AuthGuard, LicenseGuard],
    loadChildren: () => import('./modules/reports/reports.routes').then((m) => m.REPORTS_ROUTES),
  },
  {
    path: 'pos',
    canActivate: [AuthGuard, LicenseGuard],
    loadChildren: () => import('./modules/pos/pos.routes').then((m) => m.POS_ROUTES),
  },
  {
    path: 'license',
    canActivate: [AuthGuard],
    loadComponent: () => import('./layout/license/license.component').then((m) => m.LicenseComponent),
  },
  // {
  //   path: 'transaction',
  // },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];
