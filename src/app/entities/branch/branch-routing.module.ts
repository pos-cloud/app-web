import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { BranchComponent } from './crud/branch.component';
import { ListBranchComponent } from './list/list-branch.component';

const routes: Routes = [
  {
    path: '',
    component: ListBranchComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: BranchComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: BranchComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: BranchComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: BranchComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchRoutingModule {}
