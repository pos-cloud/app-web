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
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'inicio', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: HeaderComponent },
  { path: 'admin/productos', component: ListArticlesComponent },
  { path: 'admin/agregar-producto', component: AddArticleComponent },
  { path: 'admin/editar-producto', component: UpdateArticleComponent },
  { path: 'admin/eliminar-producto', component: DeleteArticleComponent },
  { path: 'admin/empleados', component: ListEmployeesComponent },
  { path: 'admin/agregar-empleado', component: AddEmployeeComponent },
  { path: 'admin/editar-empleado', component: UpdateEmployeeComponent },
  { path: 'admin/eliminar-empleado', component: DeleteEmployeeComponent },
  { path: 'admin/tipos-de-empleado', component: ListEmployeeTypesComponent },
  { path: 'admin/agregar-tipo-de-empleado', component: AddEmployeeTypeComponent },
  { path: 'admin/editar-tipo-de-empleado', component: UpdateEmployeeTypeComponent },
  { path: 'admin/eliminar-tipo-de-empleado', component: DeleteEmployeeTypeComponent },
  { path: 'admin/mesas', component: ListTablesComponent },
  { path: 'admin/agregar-mesa', component: AddTableComponent },
  { path: 'admin/editar-mesa', component: UpdateTableComponent },
  { path: 'admin/eliminar-mesa', component: DeleteTableComponent },
  { path: 'admin/pedidos', component: ListSaleOrdersComponent },
  { path: 'admin/agregar-pedido', component: AddSaleOrderComponent },
  { path: 'admin/eliminar-pedido', component: DeleteSaleOrderComponent },
  { path: 'admin/salones', component: ListRoomsComponent },
  { path: 'admin/agregar-salon', component: AddRoomComponent },
  { path: 'admin/editar-salon', component: UpdateRoomComponent },
  { path: 'admin/eliminar-salon', component: DeleteRoomComponent },
  { path: 'admin/marcas', component: ListMakesComponent },
  { path: 'admin/agregar-marca', component: AddMakeComponent },
  { path: 'admin/editar-marca', component: UpdateMakeComponent },
  { path: 'admin/eliminar-marca', component: DeleteMakeComponent },
  { path: 'admin/rubros', component: ListCategoriesComponent },
  { path: 'admin/agregar-rubro', component: AddCategoryComponent },
  { path: 'admin/editar-rubro', component: UpdateCategoryComponent },
  { path: 'admin/eliminar-rubro', component: DeleteCategoryComponent },
  { path: 'admin/usuarios', component: ListUsersComponent },
  { path: 'admin/agregar-usuario', component: AddUserComponent },
  { path: 'admin/editar-usuario', component: UpdateUserComponent },
  { path: 'admin/eliminar-usuario', component: DeleteUserComponent },
  { path: 'admin/empresas', component: ListCompaniesComponent },
  { path: 'admin/agregar-empresa', component: AddCompanyComponent },
  { path: 'admin/editar-empresa', component: UpdateCompanyComponent },
  { path: 'admin/eliminar-empresa', component: DeleteCompanyComponent },
  { path: 'admin/impresoras', component: ListPrintersComponent },
  { path: 'admin/agregar-impresora', component: AddPrinterComponent },
  { path: 'admin/editar-impresora', component: UpdatePrinterComponent },
  { path: 'admin/eliminar-impresora', component: DeletePrinterComponent },
  { path: 'admin/import', component: ImportComponent },
  { path: 'admin/config', component: ConfigComponent },
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