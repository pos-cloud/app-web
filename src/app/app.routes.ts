import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { DeleteArticleComponent } from './components/delete-article/delete-article.component';
import { ListEmployeesComponent } from './components/list-employees/list-employees.component';
import { AddEmployeeComponent } from './components/add-employee/add-employee.component';
import { UpdateEmployeeComponent } from './components/update-employee/update-employee.component';
import { DeleteEmployeeComponent } from './components/delete-employee/delete-employee.component';
import { ListEmployeeTypesComponent } from './components/list-employee-types/list-employee-types.component';
import { AddEmployeeTypeComponent } from './components/add-employee-type/add-employee-type.component';
import { UpdateEmployeeTypeComponent } from './components/update-employee-type/update-employee-type.component';
import { DeleteEmployeeTypeComponent } from './components/delete-employee-type/delete-employee-type.component';
import { ListTablesComponent } from './components/list-tables/list-tables.component';
import { AddTableComponent } from './components/add-table/add-table.component';
import { UpdateTableComponent } from './components/update-table/update-table.component';
import { DeleteTableComponent } from './components/delete-table/delete-table.component';
import { ListTransactionsComponent } from './components/list-transactions/list-transactions.component';
import { DeleteTransactionComponent } from './components/delete-transaction/delete-transaction.component';
import { AddTransactionComponent } from './components/add-transaction/add-transaction.component';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { ListRoomsComponent } from './components/list-rooms/list-rooms.component';
import { AddRoomComponent } from './components/add-room/add-room.component';
import { UpdateRoomComponent } from './components/update-room/update-room.component';
import { DeleteRoomComponent } from './components/delete-room/delete-room.component';
import { ListMakesComponent } from './components/list-makes/list-makes.component';
import { AddMakeComponent } from './components/add-make/add-make.component';
import { UpdateMakeComponent } from './components/update-make/update-make.component';
import { DeleteMakeComponent } from './components/delete-make/delete-make.component';
import { ListCategoriesComponent } from './components/list-categories/list-categories.component';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { UpdateCategoryComponent } from './components/update-category/update-category.component';
import { DeleteCategoryComponent } from './components/delete-category/delete-category.component';
import { AddUserComponent } from './components/add-user/add-user.component';
import { UpdateUserComponent } from './components/update-user/update-user.component';
import { ListUsersComponent } from './components/list-users/list-users.component';
import { DeleteUserComponent } from './components/delete-user/delete-user.component';
import { ListCompaniesComponent } from './components/list-companies/list-companies.component';
import { AddCompanyComponent } from './components/add-company/add-company.component';
import { UpdateCompanyComponent } from './components/update-company/update-company.component';
import { DeleteCompanyComponent } from './components/delete-company/delete-company.component';
import { AddPrinterComponent } from './components/add-printer/add-printer.component';
import { DeletePrinterComponent } from './components/delete-printer/delete-printer.component';
import { UpdatePrinterComponent } from './components/update-printer/update-printer.component';
import { ListPrintersComponent } from './components/list-printers/list-printers.component';
import { ListTurnsComponent } from './components/list-turns/list-turns.component';
import { AddTransactionTypeComponent } from './components/add-transaction-type/add-transaction-type.component';
import { UpdateTransactionTypeComponent } from './components/update-transaction-type/update-transaction-type.component';
import { ListTransactionTypesComponent } from './components/list-transaction-types/list-transaction-types.component';
import { DeleteTransactionTypeComponent } from './components/delete-transaction-type/delete-transaction-type.component';
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
import { AddPaymentMethodComponent } from './components/add-payment-method/add-payment-method.component';
import { UpdatePaymentMethodComponent } from './components/update-payment-method/update-payment-method.component';
import { ListPaymentMethodsComponent } from './components/list-payment-methods/list-payment-methods.component';
import { DeletePaymentMethodComponent } from './components/delete-payment-method/delete-payment-method.component';
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

const _routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'inicio', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegisterComponent },
  {
    path: 'admin/statistics',
    component: StatisticsComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/productos-mas-vendidos',
    component: ReportBestSellingArticleComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/ventas-por-metodo-de-pago',
    component: ReportSalesByPaymentMethodComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/marcas-mas-vendidas',
    component: ReportSalesByMakeComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/ventas-por-cliente',
    component: ReportSalesByClientComponent,
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/rubros-mas-vendidos',
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
    path: 'admin/agregar-producto',
    component: AddArticleComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-producto',
    component: DeleteArticleComponent,
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
    path: 'admin/agregar-empleado',
    component: AddEmployeeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-empleado',
    component: UpdateEmployeeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-empleado',
    component: DeleteEmployeeComponent,
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
    path: 'admin/agregar-tipo-de-empleado',
    component: AddEmployeeTypeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-tipo-de-empleado',
    component: UpdateEmployeeTypeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-tipo-de-empleado',
    component: DeleteEmployeeTypeComponent,
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
    path: 'admin/agregar-mesa',
    component: AddTableComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-mesa',
    component: UpdateTableComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-mesa',
    component: DeleteTableComponent,
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
    path: 'admin/agregar-transaccion',
    component: AddTransactionComponent,
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
    path: 'admin/agregar-salon',
    component: AddRoomComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-salon',
    component: UpdateRoomComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-salon',
    component: DeleteRoomComponent,
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
    path: 'admin/agregar-marca',
    component: AddMakeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-marca',
    component: UpdateMakeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-marca',
    component: DeleteMakeComponent,
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
    path: 'admin/agregar-rubro',
    component: AddCategoryComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-rubro',
    component: UpdateCategoryComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-rubro',
    component: DeleteCategoryComponent,
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
    path: 'admin/agregar-usuario',
    component: AddUserComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-usuario',
    component: UpdateUserComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-usuario',
    component: DeleteUserComponent,
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
    path: 'admin/agregar-metodo-de-pago',
    component: AddPaymentMethodComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-metodo-de-pago',
    component: UpdatePaymentMethodComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-metodo-de-pago',
    component: DeletePaymentMethodComponent,
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
    path: 'admin/agregar-empresa',
    component: AddCompanyComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-empresa',
    component: UpdateCompanyComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-empresa',
    component: DeleteCompanyComponent,
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
    path: 'admin/agregar-impresora',
    component: AddPrinterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-impresora',
    component: UpdatePrinterComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-impresora',
    component: DeletePrinterComponent,
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
    path: 'admin/agregar-tipo-transaccion',
    component: AddTransactionTypeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/editar-tipo-transaccion',
    component: UpdateTransactionTypeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/eliminar-tipo-transaccion',
    component: DeleteTransactionTypeComponent,
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
    path: 'admin/campos-de-productos',
    component: ListArticleFieldsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'admin/movimientos-de-medios',
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
  { path: 'pos', component: PointOfSaleComponent },
  { path: 'pos/resto', component: PointOfSaleComponent },
  { path: 'pos/resto/salones/:id/mesas', component: PointOfSaleComponent },
  {
    path: 'pos/resto/salones/:id/mesas/:id/agregar-transaccion/:type',
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

@NgModule({
  imports: [RouterModule.forRoot(_routes)],
  exports: [RouterModule]
})

export class RoutingModule { }
