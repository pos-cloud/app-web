import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { LicenseGuard } from 'app/core/guards/license.guard';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { QuillModule } from 'ngx-quill';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { DatatableModule } from '../datatable/datatable.module';
import { HistoryComponent } from './actions/history/history.component';
import { UpdateArticlePriceComponent } from './actions/update-article-price/update-article-price.component';
import { AddArticleTaxComponent } from './add-article-tax/add-article-tax.component';
import { ArticleComponent } from './crud/article.component';
import { ListArticlesComponent } from './list-articles/list-articles.component';
import { ListVariantsComponent } from './list-variants/list-variants.component';

const routes: Routes = [
  {
    path: 'admin/articles',
    component: ListArticlesComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/articles/add',
    component: ArticleComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/articles/view/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/articles/update/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/articles/copy/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/articles/history/:id',
    component: HistoryComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/articles/delete/:id',
    component: ArticleComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
  {
    path: 'admin/variants',
    component: ListVariantsComponent,
    canActivate: [AuthGuard, LicenseGuard],
  },
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
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    FocusDirective,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    QuillModule,
  ],
  declarations: [
    ListArticlesComponent,
    ListVariantsComponent,
    ArticleComponent,
    AddArticleTaxComponent,
    HistoryComponent,
    UpdateArticlePriceComponent,
  ],
  exports: [ArticleComponent, AddArticleTaxComponent, HistoryComponent, UpdateArticlePriceComponent],
  providers: [],
})
export class ArticleModule {}
