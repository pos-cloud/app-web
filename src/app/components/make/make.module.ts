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
import { MakeComponent } from './crud/make.component';
import { ListMakesComponent } from './list-makes/list-makes.component';
import { MakeService } from './make.service';

const routes: Routes = [
  {
    path: 'admin/makes',
    component: ListMakesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/makes/add',
    component: MakeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/makes/view/:id',
    component: MakeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/makes/update/:id',
    component: MakeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin/makes/delete/:id',
    component: MakeComponent,
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
  declarations: [MakeComponent, ListMakesComponent],
  exports: [MakeComponent],
  providers: [MakeService],
})
export class MakeModule {}
