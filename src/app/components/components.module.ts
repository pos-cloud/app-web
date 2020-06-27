import { NgModule } from '@angular/core';
import { DatatableModule } from './datatable/datatable.module';
import { UnitOfMeasurementModule } from './unit-of-measurement/unit-of-measurement.module';
import { ExportersModule } from './export/exporters.module';
import { ApplicationModule } from './application/application.module';
import { CashBoxTypeModule } from './cash-box-type/cash-box-type.module';
import { EmployeeTypeModule } from './employee-type/employee-type.module';

@NgModule({
	imports: [
    DatatableModule,
    UnitOfMeasurementModule,
    ExportersModule,
    ApplicationModule,
    CashBoxTypeModule,
    EmployeeTypeModule
	],
	declarations: [
	],
})

export class ComponentsModule { }
