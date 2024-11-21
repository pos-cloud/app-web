import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { NgxTinymceModule } from 'ngx-tinymce';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { MakeService } from '../make/make.service';
import { HistoryComponent } from './actions/history/history.component';
import { PrintLabelComponent } from './actions/print-label/print-label.component';
import { PrintLabelsComponent } from './actions/print-labels/print-labels.component';
import { UpdateArticlePriceComponent } from './actions/update-article-price.ts/update-article-price.component';
import { AddArticleTaxComponent } from './add-article-tax/add-article-tax.component';
import { ArticleRoutingModule } from './article-routing.module';
import { ArticleService } from './article.service';
import { ArticleComponent } from './crud/article.component';
import { ListArticlesComponent } from './list-article/list-article.component';
//import { ListVariantsComponent } from './list-variants/list-variants.component';

@NgModule({
  declarations: [ArticleComponent, ListArticlesComponent, AddArticleTaxComponent,
    PrintLabelComponent,
    HistoryComponent,
    PrintLabelsComponent,
    UpdateArticlePriceComponent,],
  imports: [
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
    ArticleRoutingModule
  ],
  // declarations: [
  //   ListArticlesComponent,
  //  // ListVariantsComponent,
  //   ArticleComponent,
  //   AddArticleTaxComponent,
  //   PrintLabelComponent,
  //   HistoryComponent,
  //   PrintLabelsComponent,
  //   UpdateArticlePriceComponent,
  // ],
  // exports: [
  //   ArticleComponent,
  //   AddArticleTaxComponent,
  //   PrintLabelComponent,
  //   HistoryComponent,
  //   UpdateArticlePriceComponent,
  // ],
  providers: [ArticleService, MakeService],
})
export class ArticleModule {}
