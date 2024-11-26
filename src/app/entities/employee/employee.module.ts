import { NgModule } from '@angular/core';
import { EntitiesModule } from '../entities.module';
import { EmployeeComponent } from './crud/employee.component';
import { EmployeeRoutingModule } from './employee-routing.module';
import { ListEmployeeComponent } from './list/list-employee.component';

@NgModule({
  declarations: [EmployeeComponent, ListEmployeeComponent],
  imports: [EntitiesModule, EmployeeRoutingModule],
})
export class EmployeeModule {}
