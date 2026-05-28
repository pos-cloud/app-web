import { NgModule } from '@angular/core';

import { ArticleModule } from './article/article.module';
import { DatatableModule } from './datatable/datatable.module';
import { ExportersModule } from './export/exporters.module';
import { HistoryModule } from './history/history.module';
import { ReportModule } from './report/report.module';
import { ShipmentMethodModule } from './shipment-method/shipment-method.module';
import { TransactionTypeModule } from './transaction-type/transaction-type.module';

@NgModule({
  imports: [
    DatatableModule,
    ExportersModule,
    HistoryModule,
    ShipmentMethodModule,
    TransactionTypeModule,
    ReportModule,
    ArticleModule,
  ],
  exports: [ArticleModule],
  declarations: [],
})
export class ComponentsModule {}
