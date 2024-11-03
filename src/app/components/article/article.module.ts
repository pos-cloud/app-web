import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { LicenseGuard } from 'app/core/guards/license.guard';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { NgxTinymceModule } from 'ngx-tinymce';
import { DatatableModule } from '../datatable/datatable.module';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { HistoryComponent } from './actions/history/history.component';
import { PrintLabelComponent } from './actions/print-label/print-label.component';
import { PrintLabelsComponent } from './actions/print-labels/print-labels.component';
import { UpdateArticlePriceComponent } from './actions/update-article-price/update-article-price.component';
import { AddArticleTaxComponent } from './add-article-tax/add-article-tax.component';
import { ArticleService } from './article.service';
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
    NgxTinymceModule,
  ],
  declarations: [
    ListArticlesComponent,
    ListVariantsComponent,
    ArticleComponent,
    AddArticleTaxComponent,
    PrintLabelComponent,
    HistoryComponent,
    PrintLabelsComponent,
    UpdateArticlePriceComponent,
  ],
  exports: [
    ArticleComponent,
    AddArticleTaxComponent,
    PrintLabelComponent,
    HistoryComponent,
    UpdateArticlePriceComponent,
  ],
  providers: [ArticleService],
})
export class ArticleModule {}
