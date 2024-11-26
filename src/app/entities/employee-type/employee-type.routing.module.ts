import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { EmployeeTypeComponent } from './crud/employee-type.component';
import { ListEmployeeTypesComponent } from './list-employee-types/list-employee-types.component';

const routes: Routes = [
  {
    path: '',
    component: ListEmployeeTypesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: EmployeeTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: EmployeeTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: EmployeeTypeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: EmployeeTypeComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeTypeRoutingModule {}
