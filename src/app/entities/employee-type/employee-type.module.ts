import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { EmployeeTypeComponent } from './crud/employee-type.component';
import { EmployeeTypeRoutingModule } from './employee-type.routing.module';
import { ListEmployeeTypesComponent } from './list-employee-types/list-employee-types.component';

@NgModule({
  declarations: [EmployeeTypeComponent, ListEmployeeTypesComponent],
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
    EmployeeTypeRoutingModule,
  ],
})
export class EmployeeTypeModule {}
