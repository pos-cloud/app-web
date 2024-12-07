import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { TableComponent } from './crud/table.component';
import { ListTablesComponent } from './list/list-tables.component';
const routes: Routes = [
  {
    path: '',
    component: ListTablesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: TableComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: TableComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: TableComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: TableComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TableRoutingModule {}
