import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { ListEmployeesComponent } from './components/list-employees/list-employees.component';
import { ListEmployeeTypesComponent } from './components/list-employee-types/list-employee-types.component';
import { ListTablesComponent } from './components/list-tables/list-tables.component';
import { ListTransactionsComponent } from './components/list-transactions/list-transactions.component';
import { DeleteTransactionComponent } from './components/delete-transaction/delete-transaction.component';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { ListRoomsComponent } from './components/list-rooms/list-rooms.component';
import { ListCategoriesComponent } from './components/list-categories/list-categories.component';
import { ListUsersComponent } from './components/list-users/list-users.component';
import { ListCompaniesComponent } from './components/list-companies/list-companies.component';
import { ListPrintersComponent } from './components/list-printers/list-printers.component';
import { ListTurnsComponent } from './components/list-turns/list-turns.component';
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';
import { ImportComponent } from './components/import/import.component';
import { ConfigComponent } from './components/config/config.component';
import { CurrentAccountComponent } from './components/current-account/current-account.component';
import { SendEmailComponent } from './components/send-email/send-email.component';
import { RegisterComponent } from './components/register/register.component';
import { ExportCitiComponent } from './components/export/export-citi/export-citi.component';
import { ExportIvaComponent } from './components/export/export-iva/export-iva.component';
import { ListVariantTypesComponent } from './components/list-variant-types/list-variant-types.component';
import { ListVariantValuesComponent } from './components/list-variant-values/list-variant-values.component';
import { ListCashBoxesComponent } from './components/list-cash-boxes/list-cash-boxes.component';
import { AuthGuard } from './guards/auth.guard';
import { ListArticleStocksComponent } from './components/list-article-stocks/list-article-stocks.component';
import { ListTaxesComponent } from './components/list-taxes/list-taxes.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ListDepositsComponent } from './components/list-deposits/list-deposits.component';
import { ListLocationsComponent } from './components/list-locations/list-locations.component';
import { ListMovementOfCashesComponent } from './components/list-movements-of-cashes/list-movements-of-cashes.component';
import { ReportBestSellingArticleComponent } from './components/report-best-selling-article/report-best-selling-article.component';
import { ListArticleFieldsComponent } from './components/list-article-fields/list-article-fields.component';
import { ListSummaryOfAccountsComponent } from "./components/list-summary-of-accounts/list-summary-of-accounts.component";
import { ReportSalesByPaymentMethodComponent } from './components/report-sales-by-payment-method/report-sales-by-payment-method.component';
import { ReportSalesByMakeComponent } from './components/report-sales-by-make/report-sales-by-make.component';
import { ReportSalesByClientComponent } from './components/report-sales-by-client/report-sales-by-client.component';
import { ReportSalesByCategoryComponent } from './components/report-sales-by-category/report-sales-by-category.component';
import { ListCompaniesGroupComponent } from "./components/list-companies-group/list-companies-group.component";
import { UpdateArticlePriceComponent } from "./components/update-article-price/update-article-price.component"
import { ListVATConditionsComponent } from './components/list-vat-conditions/list-vat-conditions.component';
import { ReportBirthdayComponent } from './components/report-birthday/report-birthday.component';
import { ReportSalesByEmployeeComponent } from './components/report-sales-by-employee/report-sales-by-employee.component'
import { ListUnitsOfMeasurementComponent } from './components/list-units-of-measurement/list-units-of-measurement.component';
import { ListIdentificationTypesComponent } from './components/list-identification-types/list-identification-types.component';
import { ListMakesComponent } from './components/list-makes/list-makes.component';
import { ListPaymentMethodsComponent } from './components/list-payment-methods/list-payment-methods.component';
import { ListTransactionTypesComponent } from './components/list-transaction-types/list-transaction-types.component';
import { ListUsesOfCFDIComponent } from './components/list-uses-of-CFDI/list-uses-of-CFDI.component';
import { ListRelationTypesComponent } from './components/list-relation-types/list-relation-types.component';
import { ListCompanyFieldsComponent } from './components/list-company-fields/list-company-fields.component';
import { LicensePaymentComponent } from './components/license-payment/license-payment.component'
import { ListCancellationTypeComponent } from './components/list-cancellation-types/list-cancellation-types.component';
import { Routes } from '@angular/router';
import { ListCurrenciesComponent } from './components/list-currencies/list-currencies.component';
import { ReportKardexComponent } from './components/report-kardex/report-kardex.component';
import { ListStatesComponent } from './components/list-states/list-states.component';
import { ListCountriesComponent } from './components/list-countries/list-countries.component';
import { ListBankComponent } from './components/list-bank/list-bank.component'
import { ListBranchComponent } from './components/list-branches/list-branches.component';
import { ListOriginsComponent } from './components/list-origins/list-origins.component';
import { ListTransportComponent } from './components/list-transports/list-transports.component';
import { PrintComponent } from './components/print/print/print.component';
import { ListCashBoxComponent } from './components/list-cash-box/list-cash-box.component';
import { ListPriceListsComponent } from './components/list-price-lists/list-price-lists.component';
import { ListArticlesPosComponent } from './components/list-articles-pos/list-articles-pos.component';
import { ReportsList } from './components/reports-list/reports-list.component';
import { LicenseGuard } from './guards/license.guard';
import { Config } from './app.config';
import { ListStructureComponent } from './components/list-structure/list-structure.component';
import { ListClassificationsComponent } from './components/list-classifications/list-classifications.component';

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
    component : ReportSalesByEmployeeComponent,
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
    component : ReportSalesByEmployeeComponent,
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
    path: 'admin/report-list',
    component: ReportsList,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/variantes',
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
    path: 'admin/resumenes-de-cuentas/cliente',
    component: ListSummaryOfAccountsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/resumenes-de-cuentas/proveedor',
    component: ListSummaryOfAccountsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
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
    path: 'admin/grupo-empresas',
    component: ListCompaniesGroupComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/proveedores',
    component: ListCompaniesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/turnos',
    component: ListTurnsComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  {
    path: 'admin/impresoras',
    component: ListPrintersComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/tipos-de-transacciones',
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/tipos-de-variantes',
    component: ListVariantTypesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/valores-de-variantes',
    component: ListVariantValuesComponent,
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
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/cuentas-corrientes/cliente',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path : 'report/kardex-de-productos/:id',
    component : ReportKardexComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' }
  },
  {
    path : 'report/list-box',
    component : ListCashBoxComponent,
    canActivate : [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'admin/cuentas-corrientes/cliente/:id',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  {
    path: 'admin/cuentas-corrientes/proveedor',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  {
    path: 'admin/cuentas-corrientes/proveedor/:id',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
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
    path : 'report/cartera-de-cheques',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'admin/campos-de-empresas',
    component: ListCompanyFieldsComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/unidades-de-medida',
    component: ListUnitsOfMeasurementComponent,
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
    path : 'admin/licence-payment',
    component : LicensePaymentComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path : 'admin/structures',
    component : ListStructureComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path : 'admin/transports',
    component : ListTransportComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path : 'print/invoice/:transaction',
    component : PrintComponent
  },
  { 
    path: 'pos', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  { 
    path: 'pos/resto', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  { 
    path: 'pos/resto/salones/:id/mesas', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  {
    path: 'pos/resto/salones/:id/mesas/:id/agregar-transaccion/:type',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  {
    path: 'pos/resto/salones/:id/mesas/:id/editar-transaccion/:id',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.resto' }
  },
  { 
    path: 'pos/articles', 
    component: ListArticlesPosComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  { 
    path: 'pos/delivery', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.delivery' }
  },
  { 
    path: 'report/compra/compras-por-tipo-de-transacción', 
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  { 
    path: 'report/venta/ventas-por-tipo-de-transacción', 
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale' }
  },
  { 
    path: 'report/fondo/fondos-por-tipo-de-transacción', 
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  {
    path: 'pos/delivery/agregar-transaccion/:type',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.delivery' }
  },
  {
    path: 'pos/delivery/editar-transaccion/:id',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.delivery' }
  },
  { 
    path: 'pos/pedidos-web', 
    component: PointOfSaleComponent,
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
    path: 'pos/mostrador/venta/:type', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.counter' }
  },
  { 
    path: 'pos/mostrador/compra/:type', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.purchase' }
  },
  { 
    path: 'pos/mostrador/fondo/:type', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.money' }
  },
  { 
    path: 'pos/mostrador/stock/:type', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.stock' }
  },
  {
    path: 'pos/mostrador/agregar-transaccion/:type',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.counter' }
  },
  {
    path: 'pos/mostrador/editar-transaccion/:id',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard, LicenseGuard],
    data: { module: 'config.modules.sale.counter' }
  },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];
