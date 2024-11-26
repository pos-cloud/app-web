import { NgModule } from '@angular/core';
import { EntitiesModule } from '../entities.module';
import { EmployeeTypeComponent } from './crud/employee-type.component';
import { EmployeeTypeRoutingModule } from './employee-type.routing.module';
import { ListEmployeeTypesComponent } from './list/list-employee-types.component';

@NgModule({
  declarations: [EmployeeTypeComponent, ListEmployeeTypesComponent],
  imports: [EntitiesModule, EmployeeTypeRoutingModule],
})
export class EmployeeTypeModule {}
