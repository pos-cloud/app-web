import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard'; // Asegura que las rutas estén protegidas
import { LicenseGuard } from 'app/core/guards/license.guard';
import { HistoryComponent } from './actions/history/history.component';
import { ArticleComponent } from './crud/article.component';
import { ListArticlesComponent } from './list-article/list-article.component';

const routes: Routes = [
    {
      path: '',
      component: ListArticlesComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    {
      path: 'add',
      component: ArticleComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    {
      path: 'view/:id',
      component: ArticleComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    {
      path: 'update/:id',
      component: ArticleComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    {
      path: 'copy/:id',
      component: ArticleComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    {
      path: 'history/:id',
      component: HistoryComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    {
      path: 'delete/:id',
      component: ArticleComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    // {
    //   path: 'admin/variants',
    //   component: ListVariantsComponent,
    //   canActivate: [AuthGuard, LicenseGuard],
    // },
    {
      path: 'admin/variants/view/:id',
      component: ArticleComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    {
      path: 'admin/variants/update/:id',
      component: ArticleComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    {
      path: 'admin/variants/delete/:id',
      component: ArticleComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
    {
      path: 'admin/variants/history/:id',
      component: HistoryComponent,
      canActivate: [AuthGuard, LicenseGuard],
    },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Importa las rutas como rutas hijas del módulo
  exports: [RouterModule], // Exporta el RouterModule para que se pueda usar en el módulo principal
})
export class ArticleRoutingModule {}
