import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ListArticlesComponent } from './components/list-articles/list-articles.component';
import { AddArticleComponent } from './components/add-article/add-article.component';
import { UpdateArticleComponent } from './components/update-article/update-article.component';
import { DeleteArticleComponent } from './components/delete-article/delete-article.component';

const _routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin/list-articles', component: ListArticlesComponent },
  { path: 'admin/add-article', component: AddArticleComponent},
  { path: 'admin/update-article', component: UpdateArticleComponent},
  { path: 'admin/delete-article', component: DeleteArticleComponent},
  { path: '**',pathMatch: 'full', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(_routes)],
  exports: [RouterModule]
})

export class RoutingModule { }