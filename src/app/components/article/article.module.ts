import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { NgxTinymceModule } from 'ngx-tinymce';
import { ListArticlesComponent } from './list-articles/list-articles.component';
import { ArticleService } from './article.service'
import { ArticleComponent } from './crud/article.component';
import { AddArticleTaxComponent } from './add-article-tax/add-article-tax.component';
import { LicenseGuard } from 'app/main/guards/license.guard';
import { PrintLabelComponent } from './actions/print-label/print-label.component'
import { HistoryComponent } from './actions/history/history.component';
import { PrintLabelsComponent } from './actions/print-labels/print-labels.component';

const routes: Routes = [
  {
    path: 'admin/articles',
    component: ListArticlesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/articles/:id',
    component: ListArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard]
  },
  {
    path: 'admin/article/add',
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/articles/view/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/articles/update/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard]
  }, 
   {
    path: 'admin/articles/copy/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/articles/history/:id',
    component: HistoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/articles/delete/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/variants',
    component: ListArticlesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/variants/view/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/variants/update/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/variants/delete/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/variants/history/:id',
    component: HistoryComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    DirectivesModule,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    NgxTinymceModule
  ],
  declarations: [
    ListArticlesComponent,
    ArticleComponent,
    AddArticleTaxComponent,
    PrintLabelComponent,
    HistoryComponent,
    PrintLabelsComponent,

  ],
  exports: [
    ArticleComponent,
    AddArticleTaxComponent,
    PrintLabelComponent,
    HistoryComponent
  ],
  providers: [
    ArticleService
  ]
})

export class ArticleModule { }
