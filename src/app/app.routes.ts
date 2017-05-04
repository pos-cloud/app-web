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
  { path: 'home', component: HomeComponent },
  { path: 'admin/list-articles', component: ListArticlesComponent },
  { path: 'admin/add-article', component: AddArticleComponent},
  { path: 'admin/update-article', component: UpdateArticleComponent},
  { path: 'admin/delete-article', component: DeleteArticleComponent},
  { path: 'admin/list-waiters', component: ListWaitersComponent },
  { path: 'admin/add-waiter', component: AddWaiterComponent},
  { path: 'admin/update-waiter', component: UpdateWaiterComponent},
  { path: 'admin/delete-waiter', component: DeleteWaiterComponent},
  { path: 'admin/list-tables', component: ListTablesComponent },
  { path: 'admin/add-table', component: AddTableComponent},
  { path: 'admin/update-table', component: UpdateTableComponent},
  { path: 'admin/delete-table', component: DeleteTableComponent},
  { path: 'admin/list-cash-boxes', component: ListCashBoxesComponent },
  { path: 'admin/add-cash-box', component: AddCashBoxComponent},
  { path: 'admin/update-cash-box', component: UpdateCashBoxComponent},
  { path: 'admin/delete-cash-box', component: DeleteCashBoxComponent},
  { path: '**',pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(_routes)],
  exports: [RouterModule]
})

export class RoutingModule { }