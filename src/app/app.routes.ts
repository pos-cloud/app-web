import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { UpdateArticleComponent } from './components/update-article/update-article.component';
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
import { ListSaleOrdersComponent } from './components/list-sale-orders/list-sale-orders.component';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { DeleteSaleOrderComponent } from './components/delete-sale-order/delete-sale-order.component';
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
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ImportComponent } from './components/import/import.component';
import { ConfigComponent } from './components/config/config.component';

import { AuthGuard } from './guards/auth.guard';

const _routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'inicio', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: HeaderComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/productos', component: ListArticlesComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-producto', component: AddArticleComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-producto', component: UpdateArticleComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-producto', component: DeleteArticleComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/empleados', component: ListEmployeesComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-empleado', component: AddEmployeeComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-empleado', component: UpdateEmployeeComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-empleado', component: DeleteEmployeeComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/tipos-de-empleado', component: ListEmployeeTypesComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-tipo-de-empleado', component: AddEmployeeTypeComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-tipo-de-empleado', component: UpdateEmployeeTypeComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-tipo-de-empleado', component: DeleteEmployeeTypeComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/mesas', component: ListTablesComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-mesa', component: AddTableComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-mesa', component: UpdateTableComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-mesa', component: DeleteTableComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/pedidos', component: ListSaleOrdersComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-pedido', component: AddSaleOrderComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-pedido', component: DeleteSaleOrderComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/salones', component: ListRoomsComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-salon', component: AddRoomComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-salon', component: UpdateRoomComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-salon', component: DeleteRoomComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/marcas', component: ListMakesComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-marca', component: AddMakeComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-marca', component: UpdateMakeComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-marca', component: DeleteMakeComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/rubros', component: ListCategoriesComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-rubro', component: AddCategoryComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-rubro', component: UpdateCategoryComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-rubro', component: DeleteCategoryComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/usuarios', component: ListUsersComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-usuario', component: AddUserComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-usuario', component: UpdateUserComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-usuario', component: DeleteUserComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/empresas', component: ListCompaniesComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-empresa', component: AddCompanyComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-empresa', component: UpdateCompanyComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-empresa', component: DeleteCompanyComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/impresoras', component: ListPrintersComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/agregar-impresora', component: AddPrinterComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/editar-impresora', component: UpdatePrinterComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/eliminar-impresora', component: DeletePrinterComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/import', component: ImportComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'admin/config', component: ConfigComponent, canActivate: [AuthGuard], data: { roles: ['Supervisor'] } },
  { path: 'pos', component: PointOfSaleComponent },
  { path: 'pos/salones/:id/mesas', component: PointOfSaleComponent },
  { path: 'pos/salones/:id/mesas/:id/agregar-pedido', component: AddSaleOrderComponent },
  { path: 'pos/articles', component: ListArticlesComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**',pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(_routes)],
  exports: [RouterModule]
})

export class RoutingModule { }