import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
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
import { ListCashBoxesComponent } from './components/list-cash-boxes/list-cash-boxes.component';
import { AddCashBoxComponent } from './components/add-cash-box/add-cash-box.component';
import { UpdateCashBoxComponent } from './components/update-cash-box/update-cash-box.component';
import { DeleteCashBoxComponent } from './components/delete-cash-box/delete-cash-box.component';

const _routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'inicio', component: HomeComponent },
  { path: 'admin/productos', component: ListArticlesComponent },
  { path: 'admin/agregar-producto', component: AddArticleComponent},
  { path: 'admin/editar-producto', component: UpdateArticleComponent},
  { path: 'admin/eliminar-producto', component: DeleteArticleComponent},
  { path: 'admin/mozos', component: ListWaitersComponent },
  { path: 'admin/agregar-mozo', component: AddWaiterComponent},
  { path: 'admin/editar-mozo', component: UpdateWaiterComponent},
  { path: 'admin/eliminar-mozo', component: DeleteWaiterComponent},
  { path: 'admin/mesas', component: ListTablesComponent },
  { path: 'admin/agregar-mesa', component: AddTableComponent},
  { path: 'admin/editar-mesa', component: UpdateTableComponent},
  { path: 'admin/eliminar-mesa', component: DeleteTableComponent},
  { path: 'admin/cajas', component: ListCashBoxesComponent },
  { path: 'admin/agregar-caja', component: AddCashBoxComponent},
  { path: 'admin/editar-caja', component: UpdateCashBoxComponent},
  { path: 'admin/eliminar-caja', component: DeleteCashBoxComponent},
  { path: '**',pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(_routes)],
  exports: [RouterModule]
})

export class RoutingModule { }