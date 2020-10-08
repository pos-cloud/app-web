import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination'; // https://www.npmjs.com/package/ngx-pagination
import { DirectivesModule } from 'app/main/directives/directives.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ProgressbarModule } from '../progressbar/progressbar.module';
import { AuthGuard } from 'app/main/guards/auth.guard';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatatableModule } from '../datatable/datatable.module';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from 'app/main/pipes/pipes.module';
import { NgxTinymceModule } from 'ngx-tinymce';
import { ListCategoriesComponent } from './list-categories/list-categories.component';
import { CategoryService } from './category.service';
import { CategoryComponent } from './crud/category.component';

const routes: Routes = [
  {
    path: 'categories',
    component: ListCategoriesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories/add',
    component: CategoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories/view/:id',
    component: CategoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories/update/:id',
    component: CategoryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories/delete/:id',
    component: CategoryComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    DirectivesModule,
    DragDropModule,
    ProgressbarModule,
    PipesModule,
    TranslateModule,
    NgbDropdownModule,
    NgbModule,
    DatatableModule,
    NgxTinymceModule
  ],
  declarations: [
    ListCategoriesComponent,
    CategoryComponent
  ],
  exports: [
    CategoryComponent
  ],
  entryComponents: [
    CategoryComponent
  ],
  providers: [
    CategoryService
  ]
})

export class CategoryModule { }
