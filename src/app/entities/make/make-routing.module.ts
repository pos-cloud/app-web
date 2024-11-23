import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { MakeComponent } from './crud/make.component';
import { ListMakesComponent } from './list/list-makes.component';

const routes: Routes = [
  {
    path: '',
    component: ListMakesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: MakeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: MakeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: MakeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: MakeComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MakeRoutingModule {}
