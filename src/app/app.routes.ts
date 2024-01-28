import { HomeComponent } from './layout/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ListArticlesComponent } from './components/article/list-articles/list-articles.component';
import { ListEmployeesComponent } from './components/employee/list-employees/list-employees.component';
import { ListEmployeeTypesComponent } from './components/employee-type/list-employee-types/list-employee-types.component';
import { ListTablesComponent } from './components/table/list-tables/list-tables.component';
import { ListTransactionsComponent } from './components/transaction/list-transactions/list-transactions.component';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { ListRoomsComponent } from './components/room/list-rooms/list-rooms.component';
import { ListCategoriesComponent } from './components/category/list-categories/list-categories.component';
import { ListUsersComponent } from './components/user/list-users/list-users.component';
import { ListPrintersComponent } from './components/printer/list-printers/list-printers.component';
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';
import { ImportComponent } from './components/import/import.component';
import { ConfigComponent } from './components/config/config.component';
import { CurrentAccountComponent } from './components/current-account/current-account.component';
import { SendEmailComponent } from './components/send-email/send-email.component';
import { RegisterComponent } from './components/register/register.component';
import { ExportCitiComponent } from './components/export/export-citi/export-citi.component';
import { ExportIvaComponent } from './components/export/export-iva/export-iva.component';
import { ListVariantTypesComponent } from './components/variant-type/list-variant-types/list-variant-types.component';
import { ListCashBoxesComponent } from './components/cash-box/list-cash-boxes/list-cash-boxes.component';
import { AuthGuard } from './main/guards/auth.guard';
import { ListArticleStocksComponent } from './components/article-stock/list-article-stocks/list-article-stocks.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ListDepositsComponent } from './components/deposit/list-deposits/list-deposits.component';
import { ListLocationsComponent } from './components/location/list-locations/list-locations.component';
import { ListMovementOfCashesComponent } from './components/movement-of-cash/list-movements-of-cashes/list-movements-of-cashes.component';
import { ReportBestSellingArticleComponent } from './components/report-best-selling-article/report-best-selling-article.component';
import { ListArticleFieldsComponent } from './components/article-field/list-article-fields/list-article-fields.component';
import { ListSummaryOfAccountsComponent } from "./components/list-summary-of-accounts/list-summary-of-accounts.component";
import { ReportSalesByPaymentMethodComponent } from './components/report-sales-by-payment-method/report-sales-by-payment-method.component';
import { ReportSalesByMakeComponent } from './components/report-sales-by-make/report-sales-by-make.component';
import { ReportSalesByClientComponent } from './components/report-sales-by-client/report-sales-by-client.component';
import { ReportSalesByCategoryComponent } from './components/report-sales-by-category/report-sales-by-category.component';
import { UpdateArticlePriceComponent } from "./components/article/update-article-price/update-article-price.component"
import { ListVATConditionsComponent } from './components/vat-condition/list-vat-conditions/list-vat-conditions.component';
import { ReportBirthdayComponent } from './components/report-birthday/report-birthday.component';
import { ReportSalesByEmployeeComponent } from './components/report-sales-by-employee/report-sales-by-employee.component'
import { ListIdentificationTypesComponent } from './components/identification-type/list-identification-types/list-identification-types.component';
import { ListMakesComponent } from './components/make/list-makes/list-makes.component';
import { ListPaymentMethodsComponent } from './components/payment-method/list-payment-methods/list-payment-methods.component';
import { ListUsesOfCFDIComponent } from './components/use-of-CFDI.component.ts/list-uses-of-CFDI/list-uses-of-CFDI.component';
import { ListRelationTypesComponent } from './components/relation-type/list-relation-types/list-relation-types.component';
import { ListCompanyFieldsComponent } from './components/company/list-company-fields/list-company-fields.component';
import { ListCancellationTypeComponent } from './components/cancellation-type/list-cancellation-types/list-cancellation-types.component';
import { Routes } from '@angular/router';
import { ListCurrenciesComponent } from './components/currency/list-currencies/list-currencies.component';
import { ReportKardexComponent } from './components/report-kardex/report-kardex.component';
import { ListStatesComponent } from './components/state/list-states/list-states.component';
import { ListCountriesComponent } from './components/country/list-countries/list-countries.component';
import { ListBankComponent } from './components/bank/list-bank/list-bank.component'
import { ListBranchComponent } from './components/branch/list-branches/list-branches.component';
import { ListOriginsComponent } from './components/origin/list-origins/list-origins.component';
import { ListTransportComponent } from './components/transport/list-transports/list-transports.component';
import { PrintComponent } from './components/print/print/print.component';
import { ListCashBoxComponent } from './components/cash-box/list-cash-box/list-cash-box.component';
import { ListPriceListsComponent } from './components/price-list/list-price-lists/list-price-lists.component';
import { LicenseGuard } from './main/guards/license.guard';
import { ListStructureComponent } from './components/structure/list-structure/list-structure.component';
import { ListClassificationsComponent } from './components/classification/list-classifications/list-classifications.component';
import { ListMovementsOfArticlesComponent } from './components/movement-of-article/list-movements-of-articles/list-movements-of-articles.component';
import { PosKitchenComponent } from './components/pos-kitchen/pos-kitchen.component';
import { ListChecksComponent } from './components/movement-of-cash/list-checks/list-checks.component';
import { PosClientViewComponent } from './components/pos-client-view/pos-client-view.component';
import { PosPackingComponent } from './components/pos-packing/pos-packing.component';
import { ListCurrencyValuesComponent } from './components/currency-value/list-currency-values/list-currency-values.component';
import { ListResourcesComponent } from './components/resource/list-resources/list-resources.component';
import { ListGalleriesComponent } from './components/gallery/list-galleries/list-galleries.component';
import { ViewGalleryComponent } from './components/gallery/view-gallery/view-gallery.component';
import { CurrentAccountDetailsComponent } from './components/print/current-account-details/current-account-details.component';
import { ListEmailTemplatesComponent } from './components/email-template/list-email-templates/list-email-templates.component';
import { ListCompaniesComponent } from './components/company/list-companies/list-companies.component';
import { ListTaxesComponent } from './components/tax/list-taxes/list-taxes.component';
import { ListMovementsOfCancellationsComponent } from './components/movement-of-cancellation/list-movements-of-cancellations/list-movements-of-cancellations.component';
import { ListHistoriesComponent } from './components/history/list-history/list-histories.component';
import { ReportTransactionTypeComponent } from './components/report-transaction-type/report-transaction-type.component';
import { AbandonedCartsComponent } from './components/point-of-sale/abandoned-carts/abandoned-carts.component';
import { BillingComponent } from './components/billing/billing.component';
import { KardexCheckComponent } from './components/kardex-check/kardex-check.component';
import { MenuComponent } from './components/menu/menu.component';


