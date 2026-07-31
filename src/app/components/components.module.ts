import { NgModule } from '@angular/core';

import { ArticleModule } from './article/article.module';
import { DatatableModule } from './datatable/datatable.module';
import { HistoryModule } from './history/history.module';
import { ReportModule } from './report/report.module';

@NgModule({
  imports: [DatatableModule, HistoryModule, ReportModule, ArticleModule],
  exports: [ArticleModule],
  declarations: [],
})
export class ComponentsModule {}
