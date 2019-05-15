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
import { ConfigBackupComponent } from './components/config-backup/config-backup.component';
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

export const _routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'inicio', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegisterComponent }
  ,
  {
    path: 'admin/venta/statistics',
    component: StatisticsComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/cumpleaños',
    component: ReportBirthdayComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/venta/productos-mas-vendidos',
    component: ReportBestSellingArticleComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/venta/ventas-por-metodo-de-pago',
    component: ReportSalesByPaymentMethodComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/venta/ventas-por-empleado',
    component : ReportSalesByEmployeeComponent,
    data: { roles : ['Administrador']}
  },
  {
    path: 'admin/venta/marcas-mas-vendidas',
    component: ReportSalesByMakeComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/venta/ventas-por-cliente',
    component: ReportSalesByClientComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/venta/rubros-mas-vendidos',
    component: ReportSalesByCategoryComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/compra/statistics',
    component: StatisticsComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/compra/productos-mas-comprados',
    component: ReportBestSellingArticleComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/compras/compras-por-empleado',
    component : ReportSalesByEmployeeComponent,
    data: { roles : ['Administrador']}
  },
  {
    path: 'admin/compra/compras-por-metodo-de-pago',
    component: ReportSalesByPaymentMethodComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/compra/marcas-mas-compradas',
    component: ReportSalesByMakeComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/compra/compras-por-proveedor',
    component: ReportSalesByClientComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/compra/rubros-mas-comprados',
    component: ReportSalesByCategoryComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/cajas',
    component: ListCashBoxesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/productos',
    component: ListArticlesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/variantes',
    component: ListArticlesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/monedas',
    component: ListCurrenciesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/states',
    component: ListStatesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/countries',
    component: ListCountriesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/empleados',
    component: ListEmployeesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/tipos-de-empleado',
    component: ListEmployeeTypesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/mesas',
    component: ListTablesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/ventas',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/compras',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/stock',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/fondos',
    component: ListTransactionsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/resumenes-de-cuentas/cliente',
    component: ListSummaryOfAccountsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/resumenes-de-cuentas/proveedor',
    component: ListSummaryOfAccountsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-transaccion',
    component: DeleteTransactionComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/salones',
    component: ListRoomsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/marcas',
    component: ListMakesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/condiciones-de-iva',
    component: ListVATConditionsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/rubros',
    component: ListCategoriesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/usuarios',
    component: ListUsersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/metodos-de-pago',
    component: ListPaymentMethodsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/clientes',
    component: ListCompaniesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/grupo-empresas',
    component: ListCompaniesGroupComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/proveedores',
    component: ListCompaniesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/turnos',
    component: ListTurnsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/impresoras',
    component: ListPrintersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/tipos-de-transacciones',
    component: ListTransactionTypesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/tipos-de-variantes',
    component: ListVariantTypesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/valores-de-variantes',
    component: ListVariantValuesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/import',
    component: ImportComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/configuraciones',
    component: ConfigBackupComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/cuentas-corrientes/cliente',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path : 'report/kardex-de-productos',
    component : ListMovementOfArticlesComponent,
    canActivate: [AuthGuard],
    data: { roles : ['Administrador']}
  },
  {
    path: 'admin/cuentas-corrientes/cliente/:id',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/cuentas-corrientes/proveedor',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/cuentas-corrientes/proveedor/:id',
    component: CurrentAccountComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/send-mail',
    component: SendMailComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/export-citi',
    component: ExportCitiComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/export-iva',
    component: ExportIvaComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/stock-de-productos',
    component: ListArticleStocksComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/impuestos',
    component: ListTaxesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/banks',
    component: ListBankComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/usos-de-cfdi',
    component: ListUsesOfCFDIComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/tipos-de-relacion',
    component: ListRelationTypesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/depositos',
    component: ListDepositsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/ubicaciones',
    component: ListLocationsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/tipos-de-identificacion',
    component: ListIdentificationTypesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/campos-de-productos',
    component: ListArticleFieldsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/tipos-de-cancelaciones',
    component: ListCancellationTypeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/campos-de-empresas',
    component: ListCompanyFieldsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/unidades-de-medida',
    component: ListUnitsOfMeasurementComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/venta/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/compra/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/fondos/movimientos-de-medios',
    component: ListMovementOfCashesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/update-article-price',
    component: UpdateArticlePriceComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path : 'admin/licence-payment',
    component : LicensePaymentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  { path: 'pos', component: PointOfSaleComponent },
  { path: 'pos/resto', component: PointOfSaleComponent },
  { path: 'pos/resto/salones/:id/mesas', component: PointOfSaleComponent },
  {
    path: 'pos/resto/salones/:id/mesas/:id/agregar-transaccion/:type',
    component: AddSaleOrderComponent
  },
  {
    path: 'pos/resto/salones/:id/mesas/:id/editar-transaccion/:id',
    component: AddSaleOrderComponent
  },
  { path: 'pos/articles', component: ListArticlesComponent },
  { path: 'pos/delivery', component: PointOfSaleComponent },
  {
    path: 'pos/delivery/agregar-transaccion/:type',
    component: AddSaleOrderComponent
  },
  {
    path: 'pos/delivery/editar-transaccion/:id',
    component: AddSaleOrderComponent
  },
  { path: 'pos/mostrador/compra', component: PointOfSaleComponent },
  { path: 'pos/mostrador/venta', component: PointOfSaleComponent },
  { path: 'pos/mostrador/fondo', component: PointOfSaleComponent },
  { path: 'pos/mostrador/stock', component: PointOfSaleComponent },
  {
    path: 'pos/mostrador/agregar-transaccion/:type',
    component: AddSaleOrderComponent
  },
  {
    path: 'pos/mostrador/editar-transaccion/:id',
    component: AddSaleOrderComponent
  },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];
