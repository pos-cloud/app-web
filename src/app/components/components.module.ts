import { NgModule } from '@angular/core';
import { DatatableModule } from './datatable/datatable.module';
import { UnitOfMeasurementModule } from './unit-of-measurement/unit-of-measurement.module';
import { ExportersModule } from './export/exporters.module';
import { ApplicationModule } from './application/application.module';

@NgModule({
	imports: [
    DatatableModule,
    UnitOfMeasurementModule,
    ApplicationModule,
    ExportersModule
	],
	declarations: [
	],
})

export class ComponentsModule { }
