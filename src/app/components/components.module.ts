import {NgModule} from '@angular/core';

import {AccountPeriodModule} from './account-period/account-period.module';
import {AccountSeatModule} from './account-seat/account-seat.module';
import {AccountModule} from './account/account.module';
import {ApplicationModule} from './application/application.module';
import {BusinessRuleModule} from './business-rules/business-rule.module';
import {CashBoxTypeModule} from './cash-box-type/cash-box-type.module';
import {CategoryModule} from './category/category.module';
import {CompanyGroupModule} from './company-group/company-group.module';
import {DatatableModule} from './datatable/datatable.module';
import {EmployeeTypeModule} from './employee-type/employee-type.module';
import {ExportersModule} from './export/exporters.module';
import {HistoryModule} from './history/history.module';
import {HolidayModule} from './holiday/holiday.module';
import {PermissionModule} from './permission/permission.module';
import {ReportModule} from './report/report.module';
import {ShipmentMethodModule} from './shipment-method/shipment-method.module';
import {TransactionTypeModule} from './transaction-type/transaction-type.module';
import {UnitOfMeasurementModule} from './unit-of-measurement/unit-of-measurement.module';
import {VariantValueModule} from './variant-value/variant-value.module';
import { ReportsModule } from './reports/reports.module';

@NgModule({
  imports: [
    DatatableModule,
    UnitOfMeasurementModule,
    ExportersModule,
    ApplicationModule,
    PermissionModule,
    CashBoxTypeModule,
    EmployeeTypeModule,
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
    ReportsModule
  ],
  declarations: [],
})
export class ComponentsModule {}
