import { NgModule } from '@angular/core';

import { AccountPeriodModule } from './account-period/account-period.module';
import { AccountSeatModule } from './account-seat/account-seat.module';
import { AccountModule } from './account/account.module';
import { ApplicationModule } from './application/application.module';
import { ArticleModule } from './article/article.module';
import { BusinessRuleModule } from './business-rules/business-rule.module';
import { CashBoxTypeModule } from './cash-box-type/cash-box-type.module';
import { CategoryModule } from './category/category.module';
import { CompanyGroupModule } from './company-group/company-group.module';
import { DatatableModule } from './datatable/datatable.module';
import { ExportersModule } from './export/exporters.module';
import { HistoryModule } from './history/history.module';
import { HolidayModule } from './holiday/holiday.module';
import { PermissionModule } from './permission/permission.module';
import { ReportModule } from './report/report.module';
import { ShipmentMethodModule } from './shipment-method/shipment-method.module';
import { TransactionTypeModule } from './transaction-type/transaction-type.module';
import { VariantValueModule } from './variant-value/variant-value.module';

@NgModule({
  imports: [
    DatatableModule,
    ExportersModule,
    ApplicationModule,
    PermissionModule,
    CashBoxTypeModule,
    HistoryModule,
    ShipmentMethodModule,
    HolidayModule,
    TransactionTypeModule,
    CategoryModule,
    CompanyGroupModule,
    AccountModule,
    AccountPeriodModule,
    AccountSeatModule,
    VariantValueModule,
    ReportModule,
    BusinessRuleModule,
    ArticleModule,
  ],
  exports: [ArticleModule],
  declarations: [],
})
export class ComponentsModule {}
