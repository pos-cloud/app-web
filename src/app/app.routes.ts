import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { UpdateArticleComponent } from './components/update-article/update-article.component';
import { DeleteArticleComponent } from './components/delete-article/delete-article.component';
import { ListWaitersComponent } from './components/list-waiters/list-waiters.component';
import { AddWaiterComponent } from './components/add-waiter/add-waiter.component';
import { UpdateWaiterComponent } from './components/update-waiter/update-waiter.component';
import { DeleteWaiterComponent } from './components/delete-waiter/delete-waiter.component';
import { ListTablesComponent } from './components/list-tables/list-tables.component';
import { AddTableComponent } from './components/add-table/add-table.component';
import { UpdateTableComponent } from './components/update-table/update-table.component';
import { DeleteTableComponent } from './components/delete-table/delete-table.component';
import { ListSaleOrdersComponent } from './components/list-sale-orders/list-sale-orders.component';
import { AddSaleOrderComponent } from './components/add-sale-order/add-sale-order.component';
import { UpdateSaleOrderComponent } from './components/update-sale-order/update-sale-order.component';
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
import { PointOfSaleComponent } from './components/point-of-sale/point-of-sale.component';

const _routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'inicio', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin/productos', component: ListArticlesComponent },
  { path: 'admin/agregar-producto', component: AddArticleComponent },
  { path: 'admin/editar-producto', component: UpdateArticleComponent },
  { path: 'admin/eliminar-producto', component: DeleteArticleComponent },
  { path: 'admin/mozos', component: ListWaitersComponent },
  { path: 'admin/agregar-mozo', component: AddWaiterComponent },
  { path: 'admin/editar-mozo', component: UpdateWaiterComponent },
  { path: 'admin/eliminar-mozo', component: DeleteWaiterComponent },
  { path: 'admin/mesas', component: ListTablesComponent },
  { path: 'admin/agregar-mesa', component: AddTableComponent },
  { path: 'admin/editar-mesa', component: UpdateTableComponent },
  { path: 'admin/eliminar-mesa', component: DeleteTableComponent },
  { path: 'admin/pedidos', component: ListSaleOrdersComponent },
  { path: 'admin/agregar-pedido', component: AddSaleOrderComponent },
  { path: 'admin/editar-pedido', component: UpdateSaleOrderComponent },
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
  { path: 'pos', component: PointOfSaleComponent },
  { path: 'pos/salones/:id/mesas', component: PointOfSaleComponent },
  { path: 'pos/salones/:id/mesas/:id/agregar-pedido', component: AddSaleOrderComponent },
  { path: 'pos/salones/:id/mesas/:id/editar-pedido/:id', component: UpdateSaleOrderComponent },
  // { path: 'pos/salones/:id/mesas/:id/editar-pedido/:id', component: ListCategoriesComponent },
  { path: 'pos/articles', component: ListArticlesComponent },
  { path: '**',pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(_routes)],
  exports: [RouterModule]
})

export class RoutingModule { }