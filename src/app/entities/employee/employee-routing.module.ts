import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { EmployeeComponent } from './crud/employee.component';
import { ListEmployeeComponent } from './list/list-employee.component';

const routes: Routes = [
  {
    path: '',
    component: ListEmployeeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: EmployeeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: EmployeeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: EmployeeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: EmployeeComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmployeeRoutingModule {}
