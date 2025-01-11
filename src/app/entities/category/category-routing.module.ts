import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListCategoriesComponent } from 'app/components/category/list-categories/list-categories.component';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { CategoryComponent } from './crud/category.component';

const routes: Routes = [
  {
    path: '',
    component: ListCategoriesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: CategoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: CategoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: CategoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: CategoryComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryRoutingModule {}
