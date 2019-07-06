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
import { SendMailComponent } from './components/send-mail/send-mail.component';
import { RegisterComponent } from './components/register/register.component';
import { ExportCitiComponent } from './components/export-citi/export-citi.component';
import { ExportIvaComponent } from './components/export-iva/export-iva.component';
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
import { ListMovementOfArticlesComponent } from './components/list-movement-of-articles/list-movement-of-articles.component';
import { ListStatesComponent } from './components/list-states/list-states.component';
import { ListCountriesComponent } from './components/list-countries/list-countries.component';
import { ListBankComponent } from './components/list-bank/list-bank.component'
import { ListBranchComponent } from './components/list-branches/list-branches.component';
import { ListOriginsComponent } from './components/list-origins/list-origins.component';
import { ListTransportComponent } from './components/list-transports/list-transports.component';

export const _routes: Routes = [
  { 
    path: '', component: HomeComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'inicio',
    component: HomeComponent,
    canActivate: [AuthGuard]
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
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/cumpleaños',
    component: ReportBirthdayComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/venta/productos-mas-vendidos',
    component: ReportBestSellingArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/venta/ventas-por-metodo-de-pago',
    component: ReportSalesByPaymentMethodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/venta/ventas-por-empleado',
    component : ReportSalesByEmployeeComponent
  },
  {
    path: 'admin/venta/marcas-mas-vendidas',
    component: ReportSalesByMakeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/venta/ventas-por-cliente',
    component: ReportSalesByClientComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/venta/rubros-mas-vendidos',
    component: ReportSalesByCategoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/compra/statistics',
    component: StatisticsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/compra/productos-mas-comprados',
    component: ReportBestSellingArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/compras/compras-por-empleado',
    component : ReportSalesByEmployeeComponent
  },
  {
    path: 'admin/compra/compras-por-metodo-de-pago',
    component: ReportSalesByPaymentMethodComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/compra/marcas-mas-compradas',
    component: ReportSalesByMakeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/compra/compras-por-proveedor',
    component: ReportSalesByClientComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/compra/rubros-mas-comprados',
    component: ReportSalesByCategoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/cajas',
    component: ListCashBoxesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/productos',
    component: ListArticlesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/variantes',
    component: ListArticlesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/monedas',
    component: ListCurrenciesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/states',
    component: ListStatesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/countries',
    component: ListCountriesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/empleados',
    component: ListEmployeesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/tipos-de-empleado',
    component: ListEmployeeTypesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/mesas',
    component: ListTablesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/ventas',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/compras',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/stock',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/fondos',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/resumenes-de-cuentas/cliente',
    component: ListSummaryOfAccountsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/resumenes-de-cuentas/proveedor',
    component: ListSummaryOfAccountsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/eliminar-transaccion',
    component: DeleteTransactionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/salones',
    component: ListRoomsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/marcas',
    component: ListMakesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/condiciones-de-iva',
    component: ListVATConditionsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/rubros',
    component: ListCategoriesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/usuarios',
    component: ListUsersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/metodos-de-pago',
    component: ListPaymentMethodsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/clientes',
    component: ListCompaniesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/grupo-empresas',
    component: ListCompaniesGroupComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/proveedores',
    component: ListCompaniesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/turnos',
    component: ListTurnsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/impresoras',
    component: ListPrintersComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/tipos-de-transacciones',
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/tipos-de-variantes',
    component: ListVariantTypesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/valores-de-variantes',
    component: ListVariantValuesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/import',
    component: ImportComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/configuraciones',
    component: ConfigComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/cuentas-corrientes/cliente',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path : 'report/kardex-de-productos',
    component : ListMovementOfArticlesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/cuentas-corrientes/cliente/:id',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/cuentas-corrientes/proveedor',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/cuentas-corrientes/proveedor/:id',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/send-mail',
    component: SendMailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/export-citi',
    component: ExportCitiComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/export-iva',
    component: ExportIvaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/stock-de-productos',
    component: ListArticleStocksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/impuestos',
    component: ListTaxesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/bancos',
    component: ListBankComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/sucursales',
    component: ListBranchComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/puntos-de-venta',
    component: ListOriginsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/usos-de-cfdi',
    component: ListUsesOfCFDIComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/tipos-de-relacion',
    component: ListRelationTypesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/depositos',
    component: ListDepositsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/ubicaciones',
    component: ListLocationsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/tipos-de-identificacion',
    component: ListIdentificationTypesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/campos-de-productos',
    component: ListArticleFieldsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/tipos-de-cancelaciones',
    component: ListCancellationTypeComponent,
    canActivate: [AuthGuard]
  },
  {
    path : 'checks/fondos/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/campos-de-empresas',
    component: ListCompanyFieldsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/unidades-de-medida',
    component: ListUnitsOfMeasurementComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/venta/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/compra/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/fondos/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/update-article-price',
    component: UpdateArticlePriceComponent,
    canActivate: [AuthGuard]
  },
  {
    path : 'admin/licence-payment',
    component : LicensePaymentComponent,
    canActivate: [AuthGuard]
  },
  {
    path : 'admin/transports',
    component : ListTransportComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'pos', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'pos/resto', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'pos/resto/salones/:id/mesas', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pos/resto/salones/:id/mesas/:id/agregar-transaccion/:type',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pos/resto/salones/:id/mesas/:id/editar-transaccion/:id',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'pos/articles', 
    component: ListArticlesComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'pos/delivery', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'report/compra/compras-por-tipo-de-transacción', 
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'report/venta/ventas-por-tipo-de-transacción', 
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pos/delivery/agregar-transaccion/:type',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pos/delivery/editar-transaccion/:id',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'pos/mostrador/compra', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard]
   },
  { 
    path: 'pos/mostrador/venta', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard]
   },
  { 
    path: 'pos/mostrador/fondo', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard]
   },
  { 
    path: 'pos/mostrador/stock', 
    component: PointOfSaleComponent,
    canActivate: [AuthGuard]
   },
  {
    path: 'pos/mostrador/agregar-transaccion/:type',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'pos/mostrador/editar-transaccion/:id',
    component: AddSaleOrderComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];
