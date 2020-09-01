import { NgModule } from '@angular/core';
import { DatatableModule } from './datatable/datatable.module';
import { UnitOfMeasurementModule } from './unit-of-measurement/unit-of-measurement.module';
import { ExportersModule } from './export/exporters.module';
import { ApplicationModule } from './application/application.module';
import { CashBoxTypeModule } from './cash-box-type/cash-box-type.module';
import { EmployeeTypeModule } from './employee-type/employee-type.module';
import { HistoryModule } from './history/history.module';
import { ShipmentMethodModule } from './shipment-method/shipment-method.module';

@NgModule({
	imports: [
    DatatableModule,
    UnitOfMeasurementModule,
    ExportersModule,
    ApplicationModule,
    CashBoxTypeModule,
    EmployeeTypeModule,
    HistoryModule,
    ShipmentMethodModule
	],
	declarations: [
	],
})

export class ComponentsModule { }
