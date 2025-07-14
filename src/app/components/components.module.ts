import { NgModule } from '@angular/core';

import { AccountSeatModule } from './account-seat/account-seat.module';
import { ApplicationModule } from './application/application.module';
import { ArticleModule } from './article/article.module';
import { BusinessRuleModule } from './business-rules/business-rule.module';
import { CashBoxTypeModule } from './cash-box-type/cash-box-type.module';
import { CategoryModule } from './category/category.module';
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
    ApplicationModule,
    CashBoxTypeModule,
    HistoryModule,
    ShipmentMethodModule,
    TransactionTypeModule,
    CategoryModule,
    AccountSeatModule,
    ReportModule,
    BusinessRuleModule,
    ArticleModule,
  ],
  exports: [ArticleModule],
  declarations: [],
})
export class ComponentsModule {}