export const _routes: Routes = [
  {
    path: '', component: HomeComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'inicio',
    component: HomeComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registrar',
    component: RegisterComponent
  },
  {
    path: 'histories',
    component: ListHistoriesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/venta/statistics',
    component: StatisticsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/cumpleaños',
    component: ReportBirthdayComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'cheque',
    component: KardexCheckComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/venta/productos-mas-vendidos',
    component: ReportBestSellingArticleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/venta/ventas-por-metodo-de-pago',
    component: ReportSalesByPaymentMethodComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/venta/ventas-por-empleado',
    component: ReportSalesByEmployeeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/venta/marcas-mas-vendidas',
    component: ReportSalesByMakeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/venta/ventas-por-cliente',
    component: ReportSalesByClientComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/venta/rubros-mas-vendidos',
    component: ReportSalesByCategoryComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/compra/statistics',
    component: StatisticsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/compra/productos-mas-comprados',
    component: ReportBestSellingArticleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/compras/compras-por-empleado',
    component: ReportSalesByEmployeeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/compra/compras-por-metodo-de-pago',
    component: ReportSalesByPaymentMethodComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/compra/marcas-mas-compradas',
    component: ReportSalesByMakeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/compra/compras-por-proveedor',
    component: ReportSalesByClientComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/compra/rubros-mas-comprados',
    component: ReportSalesByCategoryComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/cajas',
    component: ListCashBoxesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'admin/productos',
    component: ListArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/productos/:id',
    component: ListArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/variantes',
    component: ListArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/variantes/:id',
    component: ListArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/monedas',
    component: ListCurrenciesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/states',
    component: ListStatesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/countries',
    component: ListCountriesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/price-list',
    component: ListPriceListsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/empleados',
    component: ListEmployeesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/tipos-de-empleado',
    component: ListEmployeeTypesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/mesas',
    component: ListTablesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  {
    path: 'admin/ventas',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/compras',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/stock',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' }
  },
  {
    path: 'admin/fondos',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'admin/production',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    //data: { module: 'config.modules.production' }
  },
  {
    path: 'admin/resumenes-de-cuentas',
    component: ListSummaryOfAccountsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/salones',
    component: ListRoomsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  {
    path: 'admin/marcas',
    component: ListMakesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/condiciones-de-iva',
    component: ListVATConditionsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/rubros',
    component: ListCategoriesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/usuarios',
    component: ListUsersComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/usuarios-web',
    component: ListUsersComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.app' }
  },
  {
    path: 'admin/metodos-de-pago',
    component: ListPaymentMethodsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/clientes',
    component: ListCompaniesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/proveedores',
    component: ListCompaniesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/impresoras',
    component: ListPrintersComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/tipos-de-variantes',
    component: ListVariantTypesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/import',
    component: ImportComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/configuraciones',
    component: ConfigComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/billing',
    component: BillingComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/cuentas-corrientes',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'report/kardex-de-productos',
    component: ReportKardexComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' }
  },
  {
    path: 'report/venta/movimientos-de-cancellaciones',
    component: ListMovementsOfCancellationsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'report/compra/movimientos-de-cancellaciones',
    component: ListMovementsOfCancellationsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'report/list-box',
    component: ListCashBoxComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'admin/send-email',
    component: SendEmailComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/export-citi',
    component: ExportCitiComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/export-iva',
    component: ExportIvaComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/stock-de-productos',
    component: ListArticleStocksComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' }
  },
  {
    path: 'admin/impuestos',
    component: ListTaxesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/bancos',
    component: ListBankComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/sucursales',
    component: ListBranchComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/puntos-de-venta',
    component: ListOriginsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/usos-de-cfdi',
    component: ListUsesOfCFDIComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/tipos-de-relacion',
    component: ListRelationTypesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/depositos',
    component: ListDepositsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/ubicaciones',
    component: ListLocationsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/tipos-de-identificacion',
    component: ListIdentificationTypesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/campos-de-productos',
    component: ListArticleFieldsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/tipos-de-cancelaciones',
    component: ListCancellationTypeComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'report/cartera-de-cheques',
    component: ListChecksComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'admin/campos-de-empresas',
    component: ListCompanyFieldsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/venta/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/compra/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/fondos/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'admin/venta/movimientos-de-productos',
    component: ListMovementsOfArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/compra/movimientos-de-productos',
    component: ListMovementsOfArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/stock/movimientos-de-productos',
    component: ListMovementsOfArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' }
  },
  {
    path: 'admin/classifications',
    component: ListClassificationsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/update-article-price',
    component: UpdateArticlePriceComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/structures',
    component: ListStructureComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/template-emails',
    component: ListEmailTemplatesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/currency-values',
    component: ListCurrencyValuesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/transports',
    component: ListTransportComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/resources',
    component: ListResourcesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/galleries',
    component: ListGalleriesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'print/invoice/:transaction',
    component: PrintComponent
  },
  {
    path: 'pos/resto/salones/:id/mesas',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  {
    path: 'pos/resto/salones/:id/mesas/:id/editar-transaccion',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  {
    path: 'report/compra/compras-por-tipo-de-transacción',
    component: ReportTransactionTypeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'report/venta/ventas-por-tipo-de-transacción',
    component: ReportTransactionTypeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'report/fondo/fondos-por-tipo-de-transacción',
    component: ReportTransactionTypeComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'report/current-account',
    component: CurrentAccountDetailsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'pos',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'pos/pedidos-web',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.app' }
  },
  {
    path: 'pos/carritos-abandonados',
    component: AbandonedCartsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.app' }
  },
  {
    path: 'pos/mostrador/venta',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.counter' }
  },
  {
    path: 'pos/mostrador/compra',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'pos/mostrador/fondo',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'pos/mostrador/stock',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' }
  },
  {
    path: 'pos/mostrador/production',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.production' }
  },
  {
    path: 'pos/mostrador/editar-transaccion',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'pos/delivery',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.delivery' }
  },
  {
    path: 'pos/retiro-de-pedidos',
    component: PosClientViewComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'pos/armado-de-pedidos',
    component: PosPackingComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'pos/delivery/editar-transaccion',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.delivery' }
  },
  {
    path: 'pos/resto',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  {
    path: 'pos/resto/editar-transaccion',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  {
    path: 'pos/lector-de-vouchers',
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'pos/cocina',
    component: PosKitchenComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.production.kitchen' }
  },
  {
    path: 'pos/ver-galeria/:name',
    component: ViewGalleryComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'menu/:database',
    component: MenuComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: ''
  }
];
