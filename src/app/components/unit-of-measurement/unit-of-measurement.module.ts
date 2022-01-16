import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUnitOfMeasurementsComponent } from './list-units-of-measurement/list-units-of-measurement.component';
import { UnitOfMeasurementComponent } from './crud/unit-of-measurement.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { UnitOfMeasurementService } from './unit-of-measurement.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';

const routes: Routes = [
  {
    path: 'units-of-measurement',
    component: ListUnitOfMeasurementsComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        DirectivesModule,
        DragDropModule,
        ProgressbarModule,
        PipesModule,
        TranslateModule,
        NgbDropdownModule,
        NgbModule,
        DatatableModule
    ],
    declarations: [
        ListUnitOfMeasurementsComponent,
        UnitOfMeasurementComponent
    ],
    exports: [
        UnitOfMeasurementComponent
    ],
    providers: [
        UnitOfMeasurementService
    ]
})

export class UnitOfMeasurementModule { }
