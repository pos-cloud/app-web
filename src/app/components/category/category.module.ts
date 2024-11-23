import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { PipesModule } from 'app/core/pipes/pipes.module';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { NgxTinymceModule } from 'ngx-tinymce';
import { ProgressbarModule } from '../../shared/components/progressbar/progressbar.module';
import { DatatableModule } from '../datatable/datatable.module';
import { CategoryComponent } from './crud/category.component';
import { ListCategoriesComponent } from './list-categories/list-categories.component';

const routes: Routes = [
  {
    path: 'categories',
    component: ListCategoriesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'categories/add',
    component: CategoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'categories/view/:id',
    component: CategoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'categories/update/:id',
    component: CategoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'categories/delete/:id',
    component: CategoryComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
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
    NgxTinymceModule,
  ],
  declarations: [ListCategoriesComponent, CategoryComponent],
  exports: [CategoryComponent],
  providers: [],
})
export class CategoryModule {}
