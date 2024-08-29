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
import { MakeComponent } from './crud/make.component'
import { MakeService } from './make.service'
import { ListMakesComponent } from './list-makes/list-makes.component'

const routes: Routes = [
  {
    path: 'admin/makes',
    component: ListMakesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/makes/add',
    component: MakeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/makes/view/:id',
    component: MakeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/makes/update/:id',
    component: MakeComponent,
    canActivate: [AuthGuard]
  }, 
  {
    path: 'admin/makes/delete/:id',
    component: MakeComponent,
    canActivate: [AuthGuard]
  },
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
    MakeComponent,
    ListMakesComponent
  ],
  exports: [
    MakeComponent
  ],
  providers: [
    MakeService
  ]
})

export class MakeModule { }
